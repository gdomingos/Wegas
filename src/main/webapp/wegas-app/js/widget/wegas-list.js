/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-list', function (Y) {
    "use strict";

    var BOUNDINGBOX = 'boundingBox',
        CONTENTBOX = 'contentBox',
        List;

    List = Y.Base.create("wegas-list", Y.Widget, [Y.WidgetParent, Y.WidgetChild, Y.Wegas.Widget ], {

        syncUI: function () {
            var cb = this.get(CONTENTBOX);

            if (this.get('direction') === 'vertical') {
                cb.addClass(this.getClassName('vertical'));
                cb.removeClass(this.getClassName('horizontal'));
            } else {
                cb.addClass(this.getClassName('horizontal'));
                cb.removeClass(this.getClassName('vertical'));
            }
            this.get(BOUNDINGBOX).append('<div style="clear:both"></div>');
        }
    }, {
        ATTRS : {
            defaultChildType: {
                value: "Text"
            },
            direction: {
                value: 'vertical'
            },
            classTxt: {
                value: 'List'
            },
            type: {
                value: "List"
            }
        }
    });

    Y.namespace('Wegas').List = List;
});