/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Yannick Lagger <lagger.yannick@gmail.com>
 * @author Maxence Laurent <maxence.laurent+wegas@gmail.com>
 */
YUI.add('wegas-pmg-taskpopup', function(Y) {
    "use strict";
    var Wegas = Y.Wegas, Taskpopup;
    /**
     *  @class add a popup on a table column
     *  @name Y.Plugin.Taskpopup
     *  @extends Y.Plugin.Base
     *  @constructor
     */
    Taskpopup = Y.Base.create("wegas-pmg-taskpopup", Y.Plugin.Base, [Wegas.Plugin, Wegas.Editable], {
        /** @lends Y.Plugin.Taskpopup */
        /**
         * Lifecycle methods
         * @function
         * @private
         */
        initializer: function() {
            this.handlers = [];
            this.detailsOverlay = new Y.Overlay({
                zIndex: 100,
                width: this.get("width"),
                visible: false,
                constrain: true
            }).render();
            this.shown = false;
            this.detailsOverlay.get("contentBox").addClass("pmg-popup-overlay");
            this.bind();
            this.onceAfterHostEvent("render", this.sync);
            this.afterHostMethod("syncUI", this.sync);
            this.get("host").datatable.after("sort", this.sync, this);
        },
        bind: function() {
            Y.log("bind()", "log", "Wegas.Taskpopup");
            var taskDescriptor, key,
                fields = ["label", "description", 'requirements'],
                dt = this.get("host").datatable;

            this.handlers.push(dt.delegate("mousemove", function(e) {
                this.currentPos = [e.pageX + 10, e.pageY + 20];
                if (this.detailsOverlay.get('visible') === false) {
                    taskDescriptor = dt.getRecord(e.currentTarget).get("descriptor");

                    var requestedField = [];

                    for (key in fields) {
                        if (fields[key] && !taskDescriptor.get(fields[key])) {
                            requestedField.push(fields[key]);
                        }
                    }

                    if (requestedField.length > 0) {
                        this.request(taskDescriptor, requestedField, fields);
                    } else {
                        this.display(taskDescriptor);
                    }
                }
            }, ".popup", this));
            //this.handlers.push(dt.delegate("mouseout", this.menuDetails.hide, ".popup", this.menuDetails));
            this.handlers.push(dt.delegate("mouseleave", this.onMouseLeave, ".popup", this));
            Y.one(".pmg-taskpopup-overlay").on("mouseleave", this.onMouseLeave, this);
        },
        onMouseLeave: function(e) {
            if ((e.relatedTarget) && (e.relatedTarget.hasClass('pmg-taskpopup-overlay') === false)) {
                this.detailsOverlay.hide();
            }
        },
        sync: function() {
            var i, dt = this.get("host").datatable;
            for (i = 0; i < dt.get("data").size(); i++) {
                dt.getCell([i, this.get("column")]).addClass("popup");
            }
        },
        request: function(taskDescriptor, requiredFields, fields) {
            if (requiredFields.length > 0) {
                Wegas.Facade.Variable.cache.getWithView(taskDescriptor, "Extended", {// Retrieve the object from the server in Export view
                    on: Wegas.superbind({
                        success: function(e) {
                            var i, value;
                            for (i in requiredFields) {
                                value = e.response.entity.get(requiredFields[i]);
                                taskDescriptor.set(requiredFields[i], value);
                            }
                            this.display(taskDescriptor);
                        },
                        failure: function() {
                            this.get("host").showMessage("error", "An error occured");
                        }
                    }, this)
                });
            }
        },
        getDescriptionToDisplay: function(descriptor) {
            var i, description = descriptor.get("description"),
                requirements = descriptor.getInstance().get("requirements"),
                dataToDisplay;

            dataToDisplay = '<div class="field" style="padding:5px 10px">'
                + '<p class="subtitle">Description</p><p>' + description
                /*+ (description ?
                 description: "")*/
                + '</p></div><div style="padding:5px 10px" class="requirements"><p class="subtitle">Requirements</p>';

            for (i = 0; i < requirements.length; i += 1) {
                dataToDisplay = dataToDisplay + "<p>" + requirements[i].get("quantity") + "x " + requirements[i].get("work")
                    + " " + Wegas.PmgDatatable.TEXTUAL_SKILL_LEVEL[requirements[i].get("level")];
            }
            dataToDisplay = dataToDisplay + "</div>";
            return dataToDisplay;
        },
        display: function(taskDescriptor) {
            this.detailsOverlay.set("headerContent", taskDescriptor.get("label"));
            this.detailsOverlay.setStdModContent('body', this.getDescriptionToDisplay(taskDescriptor));
            this.detailsOverlay.move(this.currentPos[0], this.currentPos[1]);
            this.detailsOverlay.show();
        },
        /**
         * Destructor methods.
         * @function
         * @private
         */
        destructor: function() {
            this.detailsOverlay.destroy();
            for (var i = 0; i < this.handlers.length; i++) {
                this.handlers[i].detach();
            }
        }
    }, {
        ATTRS: {
            width: {
                type: "string",
                value: "250px"
            },
            column: {
                value: 1,
                _inputex: {
                    _type: "integer",
                    label: "popup on column"
                }
            }
        },
        NS: "taskpopup"
    });
    Y.Plugin.Taskpopup = Taskpopup;
});
