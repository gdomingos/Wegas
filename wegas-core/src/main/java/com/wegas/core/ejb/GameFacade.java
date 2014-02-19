/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.ejb;

import com.wegas.core.exception.PersistenceException;
import com.wegas.core.exception.WegasException;
import com.wegas.core.persistence.game.*;
import static com.wegas.core.persistence.game.Game.GameAccess.OPEN;
import com.wegas.core.security.ejb.RoleFacade;
import com.wegas.core.security.ejb.UserFacade;
import com.wegas.core.security.guest.GuestJpaAccount;
import com.wegas.core.security.persistence.User;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.swing.text.StyledEditorKit;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class GameFacade extends AbstractFacadeImpl<Game> {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(GameFacade.class);
    /**
     *
     */
    @EJB
    private GameModelFacade gameModelFacade;
    /**
     *
     */
    @EJB
    private RoleFacade roleFacade;
    /**
     *
     */
    @EJB
    private TeamFacade teamFacade;
    /**
     *
     */
    @EJB
    private UserFacade userFacade;
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
     * @param gameModelId
     * @param game
     */
    public void publishAndCcreate(final Long gameModelId, final Game game) throws IOException {
        GameModel gm = gameModelFacade.duplicate(gameModelId);
        gm.setName(gameModelFacade.find(gameModelId).getName());// @HACK Set name back to the original
        gm.setTemplate(false);
        this.create(gm, game);
    }

    public void create(final Long gameModelId, final Game game) {
        this.create(gameModelFacade.find(gameModelId), game);
    }

    public void create(final GameModel gameModel, final Game game) {
        if (this.findByToken(game.getToken()) != null) {
            //  || teamFacade.findByToken(game.getToken()) != null) {
            throw new WegasException("This token is already in use.");
        }

        final User currentUser = userFacade.getCurrentUser();
        game.setCreatedBy(!(currentUser.getMainAccount() instanceof GuestJpaAccount) ? currentUser : null); // @hack @fixme, guest are not stored in the db so link wont work
        game.setToken(this.createUniqueEnrolmentkey(game));
        gameModel.addGame(game);
        gameModelFacade.reset(gameModel);                                       // Reset the game so the default player will have instances

        userFacade.addAccountPermission(currentUser.getMainAccount(),
                "Game:View,Edit:g" + game.getId());                             // Grant permission to creator
        userFacade.addAccountPermission(currentUser.getMainAccount(),
                "Game:View:g" + game.getId());                                  // Grant play to creator

        try {                                                                   // By default games can be join w/ token
            roleFacade.findByName("Public").addPermission("Game:Token:g" + game.getId());
        } catch (PersistenceException ex) {
            logger.error("Unable to find Role: Public", ex);
        }
    }

    public String createUniqueEnrolmentkey(Game game) {
        String prefixKey = game.getName();
        boolean foundUniqueKey = false;
        if (prefixKey.length() > 11) {
            prefixKey = prefixKey.substring(0, 11);
        }
        prefixKey = prefixKey.toLowerCase().replace(" ", "-");

        while (!foundUniqueKey) {
            boolean foundedGameAccountKey = true;
            boolean foundedGameEnrolentKey = true;
            try {
                this.findGameAccountKey(prefixKey);
            } catch (Exception e) {
                foundedGameAccountKey = false;
            }
            try {
                this.findGameEnrolmentKey(prefixKey);
            } catch (Exception e) {
                foundedGameEnrolentKey = false;
            }
            Game foundGameByToken = this.findByToken(prefixKey);
            if (!foundedGameEnrolentKey && !foundedGameAccountKey && foundGameByToken == null) {
                return prefixKey;
            }
        }
        return null;
    }

    @Override
    public Game update(final Long entityId, final Game entity) {
        if ((this.findByToken(entity.getToken()) != null
                && this.findByToken(entity.getToken()).getId().compareTo(entity.getId()) != 0)) {
            //|| teamFacade.findByToken(entity.getToken()) != null) {
            throw new WegasException("This token is already in use.");
        }
        return super.update(entityId, entity);
    }

    @Override
    public void remove(final Game entity) {
        if (entity.getGameModel().getGames().size() <= 1
                && !(entity.getGameModel().getGames().get(0) instanceof DebugGame)) {// This is for retrocompatibility w/ game models that do not habe DebugGame
            gameModelFacade.remove(entity.getGameModel());
        }
        for (Team t : entity.getTeams()) {
            teamFacade.remove(t);
        }
        super.remove(entity);

        userFacade.deleteAccountPermissionByInstance("g" + entity.getId());
        userFacade.deleteRolePermissionsByInstance("g" + entity.getId());
    }

    public void checkKey(final Game game, final String key) throws Exception {
        switch (game.getAccess()) {
            case CLOSE:
                throw new Exception("This game does not accept new players");   // There user is already registered to target game

            case OPEN:
            case URL:
                break;

            case ENROLMENTKEY:
                if (!game.getToken().equals(key)) {
                    throw new Exception("The provided key does not match");     // There user is already registered to target game
                }
                break;

            case SINGLEUSAGEENROLMENTKEY:
                for (GameEnrolmentKey eKey : game.getKeys()) {
                    if (eKey.getKey().equals(key)) {
                        break;
                    }
                }
                throw new Exception("The provided key does not match");         // There user is already registered to target game
        }
    }
    // @TODO based on gameToken
    public Game createGameAccount(final Game game, final Long accountNumber) {

        return game;
    }

    /**
     * Search for a game with token
     *
     * @param token
     * @return first game found or null
     */
    public Game findByToken(final String token) {
        final CriteriaBuilder cb = em.getCriteriaBuilder();
        final CriteriaQuery cq = cb.createQuery();
        final Root<Game> game = cq.from(Game.class);
        cq.where(cb.equal(game.get(Game_.token), token));
        Query q = em.createQuery(cq);
        try {
            return (Game) q.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    public GameEnrolmentKey findGameEnrolmentKey(final String key) {
        final CriteriaBuilder cb = em.getCriteriaBuilder();
        final CriteriaQuery cq = cb.createQuery();
        final Root<GameEnrolmentKey> game = cq.from(GameEnrolmentKey.class);
        cq.where(cb.equal(game.get(GameEnrolmentKey_.key), key));
        Query q = em.createQuery(cq);
        return (GameEnrolmentKey) q.getSingleResult();
    }

    private GameAccountKey findGameAccountKey(String key) {
        final CriteriaBuilder cb = em.getCriteriaBuilder();
        final CriteriaQuery cq = cb.createQuery();
        final Root<GameAccountKey> gameAccount = cq.from(GameAccountKey.class);
        cq.where(cb.equal(gameAccount.get(GameAccountKey_.key), key));
        Query q = em.createQuery(cq);
        return (GameAccountKey) q.getSingleResult();
    }

    public List<Game> findByGameModelId(final Long gameModelId, final String orderBy) {
        final Query getByGameId =
                em.createQuery("SELECT game FROM Game game "
                + "WHERE game.gameModel.id = :gameModelId ORDER BY game.createdTime DESC");

        GameModel gm = new GameModel();
        gm.getGames();
        getByGameId.setParameter("gameModelId", gameModelId);
        //getByGameId.setParameter("orderBy", orderBy);
        return getByGameId.getResultList();
    }

    /**
     *
     * @return
     */
    public List<Game> findAll(final String orderBy) {
        final Query getByGameId = em.createQuery("SELECT game FROM Game game ORDER BY game.createdTime ASC");
        //getByGameId.setParameter("orderBy", orderBy);
        return getByGameId.getResultList();
    }

    public List<Game> findRegisteredGames(final Long userId) {
        final Query getByGameId =
                em.createQuery("SELECT game, p FROM Game game "
                + "LEFT JOIN game.teams t LEFT JOIN  t.players p "
                + "WHERE t.gameId = game.id AND p.teamId = t.id "
                + "AND p.user.id = :userId "
                + "ORDER BY p.joinTime ASC");
        getByGameId.setParameter("userId", userId);

        return this.findRegisterdGames(getByGameId);
    }

    public List<Game> findRegisteredGames(final Long userId, final Long gameModelId) {
        final Query getByGameId =
                em.createQuery("SELECT game, p FROM Game game "
                + "LEFT JOIN game.teams t LEFT JOIN  t.players p "
                + "WHERE t.gameId = game.id AND p.teamId = t.id AND p.user.id = :userId AND game.gameModel.id = :gameModelId "
                + "ORDER BY p.joinTime ASC");
        getByGameId.setParameter("userId", userId);
        getByGameId.setParameter("gameModelId", gameModelId);

        return this.findRegisterdGames(getByGameId);
    }

    private List<Game> findRegisterdGames(final Query q) {
        final List<Game> games = new ArrayList<>();
        for (Object ret : q.getResultList()) {                                // @hack Replace created time by player joined time
            final Object[] r = (Object[]) ret;
            final Game game = (Game) r[0];
            this.em.detach(game);
            game.setCreatedTime(((Player) r[1]).getJoinTime());
            games.add(game);
        }
        return games;
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
