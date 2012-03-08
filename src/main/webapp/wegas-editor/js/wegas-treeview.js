/** 
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-treeview', function(Y) {
    
    var CONTENTBOX = 'contentBox',
    YAHOO = Y.YUI2,
    EDITBUTTONTPL = "<span class=\"yui3-wegas-treeview-editmenubutton\"></span>",
    
    WTreeView = Y.Base.create("wegas-treeview", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {
	
        _dataSource: null,
        _pushButton: null,
        _treeView: null,
	
        initializer: function(cfg) {
            this._dataSource = Y.Wegas.app.dataSources[this.get('dataSource')];
        },
	
        renderUI: function () {  
            var node = this.get(CONTENTBOX).append('<div></div>');
            
            // Render YUI2 TreeView widget
            this._treeView = new YAHOO.widget.TreeView(node._node);
            this._treeView.singleNodeHighlight = true; 
            this._treeView.render();
        },
        
        bindUI: function() {
            // Listen updates on the target datasource
            this._dataSource.after("response", function(e) {			
                if (e.response.results && ! e.response.error) {
                    var treeViewElements = this._genTreeViewElements(e.response.results);
                    this._treeView.removeChildren(this._treeView.getRoot());
                    this._treeView.buildTreeFromObject(treeViewElements);
                    this._treeView.render();
                };
            }, this);
	   
            // When a leaf is clicked
            this._treeView.subscribe("clickEvent", function(e) {                
                YAHOO.log(e.node.index + " label was clicked", "info", "Wegas.WTreeView");
                // Either show the edit menu
                if (e.event.target.className == "yui3-wegas-treeview-editmenubutton") {
                    Y.Wegas.editor.showEditMenu(e.node.data, this._dataSource);
                    Y.Wegas.editor._editMenu.get("boundingBox").appendTo(e.event.target.parentNode);
                    Y.Wegas.editor._editMenu.set("align", {
                        node:e.event.target, 
                        points:["tr", "br"]
                    });
                // Or display the edit tab
                }else {
                    Y.Wegas.editor.edit(e.node.data, function(cfg) {           
                        this._dataSource.rest.put(cfg);
                    }, null, this);
                }
            }, null, this);
            
            // Turn tree element selection on
            this._treeView.subscribe('clickEvent', this._treeView.onEventToggleHighlight);  
            
            // Hide the menu as soon as user mouses out
            this.get(CONTENTBOX).delegate('mouseleave', function(){             
                Y.Wegas.editor._editMenu.hide();
            }, '.ygtvrow');
        },
        
        syncUI: function() {
        },
        
        destroyer: function() {
            this._treeView.destroy();
        },
        
        _genVariableInstanceElements: function(label, el) {
            switch (el['@class']) {
                case 'StringVariableInstance' :
                case 'NumberVariableInstance' :
                    return {
                        label: label+': '+el['value'],
                        title: label+': '+el['value'],
                        data: el
                    }
                    break;
                    
                case 'MCQVariableInstance' :
                    var l = label+((el.replies.length >0)?': '+el.replies[0].name:': unanswered');
                    return {
                        type:'Text',
                        label: l,
                        title: l,
                        data: el
                    }
                    break;
                default:
                    return {
                        type:'Text',
                        label: label,
                        title: label,
                        data: el
                    }
                    break;
                    
            }
        },
        _genPageTreeViewElements: function(elts) {
            var type2text = {
                PMGChoiceDisplay: "Choice displayer"
            }, 
            ret = [], j=0, text;
            for (; j<elts.length;j++) {
                el = elts[j];
                text = (type2text[el.type] || el.type)+': '+(el.label || el.name || el.id || 'unnamed');
                switch (el.type) {
                    case 'List':
                        ret.push( {
                            type:'Text',
                            label:'List: '+ (el['label'] || 'unnamed'),
                            title: 'List: '+ (el['label'] || 'unnamed'), 
                            data: el,
                            children:this._genPageTreeViewElements(el.children)
                        });
                        break;
                    case 'VariableDisplay':
                        text = 'Variable displayer: '+(el.variable);
                        ret.push( {
                            type:'Text',
                            label:text,
                            title: text, 
                            data: el
                        });
                        break;
                    case 'Text':
                        ret.push( {
                            type:'Text',
                            label: 'Text: '+el.content.substring(0, 15)+"...",
                            title: el.content, 
                            data: el
                        });
                        break;
                    case 'Button':
                        ret.push( {
                            type:'Text',
                            label:text,
                            title: text, 
                            data: el,
                            children:this._genPageTreeViewElements([el.subpage])
                        });
                        break;
                    default:
                        ret.push( {
                            type:'Text',
                            label:text,
                            title: text, 
                            data: el
                        });
                        break;
                            
                }
            }
            return ret;
        },
        _genScopeTreeViewElements: function(el) {
            var children=[], j, label;
            for (j in el.scope.variableInstances) {
                subEl = el.scope.variableInstances[j];
                label = '';
                switch (el.scope['@class'] ) {
                    case 'PlayerScope':
                        label = Y.Wegas.app.dataSources.Game.rest.getPlayerById(j).name;
                        break;
                    case 'TeamScope':
                        label = Y.Wegas.app.dataSources.Game.rest.getTeamById(j).name;
                        break;
                    case 'GameModelScope':
                        label = 'Global';
                        break;
                }
                children.push(this._genVariableInstanceElements(label, subEl));
            }
            return children;
        },
        _genTreeViewElements: function(elements) {
            var class2text = {
                MCQVariableDescriptor: "Choice",
                StringVariableDescriptor: "String",
                NumberVariableDescriptor: "Number"
            }, ret = [], i, el, text;
            
            for (i in elements) {
                el = elements[i];
                
                switch (el['@class']) {
                    case 'StringVariableDescriptor':
                    case 'NumberVariableDescriptor':
                    case 'ListVariableDescriptor':
                    case 'MCQVariableDescriptor':
                        if ((this.get('includeClasses')== null) || (el['@class'] in this.get('includeClasses'))) {
                            text = (class2text[el['@class']] || el['@class'])+': '+el['name'];
                            ret.push( {
                                type:'Text',
                                label: text,
                                title: text,
                                children: this._genScopeTreeViewElements(el),
                                data: el
                            });
                        }
                        break;
                    case 'Page':
                        text = 'Page: '+el['label'];
                        ret.push( {
                            type:'Text',
                            label: text,
                            title: text,
                            expanded:true, 
                            children: this._genPageTreeViewElements(el.children),
                            data: el
                        });
                        break;
                        
                    case 'GameModel':
                        text = 'Game model: '+el['name'];
                        ret.push( {
                            //  type:'Text',
                            label: text,
                            //  title: text,
                            expanded:true, 
                            children: this._genTreeViewElements(el.games),
                            data: el
                        });
                        break;
                    case 'Game':
                        text = 'Game: '+el['name']+' (token:'+el.token+')';
                        ret.push( {
                            type: 'html',
                            html: text+EDITBUTTONTPL,
                            title: text,
                            expanded:true, 
                            children: this._genTreeViewElements(el.teams),
                            data: el,
                            contentStyle: this.getClassName('icon-game')
                        });
                        break;
                    case 'Team':
                        text = 'Team: '+el['name'];
                        ret.push( {
                            type:'html',
                            html:text+EDITBUTTONTPL,
                            title: text, 
                            expanded:false, 
                            children: this._genTreeViewElements(el.players),
                            data: el,
                            contentStyle: this.getClassName('icon-team')
                        })
                        break;
                    case 'Player':
                        ret.push( {
                            type:'html',
                            html:'Player: '+el['name'],
                            title: 'Player: '+el['name'],
                            data: el,
                            contentStyle: this.getClassName('icon-player')
                        })
                        break;
                    default:
                        text = (class2text[el['@class']] || el['@class'])+': '+el['name'];
                        ret.push( {
                            type:'Text',
                            label: text,
                            title: text,
                            data: el
                        });
                        break;
                }
            }
            return ret;
        }
        
    }, {
        ATTRS : {
            classTxt: {
                value: 'TreeView'
            },
            type: {
                value: "TreeView"
            },
            includeClasses: {
                value: null
            },
            dataSource: {}
        }
    });
     
    
    Y.namespace('Wegas').WTreeView = WTreeView;
});