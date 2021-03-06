/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileOverview
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
YUI.add('wegas-panel', function(Y) {
    "use strict";

    var Wegas = Y.namespace("Wegas");

    Wegas.Panel = Y.Base.create("wegas-panel", Y.Widget,
        [Y.WidgetParent, Y.WidgetPosition, Y.WidgetStdMod, Y.WidgetButtons,
            Y.WidgetModality, Y.WidgetPositionAlign, Y.WidgetStack], {
        syncUI: function() {
            this.set("content", this.get("content"));
        },
        exit: function() {
            this.destroy();
            //this.get("boundingBox").hide(true);
            //Y.later(500, this, this.destroy);
        }
    }, {
        CSS_PREFIX: "wegas-panel",
        ATTRS: {
            align: {
                "transient": true
            },
            alignOn: {
                "transient": true
            },
            content: {
                value: "",
                type: "string",
                format: "html",
                setter: function(val) {
                    if (val) {
                        this.set("bodyContent", val);
                    }
                    return val;
                }
            },
            bodyContent: {
                "transient": true
            },
            buttons: {
                "transient": true,
                value: {
                    footer: [{
                            name: 'proceed',
                            label: 'OK',
                            action: "exit"
                        }]
                }
            },
            centered: {
                value: true,
                "transient": true
            },
            defaultButton: {
                "transient": true
            },
            fillHeight: {
                "transient": true
            },
            focusOn: {
                "transient": true
            },
            footerContent: {
                "transient": true
            },
            headerContent: {
                "transient": true
            },
            maskNode: {
                "transient": true
            },
            modal: {
                value: false,
                type: "boolean"
            },
            shim: {
                "transient": true
            },
            x: {
                "transient": true
            },
            xy: {
                "transient": true
            },
            y: {
                "transient": true
            },
            zIndex: {
                value: 100,
                "transient": true
            }
        },
        confirm: function(msg, okCb, cancelCb) {
            var panel = new Wegas.Panel({
                bodyContent: "<div class='icon icon-info'>" + msg + "</div>",
                modal: true,
                width: 400,
                buttons: {
                    footer: [{
                            label: 'OK',
                            action: function() {
                                panel.exit();
                                okCb && okCb();
                            }
                        }, {
                            label: 'Cancel',
                            action: function() {
                                panel.exit();
                                cancelCb && cancelCb();
                            }
                        }]
                }
            }).render();
            //bodyNode = panel.getStdModNode("body", true);
        },
        confirmPlayerAction: function(cb) {
            if (!Y.fire("playerAction", {})) {
                Wegas.Panel.confirm("This action will impact player data, proceed?", cb);
            } else {
                cb();
            }
        }
    });
});
