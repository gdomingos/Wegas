/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.messaging.rest;

import com.wegas.core.ejb.VariableDescriptorFacade;
import com.wegas.core.rest.AbstractRestController;
import com.wegas.messaging.ejb.MessageFacade;
import com.wegas.messaging.persistence.InboxDescriptor;
import com.wegas.messaging.persistence.InboxInstance;
import com.wegas.messaging.persistence.Message;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@Path("GameModel/{gameModelId : [1-9][0-9]*}/VariableDescriptor/Inbox/")
public class InboxDescriptorController extends AbstractRestController<VariableDescriptorFacade, InboxDescriptor> {
    /*
     *
     */

    @EJB
    private VariableDescriptorFacade inboxDescriptorFacade;
    /**
     *
     */
    @EJB
    private MessageFacade messageFacade;

    /**
     *
     * @return
     */
    @Override
    protected VariableDescriptorFacade getFacade() {
        return this.inboxDescriptorFacade;
    }

    @GET
    @Path("Message/{messageId : [1-9][0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Message find(@PathParam("messageId") Long messageId) {
        return messageFacade.find(messageId);
    }

    /**
     *
     * @param messageId
     * @param message
     * @return
     */
    @PUT
    @Path("Message/{messageId : [1-9][0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public InboxInstance editMessage(@PathParam("messageId") Long messageId,
            Message message) {
        Message update = messageFacade.update(messageId, message);
        return update.getMailboxInstanceEntity();
    }
    /**
     * 
     * @param messageId
     * @return
     */
    @PUT
    @Path("Message/Read/{messageId : [1-9][0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public InboxInstance readMessage(@PathParam("messageId") Long messageId) {
        Message update = messageFacade.find(messageId);
        update.setUnread(false);
        return update.getMailboxInstanceEntity();
    }

    @DELETE
    @Path("Message/{messageId : [1-9][0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Message deleteMessage(@PathParam("messageId") Long messageId) {
        Message m = messageFacade.find(messageId);
        messageFacade.remove(m);
        return m;
    }
}
