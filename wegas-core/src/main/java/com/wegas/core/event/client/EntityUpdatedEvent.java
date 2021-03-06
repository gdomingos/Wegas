/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.event.client;

import com.wegas.core.persistence.variable.VariableInstance;
import com.wegas.core.rest.util.JacksonMapperProvider;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlType;
import org.codehaus.jackson.map.ObjectMapper;

/**
 *
 * @author Yannick Lagger <lagger.yannick at gmail.com>
 */
@XmlType(name = "EntityUpdatedEvent")
public class EntityUpdatedEvent extends ClientEvent {

    private List<VariableInstance> updatedEntities = new ArrayList<>();

    /**
     *
     */
    public EntityUpdatedEvent() {
    }

    /**
     *
     * @param updatedEntities
     */
    public EntityUpdatedEvent(List<VariableInstance> updatedEntities) {
        this.updatedEntities = updatedEntities;
    }

    /**
     * @return the updatedEntities
     */
    public List<VariableInstance> getUpdatedEntities() {
        return updatedEntities;
    }

    /**
     * @param updatedEntities the updatedEntities to set
     */
    public void setUpdatedEntities(List<VariableInstance> updatedEntities) {
        this.updatedEntities = updatedEntities;
    }

    /**
     *
     * @param vi
     */
    public void addEntity(VariableInstance vi) {
        this.updatedEntities.add(vi);
    }

    /**
     *
     * @return @throws IOException
     */
    public String toJson() throws IOException {
        ObjectMapper mapper = JacksonMapperProvider.getMapper();
        return mapper.writeValueAsString(this);
    }
}
