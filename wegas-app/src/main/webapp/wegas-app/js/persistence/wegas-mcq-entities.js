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
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add('wegas-mcq-entities', function (Y) {
    "use strict";

    var IDATTRDEF = {
        type: "string",
        optional: true,                                                         // The id is optional for entites that have not been persisted
        _inputex: {
            _type: "hidden"
        }
    };

    /**
     * QuestionDescriptor mapper
     */
    Y.namespace("Wegas.persistence").QuestionDescriptor = Y.Base.create("QuestionDescriptor", Y.Wegas.persistence.ListDescriptor, [], {
        getRepliesByStartTime: function (startTime) {
            return this.getInstance().getRepliesByStartTime(startTime);
        }
    }, {
        ATTRS: {
            "@class": {
                type: "string",
                value: "QuestionDescriptor"
            },
            allowMultipleReplies: {
                value: false,
                type: 'boolean',
                _inputex: {
                    label: 'Allow multiple replies'
                }
            },
            defaultInstance: {
                properties: {
                    "@class": {
                        type: "string",
                        _inputex: {
                            _type: "hidden",
                            value: "QuestionInstance"
                        }
                    },
                    id: IDATTRDEF,
                    active: {
                        type: "boolean",
                        _inputex: {
                            label: 'Active by default',
                            value: true
                        }
                    }
                }
            },
            description: {
                type: "string",
                format: "html",
                optional: true
            },
            pictures: {
                optional: true,
                type: "array",
                items: {
                    type: "string",
                    optional: true,
                    _inputex: {
                        _type: "wegasurl",
                        label: ""
                    }
                },
                _inputex: {
                    useButtons: true
                }
            }
        },
        EDITMENU: [{
            type: "EditEntityButton"
        }, {
            type: "Button",
            label: "Add",
            plugins: [{
                "fn": "WidgetMenu",
                "cfg": {
                    "menuCfg": {
                        points: ["tl", "tr"]
                    },
                    "event": "mouseenter",
                    "children": [{
                        type: "Button",
                        label: "Add a choice",
                        plugins: [{
                            fn: "AddEntityChildAction",
                            cfg: {
                                targetClass: "SingleResultChoiceDescriptor"
                            }
                        }]
                    }, {
                        type: "Button",
                        label: "Add a choice with multiple results",
                        plugins: [{
                            fn: "AddEntityChildAction",
                            cfg: {
                                targetClass: "ChoiceDescriptor"
                            }
                        }]
                    }]
                }
            }]
        }, {
            type: "Button",
            label: "Duplicate",
            plugins: [{
                fn: "DuplicateEntityAction"
            }]
        },  {
            type: "DeleteEntityButton"
        }],
        /**
         * Defines methods available in wysiwyge script editor
         */
        METHODS: {
            activate: {
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            },
            desactivate: {
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            },
            isReplied: {
                label: "has been replied",
                returns: "boolean",
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            },
            isActive: {
                label: "is active",
                returns: "boolean",
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            }
        }
    });

    /**
     * QuestionInstance mapper
     */
    Y.Wegas.persistence.QuestionInstance = Y.Base.create("QuestionInstance", Y.Wegas.persistence.VariableInstance, [], {
        getRepliesByStartTime: function (startTime) {
            var i, ret = [], replies = this.get("replies");
            for (i = 0; i < replies.length; i = i + 1) {
                if (replies[i].get("startTime") === startTime) {
                    ret.push(replies[i]);
                }
            }
            return ret;
        }
    }, {
        ATTRS: {
            "@class": {
                value: "QuestionInstance"
            },
            active: {
                value: true,
                type: 'boolean'
            },
            unread: {
                value: true,
                type: 'boolean'
            },
            replies: {
                value: [],
                type: "array",
                _inputex: {
                    _type: "hidden"
                }
            }
        }
    });

    /**
     * ChoiceDescriptor mapper
     */
    Y.Wegas.persistence.ChoiceDescriptor = Y.Base.create("ChoiceDescriptor", Y.Wegas.persistence.VariableDescriptor, [], { }, {
        ATTRS: {
            "@class": {
                value: "ChoiceDescriptor"
            },
            description: {
                type: 'string',
                format: "html",
                optional: true,
                _inputex: {
                    opts: {
                        height: '50px'
                    }
                }
            },
            defaultInstance: {
                properties: {
                    '@class': {
                        type: "string",
                        _inputex: {
                            _type: 'hidden',
                            value: 'ChoiceInstance'
                        }
                    },
                    id: IDATTRDEF,
                    active: {
                        type: "boolean",
                        _inputex: {
                            label: 'Active by default',
                            value: true
                        }
                    },
                    currentResultId: {
                        type: "string",
                        optional: true,
                        _inputex: {
                            _type: "entityarrayfieldselect",
                            label: "Default result"
                        }
                    }
                }
            },
            duration: {
                value: 1,
                type: "string",
                optional: true,
                _inputex: {
                    description: "Only for crimesim evidences"
                }
            },
            cost: {
                type: "string",
                optional: true,
                value: 0,
                _inputex: {
                    label: "Human resource consumption",
                    description: "Only for crimesim evidences"
                }
            },
            results: {
                type: "array",
                value: [],
                _inputex: {
                    _type: 'hidden'
                }
            }
        //impact: {
        //    _inputex: {
        //        _type: "script"
        //    },
        //    optional: true
        //},
        },
        EDITMENU: [{
            type: "EditEntityButton"
        }, {
            type: "Button",
            label: "Add result",
            plugins: [{
                fn: "EditEntityArrayFieldAction",
                cfg: {
                    targetClass: "Result",
                    method: "post",
                    attributeKey: "results"
                }
            }]
        }, {
            type: "Button",
            label: "Duplicate",
            plugins: [{
                fn: "DuplicateEntityAction"
            }]
        }, {
            type: "DeleteEntityButton"
        }],
        METHODS: {
            setCurrentResult: {
                label: "set current result",
                arguments: [{
                    type: "hidden",
                    value: "self"
                }, {
                    type: "entityarrayfieldselect"
                }]
            },
            activate: {
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            },
            desactivate: {
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            },
            isActive: {
                label: "is active",
                returns: "boolean",
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            }
        }
    });

    /**
     * ChoiceDescriptor mapper
     */
    Y.Wegas.persistence.SingleResultChoiceDescriptor = Y.Base.create("SingleResultChoiceDescriptor", Y.Wegas.persistence.ChoiceDescriptor, [], { }, {
        ATTRS: {
            "@class": {
                value: "SingleResultChoiceDescriptor"
            },
            defaultInstance: {
                properties: {
                    '@class': {
                        type: "string",
                        _inputex: {
                            _type: 'hidden',
                            value: 'ChoiceInstance'
                        }
                    },
                    id: IDATTRDEF,
                    active: {
                        type: "boolean",
                        _inputex: {
                            label: 'Active by default',
                            value: true
                        }
                    },
                    currentResultId: {
                        type: "string",
                        optional: true,
                        _inputex: {
                            _type: "hidden"
                        }
                    }
                }
            },
            results: {
                type: "array",
                value: [{
                    "@class": "Result"
                }],
                items: {
                    type: "object",
                    optional: true,
                    properties: {
                        id: IDATTRDEF,
                        "@class": {
                            type: "string",
                            _inputex: {
                                _type: "hidden"
                            }
                        },
                        name: {
                            type: "string",
                            optional: true,
                            _inputex: {
                                _type: "hidden"
                            }
                        },
                        answer: {
                            type: "string",
                            optional: true,
                            format: "html"
                        },
                        impact: {
                            optional: true,
                            _inputex: {
                                _type: "script"
                            }
                        },
                        choiceDescriptorId: {
                            type: "string",
                            optional: true,
                            _inputex: {
                                _type: 'hidden'
                            }
                        },
                        files: {
                            optional: true,
                            type: "array",
                            items: {
                                type: "string",
                                optional: true,
                                _inputex: {
                                    _type: "wegasurl",
                                    label: ""
                                }
                            },
                            _inputex: {
                                useButtons: true
                            }
                        }
                    }
                },
                _inputex: {
                    label: null,
                    listAddLabel: " ",
                    listRemoveLabel: " ",
                    wrapperClassName: "inputEx-fieldWrapper-nomargin"
                }
            }
        },
        EDITMENU: [{
            type: "EditEntityButton"
        }, {
            type: "Button",
            label: "Duplicate",
            plugins: [{
                fn: "DuplicateEntityAction"
            }]
        }, {
            type: "DeleteEntityButton"
        }],
        METHODS: {
            activate: {
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            },
            desactivate: {
                arguments: [{
                    type: "hidden",
                    value: "self"
                }]
            }
        }
    });
    /**
     * MCQ Result mapper
     */
    Y.Wegas.persistence.Result = Y.Base.create("Result", Y.Wegas.persistence.Entity, [], {
        getChoiceDescriptor: function () {
            return Y.Wegas.VariableDescriptorFacade.rest.findById(this.get("choiceDescriptorId"));
        }
    }, {
        ATTRS: {
            "@class": {
                value: "Result"
            },
            name: {
                type: "string"
            },
            answer: {
                type: "string",
                format: "html"
            },
            impact: {
                _inputex: {
                    _type: "script"
                }
            },
            choiceDescriptorId: {
                type: "string",
                optional: true,
                _inputex: {
                    _type: 'hidden'
                }
            },
            files: {
                optional: true,
                type: "array",
                items: {
                    type: "string",
                    optional: true,
                    _inputex: {
                        _type: "wegasurl",
                        label: ""
                    }
                },
                _inputex: {
                    useButtons: true
                }
            }
        },
        EDITMENU: [{
            type: "Button",
            label: "Edit",
            plugins: [{
                fn: "EditEntityArrayFieldAction"
            }]
        }, {
            type: "Button",
            label: "Delete",
            plugins: [{
                fn: "EditEntityArrayFieldAction",
                cfg: {
                    method: "delete",
                    attributeKey: "results"
                }
            }]
        }]
    });
    /**
     * MCQ ChoiceInstance mapper
     */
    Y.Wegas.persistence.ChoiceInstance = Y.Base.create("ChoiceInstance", Y.Wegas.persistence.VariableInstance, [], {}, {
        ATTRS: {
            "@class": {
                value: "ChoiceInstance"
            },
            active: {
                value: true,
                type: "boolean"
            },
            unread: {
                value: true,
                type: "boolean"
            },
            currentResultId: {
                type: "string",
                _inputex: {
                    _type: "hidden"
                }
            }
        }
    });
    /**
     * MCQ Reply mapper
     */
    Y.Wegas.persistence.Reply = Y.Base.create("Reply", Y.Wegas.persistence.Entity, [], {
        getChoiceDescriptor: function () {
            if (this.get("result")) {
                return this.get("result").getChoiceDescriptor();
            }
        },
        /**
         *  @return 0 if is finished, 1 if ongoing and 2 if planified
         */
        getStatus: function (time) {
            var choiceDescriptor = this.getChoiceDescriptor();

            if ((this.get("startTime") + choiceDescriptor.get("duration")) <= time) {
                return 0;
            } else if (this.get("startTime") <= time) {
                return 1;
            } else {
                return 2;
            }
        }
    }, {
        ATTRS: {
            "@class": {
                value: "Reply"
            },
            choiceDescriptorId: {
                type: "string",
                optional: true,
                _inputex: {
                    _type: 'hidden'
                }
            },
            startTime: {
                type: "string",
                setter: function (val) {
                    return val * 1;
                }
            },
            result: {
                _inputex: {
                    _type: 'hidden'
                }
            }
        }
    });
});
