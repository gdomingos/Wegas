/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.messaging.ejb;

import com.wegas.core.ejb.AbstractFacadeImpl;
import com.wegas.core.ejb.VariableDescriptorFacade;
import com.wegas.core.persistence.game.PlayerEntity;
import com.wegas.core.persistence.variable.VariableDescriptorEntity;
import com.wegas.messaging.persistence.variable.InboxInstanceEntity;
import com.wegas.messaging.persistence.variable.MessageEntity;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.event.Observes;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class InGameMailFacade extends AbstractFacadeImpl<MessageEntity> {

    final static private Logger logger = LoggerFactory.getLogger(InGameMailFacade.class);
    /**
     *
     */
    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;
    /**
     *
     */
    @EJB
    private VariableDescriptorFacade variableDescriptorFacade;

    /**
     *
     * @param entityClass
     */
    public InGameMailFacade() {
        super(MessageEntity.class);
    }

    /**
     *
     * @param messageEvent
     */
    public void listener(@Observes MessageEvent messageEvent) {
        logger.info("Message received for player {}.", messageEvent.getPlayer());
        this.send(messageEvent.getPlayer(), messageEvent.getMessage());
    }

    /**
     *
     * @param p
     * @param msg
     */
    public void send(PlayerEntity p, MessageEntity msg) {
        VariableDescriptorEntity vd = variableDescriptorFacade.findByName(p.getGameModel(), "inbox");
        InboxInstanceEntity inbox = (InboxInstanceEntity) vd.getVariableInstance(p);
        inbox.addMessage(msg);
    }

    /**
     *
     * @param p
     * @param subject
     * @param body
     */
    public void send(PlayerEntity p, String subject, String body) {
        MessageEntity msg = new MessageEntity();
        msg.setName(subject);
        msg.setBody(body);
        this.send(p, msg);
    }

    @Override
    protected EntityManager getEntityManager() {
        return this.em;
    }
}