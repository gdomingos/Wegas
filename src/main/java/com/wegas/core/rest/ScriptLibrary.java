/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.rest;

import com.wegas.core.ejb.GameModelFacade;
import com.wegas.core.persistence.game.GameModel;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.script.ScriptException;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@Path("GameModel/{gameModelId : [1-9][0-9]*}/ScriptLibrary/")
public class ScriptLibrary {

    /**
     *
     */
    @EJB
    private GameModelFacade gameModelFacade;

    /**
     *
     * @param playerId
     * @param script
     * @return p
     * @throws ScriptException
     */
    @POST
    @Path("{scriptKey : [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public GameModel edit(@PathParam("gameModelId") Long gameModelId,
            @PathParam("scriptKey") String scriptKey, String script) {

        GameModel gameModel = gameModelFacade.find(gameModelId);
        gameModel.getScriptLibrary().put(scriptKey, script);
        // return Response.ok().build();
        return gameModel;
    }

    @DELETE
    @Path("{scriptKey : [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public GameModel delete(@PathParam("gameModelId") Long gameModelId,
            @PathParam("scriptKey") String scriptKey) {

        GameModel gameModel = gameModelFacade.find(gameModelId);
        gameModel.getScriptLibrary().remove(scriptKey);
        return gameModel;
    }
}