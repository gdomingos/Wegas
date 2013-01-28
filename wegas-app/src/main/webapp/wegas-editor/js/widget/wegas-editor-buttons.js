/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */

/**
 * @module editbutton
 * @main editbutton
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-editor-buttons', function (Y) {
    "use strict";

    /**
     * @class Y.Wegas.SelectPlayerButton
     * @constructor
     * @extends Widget
     * @param {Object} cfg The button config object
     */
    var SelectPlayerButton = Y.Base.create("button", Y.Wegas.Button, [], {
        /** @lends Y.Wegas.SelectPlayerButton# */
        bindUI: function () {
            SelectPlayerButton.superclass.bindUI.apply(this, arguments);
            this.plug(Y.Plugin.WidgetMenu);

            this.menu.on("button:click", function (e) {
                Y.Wegas.app.set('currentPlayer', e.target.get("data").get("id"));
            });

            Y.Wegas.GameFacade.after("response", this.syncUI, this);
            Y.Wegas.app.after("currentPlayerChange", this.syncUI, this);
        },

        syncUI: function () {
            SelectPlayerButton.superclass.bindUI.apply(this, arguments);
            var j, k, cTeam, menuItems = [],
            cGame = Y.Wegas.GameFacade.rest.getCurrentGame(),
            cPlayer = Y.Wegas.GameFacade.rest.getCurrentPlayer();

            this.set("label", "Current player: " + cPlayer.get("name"));      // Update the label

            for (j = 0; j < cGame.get("teams").length; j = j + 1) {
                cTeam = cGame.get("teams")[j];

                // if (cTeam.get("players").length == 0) {
                //    continue;
                // }

                menuItems.push({
                    "type": "Text",
                    "content": "<b>" + cTeam.get("name") + "</b>"
                });

                for (k = 0; k < cTeam.get("players").length; k = k + 1) {
                    cPlayer = cTeam.get("players")[k];
                    menuItems.push({
                        type: "Button",
                        label: cPlayer.get("name"),
                        data: cPlayer
                    });
                }
            }

            this.menu.set("children", menuItems);
        }
    }, {
        ATTS: {
            entity: {}
        }
    });

    Y.namespace("Wegas").SelectPlayerButton = SelectPlayerButton;

    /**
     * @class SelectGameButton
     * @constructor
     * @extends Widget
     * @param {Object} cfg The button config object
     */
    var SelectGameButton= Y.Base.create("button", Y.Wegas.Button, [], {

        bindUI: function () {
            SelectGameButton.superclass.bindUI.apply(this, arguments);
            this.plug(Y.Plugin.WidgetMenu);

            Y.Wegas.GameIndexFacade.after("response", this.syncUI, this);
        },

        syncUI: function () {
            SelectGameButton.superclass.syncUI.apply(this, arguments);

            var j, menuItems = [],
            cGame = Y.Wegas.GameFacade.rest.getCurrentGame(),
            games = Y.Wegas.GameIndexFacade.rest.getCache();

            this.set("label", "Current game: " + cGame.get("name"));      // Update the label

            for (j = 0; j < games.length; j = j + 1) {
                menuItems.push({
                    "type": "Button",
                    "label": games[j].get("name"),
                    plugins: [{
                        fn: "OpenGameAction",
                        cfg: {
                            target: "self",
                            entity: games[j]
                        }
                    }]
                });
            }
            this.menu.set("children", menuItems);
        }
    });

    Y.namespace("Wegas").SelectGameButton = SelectGameButton;
});