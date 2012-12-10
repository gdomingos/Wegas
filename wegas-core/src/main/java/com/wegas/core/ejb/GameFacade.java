/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.ejb;

import com.wegas.core.ejb.exception.PersistenceException;
import com.wegas.core.persistence.game.Game;
import com.wegas.core.persistence.game.GameModel;
import com.wegas.core.persistence.game.Game_;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class GameFacade extends AbstractFacadeImpl<Game> {

    /**
     *
     */
    @EJB
    private GameModelFacade gameModelEntityFacade;
    /**
     *
     */
    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;

    /**
     *
     */
    public GameFacade() {
        super(Game.class);
    }

    /**
     *
     * @param token
     * @return
     */
    public Game findByToken(String token)
            throws PersistenceException {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery cq = cb.createQuery();
        Root<Game> game = cq.from(Game.class);
        cq.where(cb.equal(game.get(Game_.token), token));
        Query q = em.createQuery(cq);
        return (Game) q.getResultList().get(0);                                     // If there is more than one game with this token, use the 1st one
        //return (Game) q.getSingleResult();
    }

    /**
     *
     * @param gameModelId
     * @param game
     */
    public void create(Long gameModelId, Game game) {
        GameModel gameModel = gameModelEntityFacade.find(gameModelId);
        gameModel.addGame(game);
        super.create(game);
    }

    /**
     *
     * @return
     */
    @Override
    public EntityManager getEntityManager() {
        return em;
    }
}