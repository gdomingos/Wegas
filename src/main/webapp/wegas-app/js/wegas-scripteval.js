/*
 * Wegas.
 *
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
YUI.add('wegas-scripteval', function (Y) {
    "use strict";

    var ScriptEval;

    ScriptEval = Y.Base.create("ScriptEval", Y.Plugin.Base,[],{
        context : null,
        initializer: function(){
            this.context = {};
            this.afterHostEvent("response", function(e){
                var data = this.get("host").data;
                this.context = {};
                for(var i in data){
                    this.context[data[i].get('name')] = JSON.parse(JSON.stringify(data[i].getInstance()));
                    if(data[i] instanceof Y.Wegas.persistence.ListDescriptor){
                        this.context[data[i].get('name')].items = [];
                        for(var j in data[i].get("items")){
                            this.context[data[i].get('name')].items.push(JSON.parse(JSON.stringify(data[i].get("items")[j].getInstance())));
                        }
                    }
                }
                /*SANDBOX*/
                Y.mix(this.context,{
                    window:undefined,
                    Y:undefined,
                    YUI:undefined
                });
            }, this);
        },
        scopedEval: function(script){
            return ((new Function( "with(this) { return "+ script +";}")).call(this.context));
        }
    }, {
        NS:"script",
        NAME:"scriptEval"
    });

    Y.namespace('Plugin').ScriptEval = ScriptEval;

});

