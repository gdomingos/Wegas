/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.addGroup("wegas-teaching", {
    base: './wegas-teaching/',
    root: '/wegas-teaching/',
    modules: {
        'wegas-teaching-arrow': {
            requires: "graphics"
        },
        'wegas-teaching-rectangle': {},
        'wegas-teaching-main': {
            ws_provides: "TeachingMain",
            requires: ["panel", "editor", "gallery-itsatoolbar",
                "autocomplete", "autocomplete-highlighters", "autocomplete-filters",
                "dd-plugin", 'dd-drop', 'dd-proxy', 'dd-constrain', "button-group",
                "wegas-teaching-arrow", "wegas-teaching-rectangle"]
        }
    }
});