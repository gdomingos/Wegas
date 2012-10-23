/*
 * Wegas
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
import javax.ws.rs.Path;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@Path("GameModel")
public class GameModelController extends AbstractRestController<GameModelFacade, GameModel> {

    private static final Logger logger = LoggerFactory.getLogger(GameModelController.class);
    /**
     *
     */
    @EJB
    private GameModelFacade gameModelFacade;

    /**
     *
     * @return
     */
    @Override
    protected GameModelFacade getFacade() {
        return gameModelFacade;
    }

    @Override
    public GameModel create(GameModel entity) {
        // logger.info(Level.INFO, "POST GameModel");
        Subject s = SecurityUtils.getSubject();
        s.checkPermission("GameModel:Create");

        return super.create(entity);
    }

    @Override
    public GameModel update(Long entityId, GameModel entity) {

        Subject s = SecurityUtils.getSubject();
        s.checkPermission("GameModel:Edit:" + entityId);

        return super.update(entityId, entity);
    }
}
