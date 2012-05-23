/*
 * Wegas.
 *
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.rest;

import com.sun.jersey.multipart.FormDataBodyPart;
import com.sun.jersey.multipart.FormDataParam;
import com.wegas.core.content.*;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.Stateless;
import javax.jcr.ItemExistsException;
import javax.jcr.LoginException;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
@Stateless
@Path("File{gameModelId : (/GameModelId/[1-9][0-9]*)?}")
public class FileController {

    static final private org.slf4j.Logger logger = LoggerFactory.getLogger(FileController.class);

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("upload{directory : .*?}")
    public FileDescriptor upload(@PathParam("gameModelId") String gameModelId,
            @FormDataParam("name") String name,
            @PathParam("directory") String path,
            @FormDataParam("file") InputStream file,
            @FormDataParam("file") FormDataBodyPart details) {
        logger.debug("Trying to write to (/{})", path);
        ContentConnector connector;
        try {
            connector = ContentConnectorFactory.getContentConnectorFromGameModel(extractGameModelId(gameModelId));
        } catch (LoginException ex) {
            logger.error("Need to check those errors", ex);
            return null;
        } catch (RepositoryException ex) {
            logger.error("Need to check those errors", ex);
            return null;
        }
        try {
            AbstractContentDescriptor dir = DescriptorFactory.getDescriptor(path, connector);
            FileDescriptor detachedFile = new FileDescriptor(name, path, connector);
            if (dir.exist() && !detachedFile.exist()) {                         //Append a node to an existing "directory" only and file should not exist

                try {
                    detachedFile.setBase64Data(file, details.getMediaType().toString());
                    logger.info(details.getFormDataContentDisposition().getFileName() + "(" + details.getMediaType() + ") uploaded as \"" + name + "\"");
                    return detachedFile;
                } catch (IOException ex) {
                    logger.error("Error reading uploaded file :", ex);
                }
            } else {
                logger.debug("File already exists or parent directory does not exist");
            }
        } catch (RepositoryException ex) {
            logger.error("Need to check those errors", ex);
        }
        return null;
    }

    @GET
    @Path("read{absolutePath : .*?}")
    public Response read(@PathParam("gameModelId") String gameModelId, @PathParam("absolutePath") String name) {
        logger.debug("Asking file (/{})", name);
        AbstractContentDescriptor fileDescriptor;
        Response.ResponseBuilder response = Response.status(404);
        try {
            ContentConnector connector = ContentConnectorFactory.getContentConnectorFromGameModel(extractGameModelId(gameModelId));
            fileDescriptor = DescriptorFactory.getDescriptor(name, connector);
        } catch (PathNotFoundException e) {
            logger.debug("Asked path does not exist: {}", e.getMessage());
            return response.build();
        } catch (RepositoryException e) {
            logger.error("Need to check those errors", e);
            return response.build();
        }
        if (fileDescriptor instanceof FileDescriptor) {
            response = Response.ok(((FileDescriptor) fileDescriptor).getBase64Data()).header("Content-Type", fileDescriptor.getMimeType());
            try {
                ((FileDescriptor) fileDescriptor).getBase64Data().close();
            } catch (IOException ex) {
                Logger.getLogger(FileController.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return response.build();
    }

    @GET
    @Path("list{absoluteDirectoryPath : .*?}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<AbstractContentDescriptor> listDirectory(@PathParam("gameModelId") String gameModelId, @PathParam("absoluteDirectoryPath") String directory) {
        logger.debug("Asking listing for directory (/{})", directory);
        try {
            ContentConnector connector = ContentConnectorFactory.getContentConnectorFromGameModel(extractGameModelId(gameModelId));
            AbstractContentDescriptor dir = DescriptorFactory.getDescriptor(directory, connector);
            if (!dir.exist() || dir instanceof FileDescriptor) {
                return null;
            } else if (dir instanceof DirectoryDescriptor) {
                return ((DirectoryDescriptor) dir).list();
            }
        } catch (LoginException ex) {
            Logger.getLogger(FileController.class.getName()).log(Level.SEVERE, null, ex);
        } catch (RepositoryException ex) {
            Logger.getLogger(FileController.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    @DELETE
    @Path("{force: (force/)?}delete{absolutePath : .*?}")
    @Produces(MediaType.APPLICATION_JSON)
    public Object delete(@PathParam("gameModelId") String gameModelId,
            @PathParam("absolutePath") String absolutePath,
            @PathParam("force") String force) {

        boolean recursive = force.equals("") ? false : true;
        logger.debug("Asking delete for node ({}), force {}", absolutePath, recursive);
        try {
            ContentConnector connector = ContentConnectorFactory.getContentConnectorFromGameModel(extractGameModelId(gameModelId));
            AbstractContentDescriptor descriptor = DescriptorFactory.getDescriptor(absolutePath, connector);
            if (descriptor.exist()) {
                descriptor.sync();
                if (descriptor instanceof DirectoryDescriptor && ((DirectoryDescriptor) descriptor).isRootDirectory()) {
                    return Response.notModified("Unable to erase Root Directory").build();
                }
                try {
                    descriptor.delete(recursive);
                } catch (ItemExistsException e) {
                    return Response.notModified(e.getMessage()).build();
                }
                return descriptor;
            } else {
                return Response.notModified("Path" + absolutePath + " does not exist").build();
            }
        } catch (RepositoryException ex) {
            logger.error("Really what append here ??", ex);
        }
        return null;
    }

    /**
     * Well... underlying function not yet implemented do it by hand for now
     */
    @DELETE
    @Path("destruct")
    public void deleteWorkspace(@PathParam("gameModelId") String gameModelId) {
        try {
            ContentConnector fileManager = ContentConnectorFactory.getContentConnectorFromGameModel(extractGameModelId(gameModelId));
            fileManager.deleteWorkspace();
        } catch (LoginException ex) {
            Logger.getLogger(FileController.class.getName()).log(Level.SEVERE, null, ex);
        } catch (RepositoryException ex) {
            Logger.getLogger(FileController.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Converts a path gameModelId representation to a Long gameModelId
     *
     * @param pathGMId a string representing the game model id "/.../{id}"
     * @return Long - the game model id extracted from the input string
     */
    private static Long extractGameModelId(String pathGMId) {
        return pathGMId.equals("") ? null : new Long(pathGMId.split("/")[2]);
    }
}