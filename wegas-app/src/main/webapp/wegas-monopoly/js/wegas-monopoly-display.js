/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 * @author Yannick Lagger <lagger.yannick@gmail.com>
 */
YUI.add( "wegas-monopoly-display", function ( Y ) {
    "use strict";
    
    var Monopolydisplay;
    
    Monopolydisplay = Y.Base.create( "wegas-monopoly-display", Y.Widget, [ Y.WidgetChild, Y.Wegas.Widget, Y.Wegas.Editable ], {
                
        initializer: function() {
           this.handlers = []; 
        },
        
        bindUI: function() {
            this.handlers.push(
                Y.Wegas.VariableDescriptorFacade.after("update", this.syncUI, this));  
        },
        
        renderUI: function(){
            var i;
            // dice
            this.dice = this.get("parent").item(0);
            // buy button
            this.buy = this.get("parent").item(1);
            // next button
            this.next = this.get("parent").item(2);
            // state
            this.state = Y.Wegas.VariableDescriptorFacade.rest.find("name", "state").getInstance().get("value");  
            
            // create box
            for (i = 1; i <= 40; i++){
                this.get("boundingBox").append("<div class='box"+i +"' />")
            }
        },
        
        syncUI: function () {
            var i, descriptor = Y.Wegas.VariableDescriptorFacade.rest.find("name", "position"),
            game, team, t, ret = [];
        
            if (descriptor.get("scope") instanceof Y.Wegas.persistence.TeamScope){ //@fixme when game scope works
                game = Y.Wegas.GameFacade.rest.getCurrentGame();
                
                for (i = 0; i < game.get("teams").length; i += 1) {
                    t = game.get("teams")[i];
                    ret.push([t, 
                        descriptor.get("scope").get("variableInstances")[t.get("id")]]);
                }
            } else if (descriptor.get("scope") instanceof Y.Wegas.persistence.TeamScope) {
                team = Y.Wegas.GameFacade.rest.getCurrentTeam()
                for (i = 0; i < team.get("players").length; i += 1) {
                    t = team.get("players")[i];
                    ret.push([t, 
                        descriptor.get("scope").get("variableInstances")[t.get("id")]]);
                }
            }
            this.removePions();
            this.doDraw(ret);
            this.checkCurrentPlayer();
        },
        
        doDraw: function (data) {
            var i;
            for (i = 0; i < data.length; i += 1) {
                console.log(data[i][0].get("name")); // team name
                Y.one('.box'+data[i][1].get("value")).append("<div class='pion"+[i+1]+"'></div>");
            }
        },
        
        removePions: function(){
            var i;
            for (i = 1; i <= 40; i += 1) {
              Y.one('.box'+[i]).get('childNodes').remove();
            }
        },
        
        setPion: function(value){
            var position;
            
            this.dice.rollButton.enable();
           
            position = Y.Wegas.VariableDescriptorFacade.rest.find("name", "position").getInstance().get("value");
            position = value + position;
            if (this.position > 40){
                this.position -=40;
            }
            Y.Wegas.VariableDescriptorFacade.rest.sendRequest({
                request: "/Script/Run/" + Y.Wegas.app.get('currentPlayer'),
                cfg: {
                    method: "POST",
                    data: Y.JSON.stringify({
                        "@class": "Script",
                        "language": "JavaScript",
                        "content": "importPackage(com.wegas.core.script);\nposition.value ="+ position +";"
                    })
                }                
            });
            
        },
        
        checkCurrentPlayer: function(){
            var turn = Y.Wegas.VariableDescriptorFacade.rest.find("name", "turnOf"),
                id;
            if (turn.get("scope") instanceof Y.Wegas.persistence.GameModelScope){ //@fixme when gameScope works
                id = Y.Wegas.GameFacade.rest.getCurrentTeam().get("id");
            } else if (turn.get("scope") instanceof Y.Wegas.persistence.TeamScope) {
                id = Y.Wegas.GameFacade.rest.getCurrentPlayer().get("id");
            }
            
            if (id == turn.get("scope").getInstance().get("value")){
                if (this.state == "wait"){
                    this.setState("roll");
                }
            }
        },
        
        setCurrentPlayer: function(id){
            Y.Wegas.VariableDescriptorFacade.rest.sendRequest({
                request: "/Script/Run/" + Y.Wegas.app.get('currentPlayer'),
                cfg: {
                    method: "POST",
                    data: Y.JSON.stringify({
                        "@class": "Script",
                        "language": "JavaScript",
                        "content": "importPackage(com.wegas.core.script);\nturnOf.value ="+ id +";"
                    })
                }                
            });
        },
        
        payPlayer: function (){
        // TODO
        // Check if box belong a palyer
        // then: pay and disable buy button 
        },
        
        checkState: function (){
            switch (this.state){
                case "roll" :
                    this.buy.disable();
                    this.next.disable();
                    break;
                case "afterRoll" :
                    this.dice.rollButton.disable();
                    this.next.enable();
                    this.checkPropertyBuyable();
                    break;
                case "wait" :
                    this.dice.rollButton.disable();
                    this.buy.disable();
                    this.next.disable();
            }
        },
        
        checkPropertyBuyable : function(){
            var position = Y.Wegas.VariableDescriptorFacade.rest.find("name", "position").getInstance().get("value"),
            boxValue = Y.Wegas.VariableDescriptorFacade.rest.find("name", "boxValue").getAttrs().items;
            position--;
            if (boxValue[position].getInstance().get("properties").playerId != "" ||
            boxValue[position].getInstance().get("properties").playerId == "notBuyable"){
                this.buy.disable();
            } else {
                this.buy.enable();
            }
        },
        
        setState: function (newState){
            this.state = newState;
            Y.Wegas.VariableDescriptorFacade.rest.sendRequest({
                request: "/Script/Run/" + Y.Wegas.app.get('currentPlayer'),
                cfg: {
                    method: "POST",
                    data: Y.JSON.stringify({
                        "@class": "Script",
                        "language": "JavaScript",
                        "content": "importPackage(com.wegas.core.script);\nstate.value ='"+ this.state +"';"
                    })
                },
                on: {
                    success: Y.bind(function (e) {
                        this.checkState();
                    }, this)
                }
            }, this);
        }            
    });
    
    Y.namespace( "Wegas" ).Monopolydisplay = Monopolydisplay;
});