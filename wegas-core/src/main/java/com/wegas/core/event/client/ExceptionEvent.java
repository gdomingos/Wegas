/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.event.client;

import java.util.List;
import javax.xml.bind.annotation.XmlType;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@XmlType(name = "ExceptionEvent")
public class ExceptionEvent extends ClientEvent {

    private List<Exception> exceptions;

    /**
     *
     */
    public ExceptionEvent() {
    }

    /**
     *
     * @param exceptions
     */
    public ExceptionEvent(List<Exception> exceptions) {
        this.exceptions = exceptions;
    }

    /**
     *
     * @return
     */
    public List<Exception> getExceptions() {
        return exceptions;
    }

    /**
     *
     * @param exceptions
     */
    public void setExceptions(List<Exception> exceptions) {
        this.exceptions = exceptions;
    }
}
