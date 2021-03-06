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
YUI.add('wegas-team', function(Y) {
    "use strict";

    var CONTENTBOX = "contentBox", Wegas = Y.Wegas, Team, TeamFormList, JoinTeam, EditTeam;

    /**
     * @name Y.Wegas.Team
     * @extends Y.Widget
     * @augments Y.WidgetChild
     * @augments Y.Wegas.Widget
     * @class parent class for join, create a team or add member
     * @constructor
     * @description Parent class
     */

    Team = Y.Base.create("wegas-team", Y.Widget, [Y.WidgetChild, Wegas.Widget], {
        /** @lends Y.Wegas.JoinTeam# */

        // *** Private fields *** //
        /**
         * @function
         * @private
         * @description All button and fields are created.
         * For creating the field inputEx libary is used
         */
        renderUI: function() {
            this.saveButton = new Y.Button({//                                  // Render the button
                label: "Join game",
                visible: false
            }).render(this.get(CONTENTBOX));
        },
        bindUI: function() {
            this.saveButton.on("click", this.onSaveButtonClick, this);          // On join button click
        },
        destructor: function() {
            this.saveButton.destroy();
        },
        getTargetEntity: function() {
            var entity = this.get("entity");
            if (Y.Lang.isArray(entity)) {
                return entity[0];
            } else {
                return entity;
            }
        },
        getTargetGame: function() {
            var entity = this.get("entity");
            if (Y.Lang.isArray(entity)) {
                if (entity[1]) {
                    return entity[1];
                } else {
                    return entity[0];
                }
            } else if (entity instanceof Wegas.persistence.Team) {
                return Wegas.Facade.Game.cache.findById(entity.get("gameId"));
            } else {
                return entity;
            }
        },
        /**
         * @function
         * @private
         * @description User rest request: rest/GameModel/1/Game/{gameModelID}/JoinTeam/{teamID}
         */
        sendJoinTeamRequest: function(teamId) {
            this.showOverlay();
            Wegas.Facade.Game.sendRequest({
                request: "/JoinTeam/" + teamId,
                cfg: {
                    updateCache: false
                },
                on: {
                    success: Y.bind(function() {
                        Y.fire("gameJoined", {
                            game: this.getTargetGame()
                        });
                    }, this),
                    failure: Y.bind(function() {
                        this.hideOverlay();
                        this.showMessage("error", "Error joining team");
                    }, this)
                }
            });
        },
        sendMultiJoinTeamRequest: function(teamId, playerToAdd) {
            if (!playerToAdd) {
                playerToAdd = this.teamEdition.getAccounts();
            }
            Wegas.Facade.Game.sendRequest({//                                   // Add all player to the list in the list to the target game
                request: "/JoinTeam/" + teamId + (this.get("token") ? "/" + this.get("token") : ""),
                cfg: {
                    method: "POST",
                    data: playerToAdd,
                    updateCache: false
                },
                on: {
                    success: Y.bind(this.onSaved, this),
                    failure: Y.bind(function(e) {
                        this.teamId = teamId;                                   // @hack
                        this.defaultFailureHandler(e);
                    }, this)
                }
            });
        }
    }, {
        ATTRS: {
            entity: {},
            customEvent: {
                value: false
            }
        }
    });
    Wegas.Team = Team;

    JoinTeam = Y.Base.create("wegas-jointeam", Team, [Y.WidgetChild, Wegas.Widget], {
        CONTENT_TEMPLATE: "<div><div class=\"wegas-gameinformation\"></div>"
            + "<div class=\"teamselection\"></div>"
            + "</div>",
        renderUI: function() {
            JoinTeam.superclass.renderUI.apply(this);

            Wegas.Facade.Game.cache.getWithView(this.getTargetGame(), "Extended", {// Get the game model full description
                on: {
                    success: Y.bind(this.onGameRetrieved, this)
                }
            });
        },
        destructor: function() {
            this.teamField && this.teamField.destroy();
            this.teamEdition && this.teamEdition.destroy();
        },
        onGameRetrieved: function(e) {
            var emptyChoices, choices,
                cb = this.get(CONTENTBOX),
                teamSelectionNode = cb.one(".teamselection"),
                entity = this.getTargetEntity(),
                game = this.getTargetGame(),
                teams = game.get("teams"),
                gameModel = e.response.entity.get("gameModel"),
                teamName = (entity instanceof Wegas.persistence.Team) ? entity.get("name")
                : game.get("name") + "-" + (game.get("teams").length),
                showTeamSelection = false,
                showTeamCreation = false,
                showTeamEdition = false;                                        // Default case, free for all games

            cb.one(".wegas-gameinformation").append(Wegas.GameInformation.renderGameInformation(e.response.entities[0]));

            if (entity instanceof Wegas.persistence.Team) {                     // If target entity is a team
                if (gameModel.get("properties.freeForAll")) {                   // If game is free for all (no team)
                    this.sendJoinTeamRequest(entity.get("id"));                 // join it directly
                } else if (entity.get("players").length === 0) {                // and this team is empty, (first connectin to this team)
                    showTeamEdition = true;                                     // display team composition edition
                } else {
                    this.showMessage("error",
                        "This team has already been created. You can contact it's members so they can join you in.");
                }
            } else if (entity instanceof Wegas.persistence.Game && // If target entity is a game
                !(gameModel && gameModel.get("properties.freeForAll"))) {       // and its game is not free for all (uses teams)
                showTeamCreation = true;
            }
            if (showTeamCreation || showTeamEdition) {
                teamSelectionNode.append("<div class=\"title\">Create your team</div>");
            }
            this.showTeamEdition = showTeamEdition;
            this.showTeamCreation = showTeamCreation;
            this.showTeamSelection = showTeamSelection;

            if (showTeamCreation || showTeamEdition) {                          // Render Team creation option
                choices = Y.Array.map(teams, function(i) {                      // render team selection
                    return {
                        label: i.get("name"),
                        value: i.get("id")
                    };
                });

                if (choices.length === 0) {
                    choices.push({
                        label: "No team created"
                    });
                    emptyChoices = true;
                }

                //teamSelectionNode.append("<div style=\"margin:10px 0\"><span style=\"color: #505050;font-style: italic;padding-left: 20px;\">Team name:</span>&nbsp;&nbsp;&nbsp;" + teamName + "</div>");

                this.teamField = new Y.inputEx.MultipleOptions({// Create team edition field
                    parentEl: teamSelectionNode,
                    fields: [{
                            type: "hidden",
                            label: "Team name",
                            required: true,
                            value: teamName
                        }, {
                            type: "select",
                            choices: choices,
                            label: "Select an existing team"
                        }]
                });

                if (emptyChoices) {                                             // Disable team selection if it's empty
                    this.teamField.inputs[1].disable();
                    //this.teamField.inputs[0].el.focus();
                }
                if (!showTeamSelection) {
                    this.teamField.inputs[1].hide();                            // Disable team selection everywhere (temporary)
                    //this.teamField.inputs[0].el.focus();
                }
            }
            if (showTeamEdition || showTeamCreation) {
                this.teamEdition = new TeamFormList().render(teamSelectionNode);
                this.teamEdition.addExistingAccount(
                    Wegas.Facade.User.get("currentUser").getMainAccount());     // Push  current user to the team's player list
            }

            this.saveButton.set("visible", true);
        },
        onSaveButtonClick: function() {
            var entity = this.getTargetEntity(),
                selectedField = (this.teamField) ? this.teamField.getSelected() : null,
                name = (selectedField) ? selectedField.getValue() : null;

            if (this.showTeamEdition || this.showTeamCreation) {
                if (!this.teamEdition.playersField.validate()) {
                    this.showMessage("error", "Invalid name, password or email");
                    return;
                }
                if (name === "") {
                    this.showMessage("error", "Enter a valid team name");
                    return;
                }
            }

            this.showOverlay();

            if (this.showTeamCreation) {                                        // If entity is a game token which allows team creation,
                if (this.teamId) {
                    this.sendMultiJoinTeamRequest(this.teamId);
                } else {
                    Wegas.Facade.Game.sendRequest({//                           // create the team
                        request: "/" + entity.get("id") + "/CreateTeam",
                        cfg: {
                            method: "POST",
                            updateCache: false
                        },
                        on: {
                            success: Y.bind(function(e) {
                                this.sendMultiJoinTeamRequest(e.response.entity.get("id"));// and then join it
                            }, this),
                            failure: Y.bind(function(e) {
                                this.hideOverlay();
                                this.showMessage("error", e.response.results.message || "Error creating team");
                            }, this)
                        }
                    });
                }
            } else if (this.showTeamEdition) {                                  // If joining
                if (name !== entity.get("name")) {                              // If team name was edited,
                    entity.set("name", name);
                    Wegas.Facade.Game.sendRequest({//                           // update it
                        request: "/Team/" + entity.get("id"),
                        cfg: {
                            method: "PUT",
                            updateCache: false,
                            data: entity.toObject()
                        },
                        on: {
                            success: function() {
                                this.sendMultiJoinTeamRequest(entity.get("id"));// join the team
                            },
                            failure: Y.bind(this.defaultFailureHandler, this)
                        }
                    });
                } else {
                    this.sendMultiJoinTeamRequest(entity.get("id"));            // join the team
                }
            } else if (this.showTeamSelection) {
                // todo
            } else {                                                            // If game is Free for all games or joining a team directly,
                this.sendTokenJoinGame(this.getTargetEntity().get("token"));    // use the token to join
            }
        },
        /**
         * @function
         * @private
         * @description All events are added to the buttons
         * Create team button call rest url : rest/GameModel/{gameModelID}/Game/{gameID}/CreateTeam/{teamName}
         */
        onSaved: function(e) {
            //this.showMessage("success", "Game joined");
            Y.fire("gameJoined", {
                game: e.response.entity
            });
        },
        sendTokenJoinGame: function(token) {
            this.showOverlay();
            Wegas.Facade.Game.sendRequest({
                request: "/JoinGame/" + token,
                cfg: {
                    updateCache: false
                },
                on: {
                    success: Y.bind(function(e) {
                        if (e.response.entity instanceof Wegas.persistence.Team) { // If the returned value is a Team enity
                            Y.fire("gameJoined", {
                                game: e.response.entities[1]
                            });
                        } else {
                            // TODO
                            this.hideOverlay();
                        }
                    }, this),
                    failure: Y.bind(function(e) {
                        this.showMessage("error", e.response.results.message || "Invalid token");
                    }, this)
                }
            });
        }
    }, {
        ATTRS: {
            token: {}
        }
    });
    Wegas.JoinTeam = JoinTeam;

    EditTeam = Y.Base.create("wegas-editteam", Team, [Y.WidgetChild, Wegas.Widget], {
        CONTENT_TEMPLATE: "<div>"
            + "<div class=\"teamselection\"></div>"
            + "</div>",
        renderUI: function() {
            EditTeam.superclass.renderUI.apply(this);
            this.saveButton.set("visible", true);
            this.saveButton.set("label", "Save");
            this.syncTeamList();
        },
        destructor: function() {
            this.teamEdition && this.teamEdition.destroy();
        },
        syncTeamList: function() {
            var teamSelectionNode = this.get(CONTENTBOX).one(".teamselection");

            this.teamEdition && this.teamEdition.destroy();
            teamSelectionNode.append("<div class=\"title\">Edit your team</div>");

            this.teamEdition = new TeamFormList().render(teamSelectionNode);

            Wegas.Facade.User.sendRequest({
                request: "/Account/FindByTeamId/" + this.get("teamId"),
                on: {
                    success: Y.bind(function(e) {
                        this.joinedAccounts = [];
                        Y.Array.each(e.response.entities, function(entity) {
                            this.teamEdition.addExistingAccount(entity);
                            this.joinedAccounts.push(entity);
                        }, this);
                    }, this),
                    failure: Y.bind(this.defaultFailureHandler, this)
                }
            });
        },
        onSaveButtonClick: function() {
            var playerToAdd = Y.Array.filter(this.teamEdition.getAccounts(), function(account) {
                return !Y.Array.find(this.joinedAccounts, function(joinedAccount) {
                    return account.id === joinedAccount.get("id");
                });
            }, this);
            this.showOverlay();
            this.sendMultiJoinTeamRequest(this.get("teamId"), playerToAdd);
        },
        onSaved: function() {
            this.get(CONTENTBOX).one(".teamselection").get('childNodes').remove();
            this.syncTeamList();
            this.hideOverlay();
            this.showMessage("success", "Players added to the team");
        }
    }, {
        ATTRS: {
            entity: {
                value: Wegas.Facade.Game.cache.getCurrentGame()
            },
            teamId: {
                value: Wegas.Facade.Game.get("currentTeamId")
            }
        }
    });
    Wegas.EditTeam = EditTeam;

    TeamFormList = Y.Base.create("wegas-teamformlist", Y.Widget, [Y.WidgetChild, Wegas.Widget, Wegas.Editable], {
        CONTENT_TEMPLATE: "<div><div class=\"header yui3-g\">"
            + "<div class=\"yui3-u\">First name</div>"
            + "<div class=\"yui3-u\">Last name</div>"
            + "<div class=\"yui3-u\">Email</div>"
            + "<div class=\"yui3-u\">Password</div></div>"
            + "<div class=\"uneditable-players\"></div></div>",
        renderUI: function() {
            var cb = this.get("contentBox"),
                gameId = Y.Widget.getByNode(this._parentNode).getTargetGame().get("id"),
                resultTemplate = "{highlighted} <p class='email'>{email}</p>",
                autoCompleteCfg = {
                    minQueryLength: 2,
                    maxResults: 30,
                    resultFormatter: function(query, results) {
                        return Y.Array.map(results, function(result) {
                            return Y.Lang.sub(resultTemplate, {
                                email: result.raw.email,
                                highlighted: result.highlighted
                            });
                        });
                    },
                    resultHighlighter: function(query, results) {
                        return Y.Array.map(results, function(result) {
                            return Y.Highlight.all(result.raw.firstname + " " + result.raw.lastname, query);
                        });
                    },
                    source: Wegas.app.get("base") + "rest/User/AutoCompleteFull/{query}/" + gameId,
                    enableCache: true,
                    resultListLocator: Y.bind(function(responses) {
                        return Y.Array.filter(responses, function(r) {
                            return !Y.Array.find(this.otherAccounts, function(account) {
                                return account.id === r.id;
                            }) && !Y.Array.find(this.playersField.subFields, function(user) {
                                return user.getValue().email === r.email;
                            });
                        }, this);
                    }, this)
                };

            this.otherAccounts = [];

            this.playersField = new Y.inputEx.ListField({//                     // Render team edition
                parentEl: cb,
                elementType: {
                    type: "group",
                    fields: [{
                            name: "@class",
                            type: "hidden",
                            value: "JpaAccount"
                        }, {
                            name: "id",
                            type: "hidden"
                        }, {
                            name: "firstname",
                            type: "autocomplete",
                            autoComp: autoCompleteCfg,
                            required: true,
                            allowFreeText: true,
                            size: 13
                        }, {
                            name: "lastname",
                            type: "autocomplete",
                            autoComp: autoCompleteCfg,
                            allowFreeText: true,
                            required: true,
                            size: 13
                        }, {
                            name: "email",
                            type: "autocomplete",
                            autoComp: autoCompleteCfg,
                            allowFreeText: true,
                            size: 13
                        }, {
                            name: "password",
                            type: "password",
                            //typeInvite: "password",                           // typeInvite dont work on password in inputex
                            size: 13
                        }]
                }
            });
            cb.all("input[type=\"password\"]").setAttribute("placeholder", "required");// Put placeholder attribute on all password fields

            cb.one(".inputEx-ListField").append('<div class="addTeamMember"><span class="wegas-icon wegas-icon-add"></span>Add member</div>');
            cb.delegate("click", function() {
                this.playersField.addElement();
                Y.later(10, this, this.updateAutoCompletes);
            }, ".inputEx-ListField .addTeamMember", this);

            Y.once("domready", this.updateAutoCompletes, this);
        },
        destructor: function() {
            this.playersField.destroy();
        },
        updateAutoCompletes: function() {
            var i, j, fields;
            for (i = 0; i < this.playersField.subFields.length; i++) {
                for (j = 2; j < 5; j += 1) {
                    var field = this.playersField.subFields[i].inputs[j];
                    if (!field.wmodified) {
                        field.yEl.ac.after("select", function(e) {
                            this.setValue(e.result.raw);
                            this.disable(true);
                        }, this.playersField.subFields[i]);
                        field.on("updated", function(e, aut, subfields) {
                            fields = Y.one(subfields.getEl());
                            if (subfields.inputs[1].getValue() === "") {
                                if (!fields.one(".wegas-newAccount"))
                                    fields.append("<p class='wegas-newAccount'>Creating a new account</p>");
                            } else {
                                fields.all(".wegas-newAccount").remove();
                            }
                        }, this, this.playersField.subFields[i]);
                        field.wmodified = true;
                    }
                }
            }
        },
        addExistingAccount: function(account) {
            var cb = this.get("contentBox"),
                firstname = (account instanceof Wegas.persistence.GuestJpaAccount) ? account.getPublicName() :
                account.get("firstname");

            this.otherAccounts.push(account.toObject());

            cb.one(".uneditable-players").append("<div class=\"yui3-g\">"
                + "<div class=\"yui3-u\">" + (firstname || account.get("name")) + "</div>"
                + "<div class=\"yui3-u\">" + (account.get("lastname") || "") + "</div>"
                + "<div class=\"yui3-u\">*****</div>"
                + "<div class=\"yui3-u\">*****</div></div>");
        },
        getAccounts: function() {
            return Y.Array.map(this.playersField.getValue().concat(this.otherAccounts), function(i) {
                delete i.name;
                return i;
            });
        }
    });
    Wegas.TeamFormList = TeamFormList;
});
