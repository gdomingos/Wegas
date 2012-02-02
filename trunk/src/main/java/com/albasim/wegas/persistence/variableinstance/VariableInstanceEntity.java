/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */
package com.albasim.wegas.persistence.variableinstance;

import com.albasim.wegas.persistence.AnonymousEntity;
import com.albasim.wegas.persistence.scope.ScopeEntity;
import com.albasim.wegas.persistence.variabledescriptor.VariableDescriptorEntity;
import java.util.logging.Logger;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.codehaus.jackson.annotate.JsonSubTypes;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@XmlType(name = "VariableInstance", propOrder = {"@class", "id"})
@JsonSubTypes(value = {
    @JsonSubTypes.Type(name = "StringVariableInstance", value = StringVariableInstanceEntity.class),
    @JsonSubTypes.Type(name = "ListVariableInstance", value = ListVariableInstanceEntity.class),
    @JsonSubTypes.Type(name = "MCQVariableInstance", value = MCQVariableInstanceEntity.class)
})
public class VariableInstanceEntity extends AnonymousEntity {

    private static final long serialVersionUID = 1L;
    private static final Logger logger = Logger.getLogger("GMVariableKInstance");
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "var_instance_seq")
    private Long id;
    @ManyToOne
    @XmlTransient
    private ScopeEntity scope;
    @ManyToOne
    @XmlTransient
    private ScopeEntity teamScope;
    @OneToOne
    @XmlTransient
    private ScopeEntity gameScope;
    /*
     * This attribute is only present when the variable is used as a devaultVariableD
     */
    @OneToOne
    @XmlTransient
    private VariableDescriptorEntity variableDescriptor;

    @XmlTransient
    @Override
    public VariableInstanceEntity clone() {
        VariableInstanceEntity c = (VariableInstanceEntity) super.clone();
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
    public ScopeEntity getScope() {
        return scope;
    }

    /**
     * @param scope the scope to set
     */
    public void setScope(ScopeEntity scope) {
        this.scope = scope;
    }

    /**
     * @param scope the scope to set
     */
    public void setTeamScope(ScopeEntity scope) {
        this.teamScope = scope;
    }

    /**
     * 
     * @param scope
     */
    public void setGameScope(ScopeEntity scope) {
        this.gameScope = scope;
    }
    /* @Override
    public VariableInstanceEntity clone() {
    VariableInstanceEntity vi = new  VariableInstanceEntity();
    return vi;
    }*/

    /**
     * 
     * @param a
     */
    @Override
    public void merge(AnonymousEntity a) {
    }
}