/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.rest.util;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
public class Views {

    /**
     * Index minimal (w/ ids)
     */
    public static interface IndexI {
    }

    /**
     * Extended (w/ blob texts)
     */
    public static interface ExtendedI {
    }

    /**
     * Extend view (w/ scripts, impacts)
     */
    public static interface EditorI {
    }

    /**
     * Player view (w/ instances)
     */
    public static interface PlayerI {
    }

    /**
     * Only display current player's VariableInstance
     */
    public static interface SinglePlayerI extends PlayerI {
    }

    /**
     *
     */
    public static class Index implements IndexI {
    }

    /**
     *
     */
    public static class Public extends Index {
    }

    /**
     * Variable Descriptor with a single instance for the current player
     */
    public static class Private extends Public implements SinglePlayerI {
    }

    /**
     *
     */
    public static class Editor extends Public implements IndexI, PlayerI, EditorI {
    }

    /**
     * Variable Descriptor with a single instance for the current player
     */
    public static class PrivateEditor extends Public implements SinglePlayerI, EditorI {
    }

    /**
     *
     */
    public static class Export implements EditorI {
    }

    /**
     *
     */
    @JsonIgnoreProperties({"id"})
    //@JsonPropertyOrder(value = {"title", "id", "version", "price", "summary"})
    public interface ExportFilter {
    }
}
