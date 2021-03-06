/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add("wegas-loginbutton", function(Y) {
    "use strict";

    var Wegas = Y.Wegas, UserLoginButton, LoginButton;

    /**
     * @name Y.Wegas.LoginButton
     * @extends Y.Wegas.Button
     * @class  Button with a defined behavior.
     * @constructor
     * @description Button with special label and menu with two
     * options : set user preferences or logout
     */
    LoginButton = Y.Base.create("wegas-login", Wegas.Button, [Y.WidgetChild, Wegas.Widget, Wegas.Editable], {
        /** @lends Y.Wegas.LoginButton# */
        // *** Lifecycle Methods *** //
        /**
         * @function
         * @private
         * @description bind function to events.
         * Call widget parent to execute its proper bind function.
         * When UserFacade is updated, do syncUI
         * Add plugin menu with 2 options : open page "user preferences" and logout
         */
        bindUI: function() {
            this.handlers = {};
            this.handlers.userUpdate = Wegas.Facade.User.after("update", this.syncUI, this);
            if (Wegas.Facade.Variable)
                this.handlers.variableUpdate = Wegas.Facade.Variable.after("update", this.syncUI, this);

            if (!this.menu) {                                                    // Don't add the plugin if it already exist.
                this.plug(Y.Plugin.WidgetMenu);
            }
            this.menu.add([{
                    type: "Button",
                    label: "Preferences",
                    plugins: [{
                            fn: "OpenPageAction",
                            cfg: {
                                subpageId: "UserPreferences",
                                targetPageLoaderId: this.get("targetPageLoader")
                            }
                        }]
                }]);

            if (!Wegas.Facade.GameModel.cache.getCurrentGameModel().get("properties.freeForAll")) {
                this.menu.add({
                    type: "Button",
                    label: "Edit Team",
                    plugins: [{
                            fn: "OpenPageAction",
                            cfg: {
                                subpageId: "Team",
                                targetPageLoaderId: this.get("targetPageLoader")
                            }
                        }]
                });
            }
            this.menu.add([{
                    type: "Button",
                    label: "Logout",
                    plugins: [{
                            fn: "OpenUrlAction",
                            cfg: {
                                url: "logout",
                                target: "self"
                            }
                        }]
                }]);
        },
        /**
         * @function
         * @private
         * @description Call widget parent to execute its proper sync function.
         * Set label of this button with team and/or player name.
         */
        syncUI: function() {
            Wegas.LoginButton.superclass.syncUI.apply(this, arguments);

            var cUser = Wegas.Facade.User.get("currentUser"),
                cPlayer = Wegas.Facade.Game.cache.getCurrentPlayer(),
                cTeam = Wegas.Facade.Game.cache.getCurrentTeam(),
                mainAccount = cUser.getMainAccount(),
                gameModel = Wegas.Facade.GameModel.cache.getCurrentGameModel();

            if (mainAccount instanceof Wegas.persistence.GuestJpaAccount) {     // If current account is a Guest,
                this.menu.getMenu().item(0).hide();                             // hide the "Preference" button
            }

            if (this.get("forcedLabel")) {
                this.set("label", this.get("forcedLabel"));
            } else {
                if (cTeam && !(gameModel && gameModel.get("properties.freeForAll"))) {
                    this.set("label", cTeam.get("name") + " : " + cPlayer.get("name"));
                } else {
                    this.set("label", cPlayer.get("name") || "Undefined");
                }
            }
        },
        destructor: function() {
            for (var k in this.handlers) {
                this.handlers[k].detach();
            }
        }
    }, {
        /** @lends Y.Wegas.LoginButton */
        /**
         * @field
         * @static
         * @description
         * <p><strong>Attributes</strong></p>
         * <ul>
         *    <li>preferencePageId: Id of the the page which contains widget userPreferences</li>
         *    <li>targetPageLoader: Zone to display the page which contains widget userPreferences</li>
         * </ul>
         */
        ATTRS: {
            label: {
                "transient": true
            },
            forcedLabel: {
                type: "string",
                optional: true,
                _inputex: {
                    label: "Label",
                    description: "Player name is used if blank"
                }
            },
            data: {
                "transient": true
            },
            /**
             * targetPageLoader: Zone to display the page which contains widget userPreferences
             */
            targetPageLoader: {
                value: "maindisplayarea",
                _inputex: {
                    label: "Target zone",
                    _type: "string",
                    //_type: "pageloaderselect",//@fixme There a bug with this widget when the target page is not loaded
                    wrapperClassName: 'inputEx-fieldWrapper wegas-advanced-feature'
                }
            }
        }
    });
    Wegas.LoginButton = LoginButton;

    /**
     * @name Y.Wegas.LoginButton
     * @extends Y.Wegas.Button
     * @class  Button with a defined behavior.
     * @constructor
     * @description Button with special label and menu with two
     * options : set user preferences or logout
     */
    UserLoginButton = Y.Base.create("wegas-login", Wegas.Button, [Y.WidgetChild, Wegas.Widget, Wegas.Editable], {
        /** @lends Y.Wegas.LoginButton# */
        // *** Lifecycle Methods *** //
        /**
         * @function
         * @private
         * @description bind function to events.
         * Call widget parent to execute its proper bind function.
         * When UserFacade is updated, do syncUI
         * Add plugin menu with 2 options : open page "user preferences" and logout
         */
        bindUI: function() {
            this.handlers = {};
            this.handlers.userUpdate = Wegas.Facade.User.after("update", this.syncUI, this);
            if (Wegas.Facade.Variable)
                this.handlers.variableUpdate = Wegas.Facade.Variable.after("update", this.syncUI, this);

            if (this.menu) {                                                    // Don't add the plugin if it already exists
                return;
            }

            this.plug(Y.Plugin.WidgetMenu);

            this.menu.add([{
                    "type": "Button",
                    "label": "Preferences",
                    "plugins": [{
                            "fn": "OpenTabAction",
                            "cfg": {
                                "wchildren": [{
                                        "type": "Form",
                                        "plugins": [{
                                                "fn": "UserPreferences"
                                            }]
                                    }]
                            }
                        }]
                }, {
                    label: "Ascii mode",
                    on: {
                        click: function() {
                            Y.one("body").toggleClass("wegas-ascii");
                            Y.use("cookie", "wegas-editor-asciicss", function(Y) {
                                if (Y.one("body.wegas-ascii")) {
                                    var audio = new Audio(Wegas.app.get("base") + "wegas-app/images/wegas-mexican.mp3");
                                    audio.play();
                                    Y.Cookie.set("asciimode", "wegas-ascii");
                                } else {
                                    Y.Cookie.remove("asciimode");
                                }
                            });
                        }
                    }
                }, {
                    type: "Button",
                    label: "Logout",
                    plugins: [{
                            fn: "OpenUrlAction",
                            cfg: {
                                url: "logout",
                                target: "self"
                            }
                        }]
                }]);
        },
        /**
         * @function
         * @private
         * @description Call widget parent to execute its proper sync function.
         * Set label of this button with team and/or player name.
         */
        syncUI: function() {
            Wegas.LoginButton.superclass.syncUI.apply(this, arguments);

            var cUser = Wegas.Facade.User.get("currentUser"),
                name = cUser.get("name") || "undefined",
                mainAccount = cUser.getMainAccount();

            if (mainAccount) {
                name = "<img src=\"http://www.gravatar.com/avatar/" + mainAccount.get("hash") + "?s=28&d=mm\" />" + name;
            }
            this.set("label", name);
        },
        destructor: function() {
            for (var k in this.handlers) {
                this.handlers[k].detach();
            }
        }
    }, {
        /** @lends Y.Wegas.LoginButton */
        /**
         * @field
         * @static
         * @description
         * <p><strong>Attributes</strong></p>
         * <ul>
         *    <li>labelIsUser: Select what kind of label you want (user/team  or team/player)</li>
         *    <li>preferencePageId: Id of the the page which contains widget userPreferences</li>
         *    <li>targetPageLoader: Zone to display the page which contains widget userPreferences</li>
         * </ul>
         */
        ATTRS: {
            label: {
                "transient": true
            }
        }
    });
    Wegas.UserLoginButton = UserLoginButton;
});
