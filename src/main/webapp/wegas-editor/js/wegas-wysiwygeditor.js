/**
 *
 *
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-wysiwygeditor', function(Y) {
    "use strict";

    var WysiwygEditor = Y.Base.create("wegas-wysiwygeditor", Y.Widget, [Y.Wegas.Widget, Y.WidgetChild], {

        // *** Lifecycle Methods *** //

        initializer: function () {
        },
        destructor : function () {
        },

        renderUI: function () {
            var cb = this.get("contentBox"), code, syntax;

            cb.append("<textarea style=\"width:100%;200px\">VariableDescriptorFacade.find(6).setValue(self, 12);</textarea>");

            new Y.Button({
                label: "Generate form",
                on: {
                    click: Y.bind(this.genSyntaxTree, this)
                }
            }).render(cb);

            new Y.Button({
                label: "Generate code",
                on: {
                    click: Y.bind(this.genCode, this)
                }
            }).render(cb);

            var base_schema_map = {
                "address": {
                    id:'address',
                    type:'object',
                    properties:{
                        'address1':{
                            'type':'string',
                            'title':'Address'
                        },
                        'address2':{
                            'type':'string',
                            'optional':true,
                            'title':' '
                        },
                        'city':{
                            'type':'string',
                            'title':'City'
                        },
                        'state':{
                            'type':'string',
                            'minLength':2,
                            'maxLength':2,
                            'pattern':/^[A-Za-z][A-Za-z]$/,
                            'title':'State'

                        },
                        'postal_code':{
                            'type':'string',
                            'pattern':/(^\d{5}-\d{4}$)|(^\d{5}$)/,
                            'title':'Zip'
                        }
                    }
                },
                "information-source": {
                    id:'information-source',
                    type:'object',
                    properties:{
                        'name':{
                            'type':'string',
                            'title':'Organization'
                        },
                        'contact':{
                            'type':'string',
                            'optional':true,
                            'title':'Contact Name'
                        },
                        'physical_address':{
                            '$ref':'address',
                            'optional':true,
                            'title':'Physical Address'
                        },
                        'postal_address':{
                            '$ref':'address',
                            'title':'Postal Address'
                        },
                        'telephone':{
                            'type':'string',
                            'pattern':/^\d{3}-\d{3}-\d{4}$/,
                            'title':'Telephone'
                        }
                    }
                },
                'community': {
                    'id':'community',
                    'type':'object',
                    'properties':{
                        'community_id':{
                            'type':'number',
                            'title':'Community ID'
                        },
                        'display_name':{
                            'type':'string',
                            'title':'Community Name'
                        },
                        'short_description':{
                            'type':'string',
                            'format':'text',
                            'title':'Short Description',
                            '_inputex':{
                                'rows':5,
                                'cols':50
                            }
                        },
                        'long_description':{
                            'type':'string',
                            'format':'html',
                            'title':'Long Description',
                            "_inputex":{
                                "opts":{
                                    'width':'500',
                                    'height':'200'
                                }
                            }
                        },
                        "information_sources": {
                            "title":"Information Sources",
                            "type":"array",
                            "items":{
                                "$ref":"information-source"
                            },
                            "_inputex":{
                                "useButtons":false,
                                "sortable":true
                            }
                        }
                    }
                },
                'Program': {
                    'id':'program',
                    'type':'object',
                    'properties':{
                        "type": {
                            'type':'string',
                            _inputex: {
                                _type: "hidden",
                                value: "Program"
                            }
                        },
                        "body": {
                            "type":"array",
                            "items":{
                                "$ref":"ExpressionStatement"
                            },
                            "_inputex":{
                                "useButtons":false,
                                className: "wegas-field wegas-field-body"
                            }
                        }
                    }
                },
                "ExpressionStatement": {
                    id:'information-source',
                    type:'object',
                    properties:{
                        "type": {
                            'type':'string',
                            _inputex: {
                                _type: "hidden",
                                value: "ExpressionStatement"
                            }
                        },
                        'expression':{
                            '$ref':'CallExpression'
                        }
                    }
                },
                "CallExpression": {
                    id: 'CallExpression',
                    type: 'object',
                    properties:{
                        "type": {
                            'type':'string',
                            _inputex: {
                                _type: "hidden",
                                value: "CallExpression"
                            }
                        },
                        'callee': {
                            $ref: "MemberExpression"
                        },
                        'arguments':{
                            'type':'array',
                            "items":{
                                "$ref":"Identifier"
                            },
                            "_inputex":{
                                // "useButtons":false
                                sortable: false,
                                className: "wegas-field wegas-field-arguments"
                            }
                        }
                    },
                    "_inputex":{
                        className: "wegas-field wegas-field-callexpression"
                    }
                },
                "Identifier": {
                    id:'identifier',
                    type:'object',
                    properties:{
                        "type": {
                            'type':'string',
                            _inputex: {
                                _type: "hidden",
                                value: "Identifier"
                            }
                        },
                        'name':{
                            'type':'string',
                            "_inputex": {
                                className: "wegas-field wegas-field-identifier",
                                label: ""
                            }
                        }
                    }
                },
                "MemberExpression": {
                    type: "object",
                    properties: {
                        "type": {
                            'type':'string',
                            _inputex: {
                                _type: "hidden",
                                value: "MemberExpression"
                            }
                        },
                        "object": {
                            "$ref":"Identifier",
                            "_inputex":{
                                className: "wegas-field wegas-field-identifier wegas-field-object"
                            }
                        },
                        "property": {
                            "$ref":"Identifier"
                        }
                    },
                    "_inputex":{
                        className: "wegas-field wegas-field-memberexpression"
                    }
                }
            };

            var builder = new Y.inputEx.JsonSchema.Builder({
                'schemaIdentifierMap':base_schema_map,
                'defaultOptions':{
                    'showMsg':true
                }
            });
            var formFields = builder.schemaToInputEx(base_schema_map.Program);
            formFields.parentEl = cb;

            Y.inputEx.use(formFields, Y.bind(function(fields) {
                this.form = Y.inputEx(fields);
                this.genSyntaxTree();
            }, this, formFields));
        },

        // *** Private Methods *** //

        genSyntaxTree: function() {
            var i, code = this.get("contentBox").one("textarea").get("value"),
            tree = window.esprima.parse(code, {
                raw: true
            }),
            outputCode = window.escodegen.generate(tree, {
                indent: true
            }), ret = [],
            fields = [];
            //this.form.setValue(tree);

            console.log("Generating tree:", tree , outputCode, "info", "Wegas.WysiwyEditor");

            for (i = 0; i < tree.body.length; i = i + 1) {
                try {
                    fields.push( this.generateExpression( tree.body[i].expression ) );
                } catch( e ) {
                    console.log( "Error evaluating line: " +
                        window.escodegen.generate(tree.body[i].expression, {
                            indent: true
                        }));
                }
            }

            var form = Y.inputEx({
                type: "group",
                fields: fields,
                parentEl: this.get( "contentBox" )
            });

            console.log( "Form value: ", form.getValue() );
        },
        generateExpression: function ( expression ) {
            console.log("GenExpression", expression);
            switch ( expression.type ) {
                case "CallExpression":
                    switch ( expression.callee.object.type ) {
                        case "Identifier":
                            switch ( expression.callee.object.name ) {
                                case "VariableDescriptorFacade":
                                    return {
                                        type: "variabledescriptorselect",
                                        value: expression.arguments[0].value
                                    };
                            }
                            break;
                        default:
                            //                            return new MethodSelect({
                            //                                object: this.generateExpression( expression.callee.object ),
                            //                                name: expression.callee.property.value,
                            //                                arguments: expression.callee.arguments
                            //                            });
                            return {
                                type: "methodselect",
                                //object: this.generateExpression( expression.callee.object ),
                                fields: [ this.generateExpression( expression.callee.object ) ],
                                name: expression.callee.property.value,
                                arguments: expression.callee.arguments
                            };
                    }
            }
            throw new Exception();
        },
        genCode: function() {
            console.log("Generating code:", this.form.getValue(), "info", "Wegas.WysiwyEditor");
            var code = window.escodegen.generate(this.form.getValue(), {
                indent: true
            });
            this.get("contentBox").one("textarea").set("value", code);
        }
    }, {
        ATTRS: {

    }
    });

    Y.namespace('Wegas').WysiwygEditor = WysiwygEditor;

    var lang = Y.Lang,
    inputEx = Y.inputEx;

    /**
     * @class inputEx.KeyValueField
     * @constructor
     * @extends inputEx.CombineField
     * @param {Object} options InputEx definition object with the "availableFields"
     */
    var VariableDescriptorSelect = function(options) {
        VariableDescriptorSelect.superclass.constructor.call(this, options);
    };

    Y.extend( VariableDescriptorSelect, inputEx.CombineField, {

        /**
         * Subscribe the "updated" event on the key selector
         */
        initEvents: function() {
            VariableDescriptorSelect.superclass.initEvents.call(this);
        },


        /**
	 * Generate
	 */
        generateSelectConfig: function() {

            this.nameIndex = {};

            var choices = [], i,
            descs = Y.Wegas.VariableDescriptorFacade.rest.getCache();

            for ( i = 0 ; i < descs.length ; i++ ) {
                choices.push({
                    value: descs[i].get( "id" ),
                    label: descs[i].get( "name" )
                });
            }

            return {
                type: 'select',
                choices: choices
            };
        },

        /**
	 * Setup the options.fields from the availableFields option
	 */
        setOptions: function(options) {
            var newOptions = {
                fields: [ this.generateSelectConfig() ]
            };

            Y.mix(newOptions, options);

            VariableDescriptorSelect.superclass.setOptions.call(this, newOptions);
        },

        setValue: function ( val ) {
            console.log( "set value" );
        },

        getValue: function () {
            return "VariableDescriptorFacade.find(" + this.inputs[ this.inputs.length - 1 ] + ")";
        }
    });

    inputEx.registerType("variabledescriptorselect", VariableDescriptorSelect, {});

    /**
     * @class inputEx.KeyValueField
     * @constructor
     * @extends inputEx.CombineField
     * @param {Object} options InputEx definition object with the "availableFields"
     */
    var MethodSelect = function(options) {
        MethodSelect.superclass.constructor.call(this, options);
    };

    Y.extend( MethodSelect, inputEx.CombineField, {

        /**
         * Subscribe the "updated" event on the key selector
         */
        initEvents: function() {
            MethodSelect.superclass.initEvents.call(this);
        },

        /**
	 * Setup the options.fields from the availableFields option
	 */
        setOptions: function(options) {
            var newOptions = {
            //  fields: [this.generateArgumentsConfig()]
            };

            Y.mix( newOptions, options);
            Y.mix( newOptions, {
                object: null,
                argument: []
            });

            MethodSelect.superclass.setOptions.call(this, newOptions);
        },

        setValue: function ( val ) {
            console.log( "set value" );
        },

        getValue: function () {
            var value = MethodSelect.superclass.getValue.call( this, arguments );
            value.splice( 0, 1 );                                               // Remove the called objects from results
            return "." + this.options.name + "(" + value.join( ", ") + "";
        },
        render: function () {
            MethodSelect.superclass.render.call( this );
            this.syncUI();
        },

        /**
	 * Generate
	 */
        generateArgumentsConfig: function() {
            var fields = [], i,
            descs = Y.Wegas.VariableDescriptorFacade.rest.getCache();

            for ( i = 0 ; i < this.options.arguments.length ; i++ ) {
                fields.push({
                    value: this.options.arguments[i].value
                });
            }

            return fields;
        },
        syncUI: function () {
            var lastInput = this.inputs[this.inputs.length-1],
            next = this.divEl.childNodes[inputEx.indexOf(lastInput.getEl(), this.divEl.childNodes)+1];

            while ( this.inputs.length > 1 ) {                                  // Destroy current args
                lastInput = this.inputs[this.inputs.length-1];
                lastInput.destroy();
                this.inputs.pop();

            }

            var fields = this.generateMethods();
            fields.push("----------");
            fields = fields.concat( this.generateFields());

            this.field = this.renderField({
                type: "keyvalue",
                availableFields: fields
            });

            var fieldEl = this.field.getEl();
            Y.one(fieldEl).setStyle('float', 'left');
            this.divEl.insertBefore(fieldEl, next);

            this.field.on( "change", this.onPropertyChange)
        },

        onCalleeChange: function () {
            console.log( "onCalleeChange" );
            this.syncUI();
        },
        onPropertyChange: function ()  {

        },

        /**
	 * Generate
	 */
        generateFields: function () {
            return [];
        },

        /**
	 * Generate
	 */
        generateMethods: function() {
            var i, methods = [];

            //            for ( i = 0 ; i < descs.length ; i++ ) {
            //                choices.push({
            //                    value: descs[i].get( "id" ),
            //                    label: descs[i].get( "name" )
            //                });
            //            }

            methods.push({
                name: "set"
            });

            methods.push({
                name: "add"
            });
            methods.push({
                name: "activate",
                type: "hidden"
            });

            return methods;
        },

        /**
         *  Remove all interactions on this field
         */
        runInteractions: function() { },

        /**
         * Rebuild the value field
         */
        onSelectFieldChange: function(value) {
            var f = this.nameIndex[value];
            var lastInput = this.inputs[this.inputs.length-1];
            var next = this.divEl.childNodes[inputEx.indexOf(lastInput.getEl(), this.divEl.childNodes)+1];
            lastInput.destroy();
            this.inputs.pop();
            var field = this.renderField(f);
            var fieldEl = field.getEl();
            Y.one(fieldEl).setStyle('float', 'left');

            this.divEl.insertBefore(fieldEl, next);
        }
    });

    inputEx.registerType("methodselect", MethodSelect, {});

});