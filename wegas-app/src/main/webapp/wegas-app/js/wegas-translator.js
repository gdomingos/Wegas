/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add("wegas-translator", function(Y) {

    function Translator() {
        this._strs = Y.Intl.get("wegas-translator");
    }

    Translator.prototype = {
        constructor: Translator,
        getRB: function() {
            return this._strs;
        }
    };
    Y.namespace('Wegas').Translator = Translator;
});
