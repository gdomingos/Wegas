/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * Wegas loader, contains module definitions.
 *
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI().use(function(Y) {
    "use strict";
    var CSS = "css";

    if (!YUI_config) {
        YUI_config = {};
    }
    if (!YUI_config.groups) {
        YUI_config.groups = {
            inputex: {
                modulesByType: {}
            }
        };
    }
    if (!YUI_config.Wegas) {
        YUI_config.Wegas = {};
    }
    YUI_config.Wegas.modulesByType = {};

    /**
     * 
     */
    YUI.addGroup = function(name, group) {
        YUI_config.groups[name] = group;
        group.combine = !YUI_config.debug;
        group.filter = YUI_config.debug ? "raw" : "min";                        // Select raw files
        group.base = YUI_config.Wegas.base + group.root;                        // Set up path
        group.comboBase = YUI_config.Wegas.comboBase;                           // Set up combo path
        loadModules(group);
        //YUI.applyConfig(YUI_config);
    };

    YUI.addGroup("wegas", {
        base: "./wegas-app/",
        root: "/wegas-app/",
        modules: {
            /**
             * Base
             */
            "wegas-app": {
                requires: ["base", "plugin", "array-extras", "timers",
                    "wegas-helper", "wegas-entity", "wegas-datasource"]
            },
            "wegas-editable": {
                requires: "inputex-jsonschema"
            },
            /**
             * Persistence
             */
            "wegas-datasource": {
                requires: ["datasource-io", "json"]
            },
            "wegas-scripteval": {
                path: "js/persistence/wegas-scripteval-min.js",
                requires: "wegas-variabledescriptor-entities",
                ws_provides: "ScriptEval"
            },
            "wegas-websocketlistener": {
                path: "js/persistence/wegas-websocketlistener-min.js",
                ws_provides: "WebSocketListener"
            },
            "wegas-pusher-connector": {
                path: "js/persistence/wegas-pusher-connector-min.js",
                requires: "pusher",
                ws_provides: "PusherDataSource"
            },
            "wegas-entity": {
                path: "js/persistence/wegas-entity-min.js",
                requires: "wegas-editable",
                ws_provides: ["Entity", "GameModel"]
            },
            "wegas-variabledescriptor-entities": {
                path: "js/persistence/wegas-variabledescriptor-entities-min.js",
                requires: "wegas-entity",
                ws_provides: ["NumberDescriptor", "TextDescriptor"]
            },
            "wegas-statemachine-entities": {
                path: "js/persistence/wegas-statemachine-entities-min.js",
                ws_provides: ["DialogueDescriptor", "TriggerDescriptor", "FSMDescriptor"]
            },
            "wegas-content-entities": {
                path: "js/persistence/wegas-content-entities-min.js"
            },
            "wegas-object-entities": {
                path: "js/persistence/wegas-object-entities-min.js",
                ws_provides: "ObjectDescriptor"
            },
            "wegas-resourcemanagement-entities": {
                path: "js/persistence/wegas-resourcemanagement-entities-min.js",
                ws_provides: ["ResourceDescriptor", "TaskDescriptor"]
            },
            /**
             * Widgets
             */
            "wegas-widget": {
                requires: ["widget", "widget-child", "widget-parent", "wegas-editable"]
            },
            "wegas-parent": {
                requires: "wegas-widget"
            },
            "wegas-layout-panel": {
                path: "js/widget/wegas-layout-panel-min.js",
                requires: "panel",
                ws_provides: "PanelWidget"
            },
            "wegas-layout-list": {
                path: "js/widget/wegas-layout-list-min.js",
                requires: "wegas-parent",
                ws_provides: "List"
            },
            "wegas-layout-absolute": {
                path: "js/widget/wegas-layout-absolute-min.js",
                requires: ["wegas-plugin", "wegas-layout-absolutecss", "wegas-cssstyles-extra", "wegas-parent"],
                ws_provides: ["AbsoluteLayout", "Position"]
            },
            "wegas-layout-absolutecss": {
                type: CSS
            },
            "wegas-layout-choicelist": {
                path: "js/widget/wegas-layout-choicelist-min.js",
                requires: ["wegas-layout-list", "wegas-layout-choicelistcss"],
                ws_provides: "ChoiceList"
            },
            "wegas-layout-choicelistcss": {
                type: CSS
            },
            "wegas-layout-resizable": {
                path: "js/widget/wegas-layout-resizable-min.js",
                requires: ["wegas-widget", "widget-stdmod", "event-resize", "resize", "wegas-layout-resizablecss"],
                ws_provides: "ResizableLayout"
            },
            "wegas-layout-resizablecss": {
                type: CSS
            },
            "wegas-pageloader": {
                path: "js/widget/wegas-pageloader-min.js",
                ws_provides: "PageLoader",
                requires: "wegas-widget"
            },
            "wegas-popuplistener": {
                path: "js/plugin/wegas-popuplistener-min.js",
                ws_provides: "PopupListener",
                requires: "wegas-panel"
            },
            "wegas-button": {
                path: "js/widget/wegas-button-min.js",
                requires: ["wegas-widget", "wegas-plugin", "button", "wegas-tooltip", "wegas-button-css"],
                ws_provides: "Button"
            },
            "wegas-button-css": {
                type: CSS
            },
            "wegas-loginbutton": {
                path: "js/widget/wegas-loginbutton-min.js",
                requires: "wegas-widgetmenu",
                ws_provides: ["LoginButton", "UserLoginButton"]
            },
            "wegas-chat": {
                path: "js/widget/wegas-chat-min.js",
                requires: ["inputex-textarea", "button"],
                ws_provides: "Chat"
            },
            "wegas-chart": {
                path: "js/widget/wegas-chart-min.js",
                requires: ["charts", "charts-legend"],
                ws_provides: "Chart"
            },
            "wegas-langselector": {
                path: "js/widget/wegas-langselector-min.js",
                ws_provides: "LangSelector"
            },
            "wegas-text": {
                path: "js/widget/wegas-text-min.js",
                ws_provides: "Text",
                requires: "wegas-widget"
            },
            "wegas-image": {
                path: "js/widget/wegas-image-min.js",
                ws_provides: "Image"
            },
            "wegas-box": {
                path: "js/widget/wegas-box-min.js",
                ws_provides: "Box",
                requires: "wegas-widget"
            },
            "wegas-tabview": {
                path: "js/widget/wegas-tabview-min.js",
                requires: ["tabview", "wegas-parent", "wegas-tabviewcss", "wegas-popuplistener"],
                ws_provides: "TabView"
            },
            "wegas-tabviewcss": {
                type: CSS
            },
            "wegas-gaugedisplay": {
                path: "js/widget/wegas-gaugedisplay-min.js",
                requires: ["gauge", "wegas-templatecss"],
                ws_provides: "GaugeDisplay"
            },
            "wegas-inbox": {
                path: "js/widget/wegas-inbox-min.js",
                requires: ["tabview", "wegas-inboxcss", "wegas-tabviewcss",
                    "wegas-widgettoolbar", "wegas-translator", "template-micro"],
                ws_provides: "InboxDisplay"
            },
            "wegas-inboxcss": {
                type: CSS
            },
            "wegas-inbox-list": {
                path: "js/widget/wegas-inbox-list-min.js",
                requires: ["template-micro", "wegas-inboxcss"],
                ws_provides: "InboxList"
            },
            "wegas-form": {
                path: "js/widget/wegas-form-min.js",
                requires: ["wegas-inputex", "wegas-widgettoolbar",
                    "inputex-group", "event-valuechange"],
                ws_provides: "Form"
            },
            "wegas-gallery": {
                path: "js/widget/wegas-gallery-min.js",
                requires: ["wegas-widget", "wegas-imageloader", "scrollview-base",
                    "scrollview-paginator", "scrollview-scrollbars", "wegas-gallerycss",
                    "stylesheet", "event-resize"],
                ws_provides: "Gallery"
            },
            "wegas-gallerycss": {
                type: CSS
            },
            "wegas-googletranslate": {
                path: "js/widget/wegas-googletranslate-min.js",
                requires: "googletranslate",
                ws_provides: "GoogleTranslate"
            },
            "wegas-team": {
                path: "js/widget/wegas-team-min.js",
                requires: ["wegas-inputex", "wegas-button",
                    "wegas-editor-action", "wegas-inputex-multipleoptions",
                    "inputex-select", "inputex-string", "inputex-list", "inputex-hidden",
                    "inputex-group", "inputex-autocomplete", "inputex-password", "inputex-email",
                    "wegas-gameinformation", "wegas-teamcss", "autocomplete-highlighters"],
                ws_provides: ["Team", "JoinTeam", "EditTeam"]
            },
            "wegas-teamcss": {
                type: CSS
            },
            "wegas-translator": {
                pkg: "js/",
                lang: ["fr"]
            },
            /** Plugins **/
            "wegas-plugin": {
                requires: "timers"
            },
            "wegas-userpreferences": {
                path: "js/plugin/wegas-userpreferences-min.js",
                requires: "wegas-plugin",
                ws_provides: "UserPreferences"
            },
            "wegas-tooltip": {
                path: "js/plugin/wegas-tooltip-min.js",
                requires: ["wegas-plugin", "event-mouseenter", "widget", "widget-stack",
                    "widget-position", "widget-position-constrain"],
                ws_provides: "Tooltip"
            },
            "wegas-templatecss": {
                type: CSS
            },
            "wegas-template": {
                path: "js/widget/wegas-template-min.js",
                requires: ["template-micro", "wegas-templatecss"],
                ws_provides: ["Template", "ValueboxTemplate", "BoxTemplate",
                    "NumberTemplate", "TitleTemplate", "FractionTemplate", "TextTemplate"]
            },
            "wegas-treeview": {
                path: "js/widget/wegas-treeview-min.js",
                requires: "treeview",
                ws_provides: "TreeViewWidget"
            },
            "wegas-injector": {
                path: "js/plugin/wegas-injector-min.js",
                ws_provides: "Injector"
            },
            "wegas-cssloader": {
                path: "js/plugin/wegas-cssloader-min.js",
                requires: "stylesheet",
                ws_provides: "CSSLoader"
            },
            "wegas-slideshow": {
                path: "js/plugin/wegas-slideshow-min.js",
                requires: "wegas-plugin",
                ws_provides: "SlideShow"
            },
            "wegas-cssstyles": {
                path: "js/plugin/wegas-cssstyles-min.js",
                requires: "wegas-plugin",
                ws_provides: "CSSStyles"
            },
            "wegas-cssstyles-extra": {
                path: "js/plugin/wegas-cssstyles-extra-min.js",
                requires: "wegas-cssstyles",
                ws_provides: ["CSSBackground", "CSSText", "CSSPosition", "CSSSize"]
            },
            "wegas-conditionaldisable": {
                path: "js/plugin/wegas-conditionaldisable-min.js",
                ws_provides: "ConditionalDisable"
            },
            "wegas-blockrightclick": {
                path: "js/plugin/wegas-blockrightclick-min.js",
                ws_provides: "BlockRightclick"
            },
            "wegas-visibilitytimer": {
                path: "js/plugin/wegas-visibilitytimer-min.js",
                requires: "wegas-plugin",
                ws_provides: ["ShowAfter", "HideAfter"]
            },
            "wegas-simpledialogue": {
                path: "js/widget/wegas-simpledialogue-min.js",
                ws_provides: "SimpleDialogue"
            }
        }
    });

    /**
     * Utilities
     */
    YUI.addGroup("wegas-util", {
        base: "./wegas-util/",
        root: "/wegas-util/",
        modules: {
            "wegas-helper": {},
            "datatable-csv": {
                ws_provides: "DatatableCSV"
            },
            "event-mouse-startstop": {
                requires: "event-base"
            },
            /** Treeview **/
            "treeview": {
                requires: ["widget", "widget-parent", "widget-child", "treeviewcss"]
            },
            "treeviewcss": {
                type: CSS
            },
            "treeview-filter": {},
            "treeview-sortable": {
                requires: ["sortable", "sortable-scroll"]
            },
            "wegas-progressbar": {
                requires: "widget"
            },
            "wegas-widgetmenu": {
                requires: ["event-mouseenter", "event-outside",
                    "widget-stack", "widget-position", "widget-position-align", "widget-position-constrain",
                    "wegas-button", "wegas-widgetmenucss"]
            },
            "wegas-widgetmenucss": {
                type: CSS
            },
            "wegas-widgettoolbar": {
                requires: ["wegas-widgettoolbarcss", "wegas-widgetmenu"],
                ws_provides: "WidgetToolbar"
            },
            "wegas-widgettoolbarcss": {
                type: CSS
            },
            "wegas-panel": {
                ws_provides: "Panel",
                requires: ["wegas-panelcss", "widget-buttons", "widget-modality",
                    "widget-position", "widget-position-align", "widget-stack",
                    "widget-stdmod", "transition"]
            },
            "wegas-panelcss": {
                type: CSS
            },
            "wegas-menu": {
                requires: ["button", "wegas-menucss"],
                ws_provides: "WegasMenu"
            },
            "wegas-menucss": {
                type: CSS
            },
            "wegas-imageloader": {
                requires: ["io-base", "imageloader"]
            },
            "wegas-panel-node": {
                requires: ["dd-drag", "plugin"],
                ws_provides: "PanelNode"
            }
        }
    });
    /**
     * Editor
     */
    YUI.addGroup("wegas-editor", {
        base: "./wegas-editor/",
        root: "/wegas-editor/",
        modules: {
            /**
             * Inputex Fields
             */
            "wegas-inputex": {
                type: CSS,
                requires: "inputex"
            },
            "wegas-inputex-object": {
                path: "js/inputex/wegas-inputex-object-min.js",
                requires: "inputex-object",
                ix_provides: "wegasobject"
            },
            "wegas-inputex-multipleoptions": {
                path: "js/inputex/wegas-inputex-multipleoptions-min.js",
                requires: "inputex-group",
                ix_provides: "multipleoptions"
            },
            "wegas-inputex-colorpicker": {
                path: "js/inputex/wegas-inputex-colorpicker-min.js",
                requires: ["inputex-field", "overlay"],
                ix_provides: "colorpicker"
            },
            "wegas-inputex-keyvalue": {
                path: "js/inputex/wegas-inputex-keyvalue-min.js",
                requires: "inputex-keyvalue",
                ix_provides: "wegaskeyvalue"
            },
            "wegas-inputex-rte": {
                path: "js/inputex/wegas-inputex-rte-min.js",
                requires: ["wegas-inputex", "inputex-textarea", "tinymce", "wegas-panel-fileselect"],
                ix_provides: "html"
            },
            "wegas-inputex-list": {
                path: "js/inputex/wegas-inputex-list-min.js",
                requires: ["inputex-group", "wegas-text"],
                ix_provides: ["listfield", "editablelist", "pluginlist"]
            },
            "wegas-inputex-hashlist": {
                path: "js/inputex/wegas-inputex-hashlist-min.js",
                requires: "inputex-list",
                ix_provides: "hashlist"
            },
            "wegas-inputex-script": {
                path: "js/inputex/wegas-inputex-script-min.js",
                requires: "wegas-inputex-ace"
            },
            "wegas-inputex-variabledescriptorselect": {
                path: "js/inputex/wegas-inputex-variabledescriptorselect-min.js",
                requires: ["wegas-inputex", "inputex-group", "inputex-combine",
                    "inputex-number", "inputex-select"],
                ix_provides: ["entityarrayfieldselect", "variabledescriptorselect"]
            },
            "wegas-inputex-pageloaderselect": {
                path: "js/inputex/wegas-inputex-pageloaderselect-min.js",
                requires: "wegas-inputex-combobox",
                ix_provides: "pageloaderselect"
            },
            "wegas-inputex-wysiwygscript": {
                path: "js/inputex/wegas-inputex-wysiwygscript-min.js",
                requires: ["wegas-inputex", "wegas-inputex-list", "wegas-inputex-script",
                    "wegas-inputex-variabledescriptorselect",
                    "wegas-button", "inputex-list", "wegas-inputex-url",
                    "wegas-inputex-rte", // for mail attachements in script
                    "esprima"],
                ix_provides: ["script", "variableselect", "flatvariableselect"]
            },
            "wegas-inputex-url": {
                path: "js/inputex/wegas-inputex-url-min.js",
                requires: ["inputex-url", "wegas-panel-fileselect"],
                ix_provides: ["wegasurl", "wegasimageurl"]
            },
            "wegas-inputex-ace": {
                path: "js/inputex/wegas-inputex-ace-min.js",
                requires: ["ace", "inputex-textarea", "wegas-inputex"],
                ix_provides: "ace"
            },
            "wegas-inputex-markup": {
                path: "js/inputex/wegas-inputex-markup-min.js",
                ix_provides: "markup"
            },
            "wegas-inputex-pageselect": {
                path: "js/inputex/wegas-inputex-pageselect-min.js",
                requires: "inputex-select",
                ix_provides: "pageselect"
            },
            "wegas-inputex-now": {
                path: "js/inputex/wegas-inputex-now-min.js",
                requires: ["wegas-inputex", "inputex-hidden"],
                ix_provides: "now"
            },
            "wegas-inputex-contextgroup": {
                path: "js/inputex/wegas-inputex-contextgroup-min.js",
                requires: ["inputex-group", "inputex-select"],
                ix_provides: "contextgroup"
            },
            "wegas-inputex-combobox": {
                path: "js/inputex/wegas-inputex-combobox-min.js",
                requires: ["inputex-autocomplete", "inputex-string", "autocomplete",
                    "autocomplete-filters"],
                ix_provides: "combobox"
            },
            "wegas-panel-fileselect": {
                path: "js/widget/wegas-panel-fileselect-min.js",
                requires: ["panel", "wegas-fileexplorer"],
                ws_provides: "FileSelect"
            },
            "wegas-editorcss": {
                type: CSS
            },
            "wegas-editor-asciicss": {
                type: CSS
            },
            "wegas-editor-action": {
                path: "js/plugin/wegas-editor-action-min.js",
                requires: ["wegas-button", "wegas-plugin", "event-key", "inputex-string"],
                ws_provides: ["OpenTabAction", "OpenTabButton", "Linkwidget"]
            },
            "wegas-editor-entityaction": {
                path: "js/plugin/wegas-editor-entityaction-min.js",
                requires: ["wegas-plugin", "wegas-form"],
                ws_provides: ["NewEntityAction", "EditEntityAction", "NewEntityButton"]
            },
            "wegas-editor-form": {
                path: "js/widget/wegas-editor-form-min.js",
                ws_provides: ["EditEntityForm", "EditParentGameModelForm"]
            },
            "wegas-editor-widgetaction": {
                path: "js/plugin/wegas-editor-widgetaction-min.js",
                requires: "wegas-editor-entityaction",
                ws_provides: ["EditWidgetAction", "DeleteWidgetAction"]
            },
            "wegas-logger": {
                path: "js/widget/wegas-logger-min.js",
                requires: ["console", "console-filters"],
                ws_provides: "Logger"
            },
            "wegas-pageeditorcss": {
                type: CSS
            },
            "wegas-pageeditor": {
                path: "js/plugin/wegas-pageeditor-min.js",
                ws_provides: "PageEditor",
                requires: ["diff_match_patch", "wegas-editor-widgetaction",
                    "event-mouse-startstop", "node-scroll-info",
                    "wegas-pageeditor-dragdrop", "wegas-pageeditorcss",
                    "wegas-pageeditor-resize"]
            },
            "wegas-pageeditor-dragdrop": {
                path: "js/plugin/wegas-pageeditor-dragdrop-min.js",
                ws_provides: "PageEditorDD",
                requires: ["dd-constrain", "dd-scroll", "wegas-pageeditorcss"]
            },
            "wegas-pageeditor-resize": {
                path: "js/plugin/wegas-pageeditor-resize-min.js",
                ws_provides: "PageEditorResize",
                requires: ["dd-constrain", "dd-scroll", "wegas-pageeditorcss"]
            },
            "wegas-preview-fullscreen": {
                path: "js/plugin/wegas-preview-fullscreen-min.js",
                ws_provides: "PreviewFullScreen",
                requires: "wegas-pageeditorcss"
            },
            'wegas-fullwidthtab': {
                path: "js/plugin/wegas-fullwidthtab-min.js",
                ws_provides: "FullWidthTab"
            },
            "wegas-console": {
                path: "js/widget/wegas-console-min.js",
                requires: "wegas-inputex-ace",
                ws_provides: "Console"
            },
            "wegas-console-wysiwyg": {
                path: "js/widget/wegas-console-wysiwyg-min.js",
                requires: ["wegas-console", "wegas-inputex-wysiwygscript", "inputex-hidden"],
                ws_provides: "WysiwygConsole"
            },
            "wegas-editor-treeview": {
                path: "js/widget/wegas-editor-treeview-min.js",
                requires: ["treeview", "wegas-widgetmenu", "wegas-editor-treeviewcss"],
                ws_provides: ["EditorTreeView", "TeamTreeView"]
            },
            "wegas-editor-treeviewcss": {
                type: CSS
            },
            "wegas-editor-variabletreeview": {
                path: "js/widget/wegas-editor-variabletreeview-min.js",
                requires: ["wegas-editor-treeview", "treeview-sortable", "treeview-filter"],
                ws_provides: "VariableTreeView"
            },
            "wegas-editor-pagetreeview": {
                path: "js/widget/wegas-editor-pagetreeview-min.js",
                ws_provides: "PageTreeview"
            },
            "wegas-scriptlibrary": {
                path: "js/widget/wegas-scriptlibrary-min.js",
                requires: ["button", "wegas-inputex-ace", "inputex-select", "wegas-cssloader"],
                ws_provides: "ScriptLibrary"
            },
            "wegas-fileexplorer": {
                path: "js/widget/wegas-fileexplorer-min.js",
                requires: ["treeview", "treeview-filter", "uploader-html5",
                    "wegas-menu", "wegas-progressbar", "wegas-fileexplorercss",
                    "wegas-content-entities", "wegas-tooltip"],
                ws_provides: "FileExplorer"
            },
            "wegas-fileexplorercss": {
                type: CSS
            },
            "wegas-statemachineviewer": {
                path: "js/widget/wegas-statemachineviewer-min.js",
                requires: ["wegas-statemachineviewercss", "wegas-statemachine-entities",
                    "dd-constrain", "jsplumb-yui", "button", "event-mousewheel",
                    "slider", "wegas-panel-node", "wegas-inputex-wysiwygscript"],
                ws_provides: "StateMachineViewer"
            },
            "wegas-statemachineviewercss": {
                type: CSS
            },
            "gallery-colorpickercss": {
                type: CSS
            },
            "wegas-dashboard": {
                path: "js/widget/wegas-dashboard-min.js",
                requires: "datatable",
                ws_provides: "Dashboard"
            }
        }
    });
    /*
     * MCQ
     */
    YUI.addGroup("wegas-mcq", {
        base: "./wegas-mcq/",
        root: "/wegas-mcq/",
        modules: {
            "wegas-mcq-entities": {
                ws_provides: "QuestionDescriptor"
            },
            "wegas-mcq-tabview": {
                requires: ["tabview", "wegas-tabviewcss", "wegas-gallery",
                    "wegas-translator", "wegas-mcq-tabviewcss", "wegas-mcq-printcss"],
                ws_provides: "MCQTabView"
            },
            "wegas-mcq-tabviewcss": {
                type: CSS
            },
            "wegas-mcq-printcss": {
                type: CSS
            }}
    });
    /* Lobby */
    YUI.addGroup("wegas-lobby", {
        base: "./wegas-lobby/",
        root: "/wegas-lobby/",
        modules: {
            "wegas-inputex-permissionselect": {
                requires: ["inputex-list", "inputex-checkbox", "wegas-inputex-roleselect"],
                ws_provides: "RolePermissionList"
            },
            "wegas-inputex-gamemodelselect": {
                requires: ["inputex-select", "inputex-list", "inputex-uneditable"],
                ix_provides: ["gamemodelselect", "enrolmentkeylist", "accountkeylist"]
            },
            "wegas-inputex-roleselect": {
                requires: "inputex-select",
                ix_provides: "roleselect"
            },
            "wegas-gameinformation": {
                path: "js/wegas-gameinformation-min.js",
                requires: "wegas-teamcss",
                ws_provides: "GameInformation"
            },
            "wegas-join-token": {
                requires: "wegas-team",
                ws_provides: "TokenJoin"
            },
            "wegas-loginwidget": {
                requires: ["inputex-group", "inputex-password", "inputex-string",
                    "inputex-hidden", "inputex-email", "inputex-checkbox", "button",
                    "event-key", "wegas-widget", "wegas-button", "wegas-logincss",
                    "wegas-gameinformation"],
                ws_provides: "LoginWidget"
            },
            "wegas-logincss": {
                type: CSS
            },
            "wegas-sharerole": {
                requires: ["inputex-select", "inputex-list", "inputex-string", "inputex-checkbox"],
                ws_provides: ["ShareRole", "TeamsList"]
            },
            "wegas-shareuser": {
                requires: ["inputex-list", "inputex-checkbox", "inputex-autocomplete",
                    "autocomplete-highlighters", "inputex-hidden", "wegas-inputex-markup"],
                ws_provides: "ShareUser"
            },
            "wegas-lobby-datatable": {
                requires: ["datatable", "button-group", "event-valuechange", "wegas-lobby-datatablecss"],
                ws_provides: "GameDataTable"
            },
            "wegas-lobby-datatablecss": {
                type: CSS
            },
            "wegas-lobby-button": {
                requires: ["uploader-html5", "treeview"],
                ws_provides: ["UploadFileButton", "GameModelHistory"]
            }
        }
    });
    //YUI.addGroup("wegas-form", {
    //    base: "./wegas-form/",
    //    root: "/wegas-form/",
    //    modules: {
    //        form: {
    //            requires: ["base", "widget", "widget-parent", "widget-child",
    //                "formcss"]
    //        },
    //        formcss: {
    //            requires: ["base", "widget", "widget-parent", "widget-child"]
    //        },
    //        "form-rte": {
    //            requires: ["form", "tinymce"]
    //        }
    //    }
    //});
    YUI.addGroup("wegas-others", {
        base: "./",
        root: "/",
        modules: {
            /** book CYOA **/
            "wegas-book": {
                path: "wegas-games/wegas-book/js/wegas-book-fight-min.js",
                requires: "wegas-book-dice",
                ws_provides: "Fight"
            },
            "wegas-book-dice": {
                path: "wegas-games/wegas-book/js/wegas-book-dice-min.js",
                ws_provides: "Dice"
            },
            /** Monopoly **/
            "wegas-monopoly-controller": {
                path: "wegas-games/wegas-monopoly/js/wegas-monopoly-controller-min.js",
                requires: ["wegas-monopoly-controller", "wegas-book-dice", "wegas-button"],
                ws_provides: "MonopolyController"
            },
            "wegas-monopoly-display": {
                path: "wegas-games/wegas-monopoly/js/wegas-monopoly-display-min.js",
                requires: "wegas-monopoly-display",
                ws_provides: "Monopolydisplay"
            },
            /** CEP **/
            "wegas-cep-folder": {
                path: "wegas-cep/js/wegas-cep-folder-min.js",
                requires: ["wegas-nodeformatter", "wegas-itemselector",
                    "wegas-panel", "wegas-simpledialogue"],
                ws_provides: "CEPFolder"
            }
            /* Chess */
            //"wegas-chess": {
            //    path: "wegas-games/wegas-chess/js/wegas-chess-min.js",
            //    ws_provides: "ChessBoard",
            //    requires: "transition"
            //}
        }
    });

    /* Other libraries */
    YUI.addGroup("wegas-libraries", {
        base: "./lib/",
        root: "/lib/",
        modules: {
            gauge: {
                path: "gauge-min.js"
            },
            diff_match_patch: {
                path: "diffmatchpatch/diff_match_patch.js"
            }
        }
    });
    /* Other libraries (that should not be combined) */
    YUI_config.groups.libraries = {
        async: false,
        combine: false,
        base: YUI_config.Wegas.base + "/lib/",
        root: "/lib/",
        modules: {
            "jsplumb-yui": {
                path: "jsPlumb/yui.jsPlumb-1.6.4-min.js"
            },
            esprima: {
                path: "esprima/esprima-min.js"
            },
            escodegen: {
                path: "escodegen/escodegen-min.js"
            },
            tinymce: {
                path: "tinymce/tinymce.min.js"
            },
            excanvas: {
                path: "excanvas/excanvas.compiled.js"
            },
            crafty: {
                path: "crafty/0.6.2/crafty-min.js"
            },
            ace: {
                async: false,
                path: "ace/src-min/ace.js"
            },
            pusher: {
                fullpath: "//js.pusher.com/2.2/pusher.min.js"
            },
            googletranslate: {
                async: false,
                fullpath: "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            }
        }
    };

    function loadModules(group) {
        var i, module, type, fileName, moduleName,
            modules = group.modules,
            allModules = [];

        for (moduleName in modules) {                                           // Loop through all modules
            if (modules.hasOwnProperty(moduleName)) {
                allModules.push(moduleName);                                    // Build a list of all modules

                module = modules[moduleName];
                type = module.type || "js";
                fileName = (type === CSS) ? moduleName.replace(/-?css$/gi, "") : moduleName;
                module.path = module.path || type + "/" + fileName + "-min." + type;

                if (type === CSS && YUI_config.debug) {
                    module.path = module.path.replace(/-min/gi, "");
                }

                if (module.ws_provides) {                                       // Build a reverse index on which module provides what type (Wegas)
                    if (Y.Lang.isArray(module.ws_provides)) {
                        for (i = 0; i < module.ws_provides.length; i = i + 1) {
                            YUI_config.Wegas.modulesByType[module.ws_provides[i]] = moduleName;
                        }
                    } else {
                        YUI_config.Wegas.modulesByType[module.ws_provides] = moduleName;
                    }
                }
                if (module.ix_provides) {                                       // Build a reverse index on which module provides what type (inputEx)
                    if (Y.Lang.isArray(module.ix_provides)) {
                        for (i = 0; i < module.ix_provides.length; i = i + 1) {
                            YUI_config.groups.inputex.modulesByType[module.ix_provides[i]] = moduleName;
                        }
                    } else {
                        YUI_config.groups.inputex.modulesByType[module.ix_provides] = moduleName;
                    }
                }
            }
        }
        group.allModules = allModules;
    }
});
