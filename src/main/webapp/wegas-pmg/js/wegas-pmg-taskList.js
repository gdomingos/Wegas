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
 * @author Benjamin Gerber <ger.benjamin@gmail.com>
 */
YUI.add( "wegas-pmg-tasklist", function ( Y ) {
    "use strict";

    var CONTENTBOX = "contentBox", Tasklist;

    Tasklist = Y.Base.create( "wegas-pmg-tasklist", Y.Wegas.PmgDatatable, [ Y.WidgetChild, Y.Wegas.Widget, Y.Wegas.persistence.Editable], {
        
        handlers:null,
        
        //*** Private Methods ***/
        checkRealization: function(){
            var i, cb = this.get(CONTENTBOX), tasks, taskInst, realized, allRow;
            if(this.data == null
                || this.data.length == 0
                || this.get("columnValues").indexOf('realized')<=-1){
                return; 
            }
            tasks = Y.Wegas.VariableDescriptorFacade.rest.find("name", this.get("variables"));
            allRow = cb.all(".yui3-datatable-data tr");
            allRow.removeClass("started").removeClass("completed");
            for(i=0; i<tasks.get('items').length; i++){
                taskInst = tasks.get('items')[i].getInstance();
                realized = (taskInst.get('properties').realized)?taskInst.get('properties').realized:null;
                if(realized){
                    if(realized > 0 && realized < 100){
                        allRow.item(i).addClass("started");
                    }
                    if(realized == 100){
                        allRow.item(i).addClass("completed");
                    }
                }
            }
        },
        
        displayDescription: function(e){
            var i, name, tasks, taskDesc, description;
            if(this.get("viewDescription") == "false") return;
            name = e.currentTarget.ancestor().one("*").getContent()
            tasks = Y.Wegas.VariableDescriptorFacade.rest.find("name", this.get("variables"));
            if(!name || !tasks) return;
            for (i = 0; i < tasks.get('items').length; i++) {
                taskDesc = tasks.get('items')[i];
                if(taskDesc.get('name') === name){
                    description = taskDesc.get("description");
                    break;
                } 
            }
            e.currentTarget.append("\
                <div class='description'>\n\
                    <p class='task_name'>"+name+"</p>\n\
                    <p class='description'>"+description+"</p>\n\
                </div>")
        },
        
        initializer: function(){
            this.handlers = new Array();
        },   
        
        renderUI: function(){
            this.constructor.superclass.renderUI.apply(this);
        },
        
        bindUI: function(){
            this.constructor.superclass.bindUI.apply(this);
            this.handlers.push(Y.Wegas.VariableDescriptorFacade.after("response", this.syncUI, this));
            this.handlers.push(Y.Wegas.app.after('currentPlayerChange', this.syncUI, this));
            this.handlers.push(this.datatable.delegate('click', function (e) {
                this.displayDescription(e);
            }, '.yui3-datatable-data td', this));
            this.handlers.push(this.datatable.delegate('mouseout', function (e) {
                this.get(CONTENTBOX).all(".description").remove();  
            }, '.yui3-datatable-data tr', this));
        },
        
        syncUI: function(){
            this.constructor.superclass.syncUI.apply(this);
            this.checkRealization();
        }

    }, {
        ATTRS : {
            viewDescription:{
                value: true,
                validator: function (b){
                    return b == "false" || b == "true";
                }
            },
            viewAssignements:{                                                  //todo
                value: true,
                validator: function (b){
                    return b == "false" || b == "true";                               
                }
            }
        }
    });

    Y.namespace( "Wegas" ).PmgTasklist = Tasklist;
});