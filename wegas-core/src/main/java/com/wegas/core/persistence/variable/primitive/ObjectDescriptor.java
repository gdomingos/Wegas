/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.persistence.variable.primitive;

import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.game.Player;
import com.wegas.core.persistence.variable.VariableDescriptor;
import java.util.HashMap;
import java.util.Map;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Lob;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
public class ObjectDescriptor extends VariableDescriptor<ObjectInstance> {

    private static final long serialVersionUID = 1L;
    /**
     *
     */
    @Lob
    private String description;
    /**
     *
     */
    @ElementCollection
    private Map<String, String> properties = new HashMap<>();

    /**
     *
     * @param a
     */
    @Override
    public void merge(AbstractEntity a) {
        super.merge(a);

        ObjectDescriptor other = (ObjectDescriptor) a;
        this.setDescription(other.getDescription());
        this.properties.clear();
        this.properties.putAll(other.getProperties());
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the properties
     */
    public Map<String, String> getProperties() {
        return properties;
    }

    /**
     * @param properties the properties to set
     */
    public void setProperties(Map<String, String> properties) {
        this.properties = properties;
    }

    /**
     *
     * @param p
     * @return
     */
    public int size(Player p) {
        return this.getInstance(p).getProperties().size();
    }

    /**
     * Metods for use in script
     * @param p
     * @param key
     * @return 
     */
    public String getProperty(Player p, String key) {
        return this.getInstance(p).getProperties().get(key);
    }

    /**
     *
     * @param p
     * @param key
     * @param value
     */
    public void setProperty(Player p, String key, String value) {
        this.getInstance(p).getProperties().put(key, value);
    }

    /**
     *
     * @param p
     * @param key
     */
    public void removeProperty(Player p, String key) {
        this.getInstance(p).getProperties().remove(key);
    }
}
