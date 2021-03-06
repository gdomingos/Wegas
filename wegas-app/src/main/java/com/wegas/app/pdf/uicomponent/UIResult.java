/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.app.pdf.uicomponent;

import com.wegas.app.pdf.helper.UIHelper;
import com.wegas.core.persistence.game.Player;
import com.wegas.mcq.persistence.Reply;
import com.wegas.mcq.persistence.Result;
import com.wegas.mcq.persistence.SingleResultChoiceDescriptor;
import java.io.IOException;
import javax.faces.component.FacesComponent;
import javax.faces.component.UIComponentBase;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;

/**
 *
 * Faces component that print a CHoice's Result as xHTML.
 *
 * <pre>
 * <b>Usage:</b>
 * &lt;<b>Result</b> <b>value</b>="#{the Result object}"
 *        <b>player</b>="#{the player to print the result for (may be the test player)}"
 *        <b>editorMode</b>="#{boolean : toggle full export / player export mode}" /%gt;
 *
 * editorMode: is used regardless currentUser permission (this is quite OK
 *             for the time since this component is only included from a UIGameModel instance,
 *             who has already checked such a permission...)
 * </pre>
 *
 * @TODO : editorMode is used regardless currentUser permission (this is quite
 * OK for the time since this component is only included from a UIGameModel
 * instance, who has already checked such a permission...)
 *
 * See WEB-INF/web.xml & WEB-INF/wegas-taglib.xml for tag and params definitions
 *
 * @author Maxence Laurent (maxence.laurent at gmail.com)
 */
@FacesComponent("com.wegas.app.pdf.uicomponent.Result")
public class UIResult extends UIComponentBase {

    public UIResult() {
        super();
    }

    UIResult(Result result, Player player, Boolean editorMode, Boolean defaultValues) {
        this();
        getAttributes().put("value", result);
        getAttributes().put("player", player);
        getAttributes().put("editorMode", editorMode);
        getAttributes().put("defaultValues", defaultValues);
    }

    @Override
    public String getFamily() {
        return "com.wegas.app.pdf.uicomponent.Result";
    }

    /**
     * Print Choice[*]Descriptor Result Please use encodeAll();
     *
     * @param context
     * @throws IOException
     */
    @Override
    public void encodeBegin(FacesContext context) throws IOException {
        super.encodeBegin(context);
        ResponseWriter writer = context.getResponseWriter();

        Result result = (Result) getAttributes().get("value");
        Player player = (Player) getAttributes().get("player");
        Boolean editorMode = (Boolean) getAttributes().get("editorMode");
        Boolean defaultValues = (Boolean) getAttributes().get("defaultValues");

        // SingleResultChoice's result never has a name
        if (editorMode && result.getChoiceDescriptor() instanceof SingleResultChoiceDescriptor == false) {
            UIHelper.printText(context, writer, result.getName(), UIHelper.CSS_CLASS_VARIABLE_SUBTITLE);
        }

        boolean hasBeenSelected = false;

        for (Reply r : result.getChoiceDescriptor().getQuestion().getInstance(defaultValues, player).getReplies()) {
            if (r.getResult().getChoiceDescriptor().equals(result.getChoiceDescriptor())) {
                hasBeenSelected = true;
            }
        }
        // For editors and players who selected this
        if (editorMode || hasBeenSelected) {
            UIHelper.printPropertyTextArea(context, writer, UIHelper.TEXT_IMPACT_TEXT, result.getAnswer(), false, editorMode);
        }

        if (editorMode) {
            // never show impacts to players!
            UIHelper.printPropertyImpactScript(context, writer, UIHelper.TEXT_IMPACT_SOURCECODE, result.getImpact());
        }
    }
}
