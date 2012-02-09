/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */

package com.wegas.persistence;


import com.wegas.persistence.users.*;
import java.util.Collection;
import java.util.logging.Logger;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.eclipse.persistence.oxm.annotations.XmlInverseReference;


/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

@Entity
@Table(uniqueConstraints =
@UniqueConstraint(columnNames = {"name"}))
@Inheritance(strategy = InheritanceType.JOINED)

@XmlRootElement
@XmlType(name = "Team", propOrder = {"@class", "id", "name"})
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@class")

public class TeamEntity extends AnonymousEntity {

    private static final Logger logger = Logger.getLogger("GroupEntity");

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "team_seq")
    private Long id;


    @NotNull
   // @javax.validation.constraints.Pattern(regexp = "^\\w+$")
    private String name;
    
    
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "user_team",
    joinColumns = {
        @JoinColumn(name = "userId")
    },
    inverseJoinColumns = {
        @JoinColumn(name = "teamId")
    })
    private Collection<UserEntity> users;
    
    /**
     * The game model this belongs to
     */
    @ManyToOne
    @NotNull
    @XmlTransient
    @XmlInverseReference(mappedBy = "teams")
    private GameModelEntity gameModel;

    /**
     * 
     * @return
     */
    @Override
    public Long getId() {
        return id;
    }


    /**
     * 
     * @param id
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }


    /**
     * 
     * @return
     */
    public String getName() {
        return name;
    }


    /**
     * 
     * @param name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the gameModel
     */
    @XmlTransient
    public GameModelEntity getGameModel() {
        return gameModel;
    }

    /**
     * @param gameModel the gameModel to set
     */
    @XmlTransient
    public void setGameModel(GameModelEntity gameModel) {
        this.gameModel = gameModel;
    }

    /**
     * @return the users
     */
    public Collection<UserEntity> getUsers() {
        return users;
    }

    /**
     * @param users the users to set
     */
    public void setUsers(Collection<UserEntity> users) {
        this.users = users;
    }

    /**
     * 
     * @param a
     */
    @Override
    public void merge(AnonymousEntity a) {
        TeamEntity t = (TeamEntity)a;
        this.setName(t.getName());
    }
}
