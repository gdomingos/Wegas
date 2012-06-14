/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.persistence.variable;

import com.wegas.core.ejb.Helper;
import com.wegas.core.ejb.VariableInstanceFacade;
import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.variable.primitive.NumberInstance;
import com.wegas.core.persistence.variable.primitive.StringInstance;
import com.wegas.core.persistence.variable.scope.AbstractScope;
import com.wegas.core.persistence.variable.statemachine.StateMachineInstance;
import com.wegas.leadergame.persistence.ResourceInstance;
import com.wegas.leadergame.persistence.TaskInstance;
import com.wegas.mcq.persistence.ChoiceInstance;
import com.wegas.mcq.persistence.QuestionInstance;
import com.wegas.messaging.persistence.variable.InboxInstance;
import javax.naming.NamingException;
import javax.persistence.*;
import javax.xml.bind.annotation.XmlTransient;
import org.codehaus.jackson.annotate.JsonSubTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
//@EntityListeners({VariableInstancePersistenceListener.class})
@JsonSubTypes(value = {
    @JsonSubTypes.Type(name = "StringInstance", value = StringInstance.class),
    @JsonSubTypes.Type(name = "ListInstance", value = ListInstance.class),
    @JsonSubTypes.Type(name = "NumberInstance", value = NumberInstance.class),
    @JsonSubTypes.Type(name = "InboxInstance", value = InboxInstance.class),
    @JsonSubTypes.Type(name = "FSMInstance", value = StateMachineInstance.class),
    @JsonSubTypes.Type(name = "QuestionInstance", value = QuestionInstance.class),
    @JsonSubTypes.Type(name = "ChoiceInstance", value = ChoiceInstance.class),
    @JsonSubTypes.Type(name = "ResourceInstance", value = ResourceInstance.class),
    @JsonSubTypes.Type(name = "TaskInstance", value = TaskInstance.class)
})
//@JsonIgnoreProperties(value={"descriptorId"})
abstract public class VariableInstance extends AbstractEntity {

    private static final long serialVersionUID = 1L;
    private static final Logger logger = LoggerFactory.getLogger(VariableInstance.class);
    /**
     *
     */
    @Id
    @Column(name = "variableinstance_id")
    @GeneratedValue
    private Long id;
    /**
     *
     */
    @ManyToOne
    @XmlTransient
    private AbstractScope scope;

    /**
     *
     * @return
     */
    @XmlTransient
    @Override
    public VariableInstance clone() {
        VariableInstance c = (VariableInstance) super.clone();
        return c;
    }

    /**
     * @return the id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the scope
     */
    @XmlTransient
    public AbstractScope getScope() {
        return scope;
    }

    /**
     * @param scope the scope to set
     */
    public void setScope(AbstractScope scope) {
        this.scope = scope;
    }

    /**
     * @return the scope
     */
    @XmlTransient
    public VariableDescriptor getDescriptor() {
        return this.getScope().getVariableDescriptor();
    }

    /**
     *
     * @return
     */
    public Long getDescriptorId() {
        if (this.getScope() != null) {
            return this.getDescriptor().getId();
        } else {
            return new Long(-1);
        }
    }

    public void setDescriptorId(Long l) {
        // Dummy so that jaxb doesnt yell
    }

//    @PostPersist
    @PostUpdate
//    @PostRemove
    public void onInstanceUpdate() {
        if (this.getScope() == null) {                                          // If the instance has no scope, it means it's a default
            return;                                                             // default Instance and the updated event is not sent
        }
        try {
            Helper.lookupBy(VariableInstanceFacade.class).onVariableInstanceUpdate(this);
        }
        catch (NamingException ex) {
            logger.error("Error looking up VariableInstanceFacade");
        }
    }
}