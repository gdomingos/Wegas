/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */



YUI.add('wegas-treeview', function (Y) {
    "use strict";

    var CONTENTBOX = 'contentBox', WTreeView,
    YAHOO = Y.YUI2,
    EDITBUTTONTPL = "<span class=\"wegas-treeview-editmenubutton\"></span>";

    WTreeView = Y.Base.create("wegas-treeview", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {

        // *** Private fields ** //
        dataSource: null,
        pushButton: null,
        treeView: null,

        // ** Lifecycle methods ** //
        initializer: function () {
            this.dataSource = Y.Wegas.app.dataSources[this.get('dataSource')];
        },

        renderUI: function () {
            var node = this.get(CONTENTBOX).append('<div></div>');

            // Render YUI2 TreeView widget
            // Y.on('domready', Y.bind(function () {                               // @hack to ensure YUI libs are properly
            Y.log("renderUi()", "log", "Y.Wegas.WTreeView");
            this.treeView = new YAHOO.widget.TreeView(node.getDOMNode());
            this.treeView.singleNodeHighlight = true;
            this.treeView.render();
        // }, this));;
        },

        bindUI: function () {
            this.dataSource.after("response", this.syncUI, this);               // Listen updates on the target datasource

            this.treeView.subscribe("clickEvent", function (e) {                // When a leaf is clicked
                YAHOO.log(e.node.index + " label was clicked", "info", "Wegas.WTreeView");
                // Either show the edit menu
                if (e.event.target.className === "wegas-treeview-editmenubutton") {
                    Y.Wegas.editor.showEditMenu(e.node.data, this.dataSource);
                    Y.Wegas.editor._editMenu.get("boundingBox").appendTo(e.event.target.parentNode);
                    Y.Wegas.editor._editMenu.set("align", {
                        node: e.event.target,
                        points: ["tr", "br"]
                    });
                } else {                                                        // Or display the edit tab
                    Y.Wegas.editor.showUpdateForm(e.node.data, this.dataSource);
                }
            }, null, this);

            // Turn tree element selection on
            this.treeView.subscribe('clickEvent', this.treeView.onEventToggleHighlight);

            // Hide the menu as soon as user mouses out
            this.get(CONTENTBOX).delegate('mouseleave', Y.Wegas.editor._editMenu.hide, '.ygtvrow');
        },

        syncUI: function () {
            var treeViewElements = this.genTreeViewElements(this.dataSource.rest.getCache());
            this.treeView.removeChildren(this.treeView.getRoot());
            this.treeView.buildTreeFromObject(treeViewElements);
            this.treeView.render();
        },

        destroyer: function () {
            this.treeView.destroy();
        },

        // ** Private methods ** //
        genVariableInstanceElements: function (label, el) {
            var l;

            switch (el.get('@class')) {
                case 'StringInstance':
                case 'NumberInstance':
                case 'ListInstance':
                    return {
                        label: label + ': ' + el.get("value"),
                        title: label + ': ' + el.get("value"),
                        data: el
                    };

                case 'QuestionInstance':
                    l = label + ((el.get("replies").length > 0) ? ': ' + el.get("replies").get("name") : ': unanswered');
                    return {
                        type: 'Text',
                        label: l,
                        title: l,
                        data: el
                    };

                case 'InboxInstance':
                    var k, children = [];

                    label += "(" + el.get("messages").length + ")";

                    for (k = 0; k < el.get("messages").length; k += 1) {
                        children.push({
                            type: 'Text',
                            label: el.get("messages")[k].get("subject"),
                            title: el.get("messages")[k].get("subject")
                        });
                    }
                    return {
                        type: 'Text',
                        label: label,
                        title: label,
                        data: el,
                        children: children
                    };

                default:
                    return {
                        type: 'Text',
                        label: label,
                        title: label,
                        data: el
                    };
            }
        },

        genPageTreeViewElements: function (elts) {
            var ret = [], j, text, el,
            type2text = {
                PMGChoiceDisplay: "Choice displayer"
            };

            for (j = 0; j < elts.length; j += 1) {
                el = elts[j];
                text = (type2text[el.type] || el.type) + ': ' + (el.label || el.name || el.id || 'unnamed');
                switch (el.type) {
                    case 'List':
                        ret.push({
                            type: 'Text',
                            label: 'List: ' + (el.label || 'unnamed'),
                            title: 'List: ' + (el.label || 'unnamed'),
                            data: el,
                            children: this.genPageTreeViewElements(el.children)
                        });
                        break;
                    case 'VariableDisplay':
                        text = 'Variable displayer: ' + (el.variable);
                        ret.push({
                            type: 'Text',
                            label: text,
                            title: text,
                            data: el
                        });
                        break;
                    case 'Text':
                        ret.push({
                            type: 'Text',
                            label: 'Text: ' + el.content.substring(0, 15) + "...",
                            title: el.content,
                            data: el
                        });
                        break;
                    case 'Button':
                        ret.push({
                            type: 'Text',
                            label: text,
                            title: text,
                            data: el,
                            children: (el.subpage) ? this.genPageTreeViewElements([el.subpage]) : []
                        });
                        break;
                    default:
                        ret.push({
                            type: 'Text',
                            label: text,
                            title: text,
                            data: el
                        });
                        break;

                }
            }
            return ret;
        },
        genScopeTreeViewElements: function (el) {
            var children = [], i, label, team, player, subEl;

            for (i in el.get("scope").get("variableInstances")) {
                if (el.get("scope").get("variableInstances").hasOwnProperty(i)) {
                    subEl = el.get("scope").get("variableInstances")[i];
                    label = '';
                    switch (el.get("scope").get('@class')) {
                        case 'PlayerScope':
                            player = Y.Wegas.app.dataSources.Game.rest.getPlayerById(i);
                            label = (player) ? player.name : "undefined";
                            break;
                        case 'TeamScope':
                            team = Y.Wegas.app.dataSources.Game.rest.getTeamById(i);
                            label = (team) ? team.name : "undefined";
                            break;
                        case 'GameModelScope':
                            label = 'Global';
                            break;
                    }
                    children.push(this.genVariableInstanceElements(label, subEl));
                }
            }
            return children;
        },
        genTreeViewElements: function (elements) {
            var ret = [], i, el, text;

            for (i in elements) {
                if (elements.hasOwnProperty(i)) {
                    el = elements[i];

                    if (el.get &&
                        (this.get("excludeClasses") === null
                            || !this.get('excludeClasses').hasOwnProperty(el['@class']))
                        && (this.get('includeClasses') === null
                            || this.get('includeClasses').hasOwnProperty(el['@class']))) {
                        switch (el.get('@class')) {
                            case 'StringDescriptor':
                            case 'NumberDescriptor':
                            case 'InboxDescriptor':
                            case 'ChoiceDescriptor':
                            case 'TriggerDescriptor':
                            case 'TaskDescriptor':
                            case 'ResourceDescriptor':
                            case 'DialogueDescriptor':
                                text = el.get('@class').replace("Descriptor", "") + ': ' + el.get("name");
                                ret.push({
                                    type: 'html',
                                    html: text + EDITBUTTONTPL,
                                    title: text,
                                    children: this.genScopeTreeViewElements(el),
                                    data: el,
                                    contentStyle: this.getClassName('icon-' + el.get('@class'))
                                });

                                break;

                            case 'ListDescriptor':
                            case 'QuestionDescriptor':
                                text = el.get('@class').replace("Descriptor", "") + ': ' + el.get("name");
                                ret.push({
                                    type: 'html',
                                    html: text + EDITBUTTONTPL,
                                    title: text,
                                    //children: this.genScopeTreeViewElements(el),
                                    children: this.genTreeViewElements(el.get("items")),
                                    data: el,
                                    contentStyle: this.getClassName('icon-'+el.get('@class'))
                                });
                                break;
                            case 'Page':
                                text = 'Page: ' + el.label;
                                ret.push({
                                    type: 'Text',
                                    label: text,
                                    title: text,
                                    expanded: true,
                                    children: this.genPageTreeViewElements(el.children),
                                    data: el
                                });
                                break;

                            case 'GameModel':
                                text = 'Game model: ' + el.name;
                                ret.push({
                                    //  type:'Text',
                                    label: text,
                                    //  title: text,
                                    expanded: true,
                                    children: this.genTreeViewElements(el.games),
                                    data: el
                                });
                                break;
                            case 'Game':
                                text = 'Game: ' + el.name + ' (token:' + el.token + ')';
                                ret.push({
                                    type: 'html',
                                    html: text + EDITBUTTONTPL,
                                    title: text,
                                    expanded: true,
                                    children: this.genTreeViewElements(el.teams),
                                    data: el,
                                    contentStyle: this.getClassName('icon-game')
                                });
                                break;
                            case 'Team':
                                text = 'Team: ' + el.name;
                                ret.push({
                                    type: 'html',
                                    html: text + EDITBUTTONTPL,
                                    title: text,
                                    expanded: false,
                                    children: this.genTreeViewElements(el.players),
                                    data: el,
                                    contentStyle: this.getClassName('icon-team')
                                });
                                break;
                            case 'Player':
                                ret.push({
                                    type: 'html',
                                    html: 'Player: ' + el.name + EDITBUTTONTPL,
                                    title: 'Player: ' + el.name,
                                    data: el,
                                    contentStyle: this.getClassName('icon-player')
                                });
                                break;
                            default:
                                text = el.get('@class') + ': ' + el.get("name");
                                ret.push({
                                    type: 'Text',
                                    label: text,
                                    title: text,
                                    data: el
                                });
                                break;
                        }
                    }
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
            excludeClasses: {
                value: null
            },
            dataSource: {}
        }
    });


    Y.namespace('Wegas').WTreeView = WTreeView;
});