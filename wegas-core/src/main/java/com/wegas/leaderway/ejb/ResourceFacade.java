/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.leaderway.ejb;

import com.wegas.core.ejb.VariableInstanceFacade;
import com.wegas.core.persistence.game.Player;
import com.wegas.leaderway.persistence.ResourceInstance;
import com.wegas.leaderway.persistence.TaskInstance;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class ResourceFacade {

    /**
     *
     */
    @EJB
    private VariableInstanceFacade variableInstanceFacade;

    /**
     *
     * @param resourceInstance
     * @param startTime
     * @param task
     */
    public void assign(ResourceInstance resourceInstance, TaskInstance taskInstance) {
        resourceInstance.assign(taskInstance);
    }

    public void assign(Player p, Long resourceDescriptorId, Long taskDescriptorId) {
        this.assign((ResourceInstance) variableInstanceFacade.find(resourceDescriptorId, p),
                (TaskInstance) variableInstanceFacade.find(taskDescriptorId, p));
    }
}
