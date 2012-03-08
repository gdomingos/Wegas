
/** 
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-editmenu', function(Y) {
    var BOUNDINGBOX = 'boundingBox',
    CONTENTBOX = 'contentBox',	
    YAHOO = Y.YUI2,
    EditMenu = Y.Base.create("wegas-editmenu", Y.Widget, [Y.WidgetPosition,  Y.WidgetPositionAlign, Y.WidgetStack], {
        
        // *** Instance Members *** //
        _currentDataSource: null,
        _currentData: null,       
       
        // *** Lifecycle Methods *** //
        renderUI : function() {
            var cb = this.get(CONTENTBOX);
				
            this.menu = new YAHOO.widget.Menu("as-editmenu", { 
                visible: true, 
                position: 'static',  
                hidedelay: 100,
                shadow: true
            }); 
            this.menu.render(cb._node);
        },
        bindUI : function() {
            //var bb = this.get(BOUNDINGBOX);
            //bb.on('mouseupoutside', this.hide, this);
            //bb.on('click', this.hide, this);
            this.menu.subscribe("click", this._onMenuClick, null, this);
        },
        showMenu: function(mouseEvent) {
            //this.move(mouseEvent.clientX + Y.DOM.docScrollX(), mouseEvent.clientY + Y.DOM.docScrollY());
            this.show();
        },
        setMenuItems: function( data, dataSource ) {
            var menuItems = Y.Wegas.editor.get("editorMenus")[data["@class"]];
            
            if (!menuItems) Y.log('error', 'Menu items are undefined.', "Wegas.Editor")
            
            this._currentDataSource = dataSource;
            this._currentData = data;
            
            this.menu.clearContent();
            this.menu.addItems(menuItems);
            this.menu.render();
        },
        
        // *** Private Methods *** //
        _onMenuClick: function(p_sType, args) { 
            var menuItem = args[1],
            action = menuItem.value;
			
            switch (action.op) {
                case "addChild":
                    Y.Wegas.editor.edit({
                        '@class': action.childClass
                    }, function(value) {
                        this._currentDataSource.rest.post(value, this._currentData);
                    }, null, this);
                    break;
            }
            this.hide();
        }
    });
    
    Y.namespace('Wegas').EditMenu = EditMenu;
});