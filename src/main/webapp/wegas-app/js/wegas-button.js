/** 
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-button', function(Y) {
    
    var CONTENTBOX = 'contentBox',
    BOUNDINGBOX = 'boundingBox',
    LoginButton,
    
    Button = Y.Base.create("wegas-button", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {
       
        initializer: function(cfg) {
        },
        destroyer: function() {
        },
        renderUI: function () {
            		
        },
        bindUI: function() {
            this.get(CONTENTBOX).on('click', function() {
                var widgetCfg = this.get('subpage') || {
                    'type': 'Text',                     
                    'content': 'Nothing to display'
                },
                target= Y.one('#'+this.get('targetDisplayArea')+' div');
                
                if (target.one('div')) target.one('div').remove();              // If there is already a widget displayed, we remove it
                
                if (!this._widget) {
                    this._widget = Y.Wegas.Widget.create(widgetCfg);

                    try {
                        this._widget.render(target);
                    } catch (e) {
                        Y.log('renderUI(): Error rendering widget: '+(e.stack || e ), 'error', 'Wegas.Button');
                    }
                } else {
                    target.append(this._widget.get(BOUNDINGBOX));
                }
            }, this);
        },
        syncUI: function() {
            switch (this.get('view')) {
                case 'button':
                    this.get(CONTENTBOX).setContent('<input type="submit" value="'+this.get('label')+'"></input>');
                    break;
                case 'text':
                default:												// Update the button display
                    this.get(CONTENTBOX).setContent("<span>"+this.get('label')+"</span>");
            }
        }
    }, {
        ATTRS : {
            classTxt: {
                value: 'Button'
            },
            type: {
                value: "Button"
            },
            label: {},
            subpage: {},
            targetDisplayArea: {},
            view: {}
        }
    });
    
    Y.namespace('Wegas').Button = Button;
    
    LoginButton = Y.Base.create("wegas-login", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {
        bindUI: function() {
            
            Y.Wegas.app.dataSources.Game.after("response", this._onDataUpdate, this);
            Y.Wegas.app.after("currentPlayerChange", this._onDataUpdate, this);
        },
        syncUI: function() {
            var cPlayer = Y.Wegas.app.dataSources.Game.rest.getCurrentPlayer(), 
            cTeam = Y.Wegas.app.dataSources.Game.rest.getCurrentTeam(), 
            name = "undefined";
            
            if (cPlayer) name = cPlayer.name;
            if (cTeam) name = cTeam.name+":"+name;
            
            this.get(CONTENTBOX).setContent('['+name+'] <a href="wegas-logout">logout</a>');
        },
        _onDataUpdate: function(e) {
            this.syncUI();
        }
    }, {
        ATTRS : {
            classTxt: {
                value: 'LoginButton'
            },
            type: {
                value: "LoginButton"
            }
        }
    });
    
    Y.namespace('Wegas').LoginButton = LoginButton;
});