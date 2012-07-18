/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-variabledisplay', function (Y) {
    "use strict";

    var CONTENTBOX = 'contentBox', VariableDisplay;

    VariableDisplay = Y.Base.create("wegas-variabledisplay", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {

        // ** Lifecycle Methods ** //

        initializer: function (cfg) {
            this.set('dataSource', Y.Wegas.app.dataSources[this.get('dataSource')]);
        },

        bindUI: function () {
            Y.Wegas.VariableDescriptorFacade.after("response", this.syncUI, this);
            Y.Wegas.app.after('currentPlayerChange', this.syncUI, this);
        },

        syncUI: function () {
            var acc, angle_pourcent, maxVal, minVal, ctx, i, value_x, value_y, angle_value, value,
                variableDescriptor = this.get("dataSource").rest.find('name', this.get("variable"));

                if (!variableDescriptor) {return;}
                value = variableDescriptor.getInstance().get("value") || "undefined";

            switch (this.get('view')) {
            case 'text':
                this.get(CONTENTBOX).setContent('<span class="wegas-variabledisplay-text-label">'+this.get('label')+'</span>'
                    +'<span class="wegas-variabledisplay-text-value">'+ value+'</span>');
                break;
            case 'box':
                acc = [];
                for (i = 0; i < value; i += 1) {
                    acc.push('<div class="wegas-variabledisplay-box-unit"></div>');
                }
                if (variableDescriptor) {
                    this.get(CONTENTBOX).setContent('<span class="wegas-variabledisplay-box-label">'+this.get('label')+'</span>'
                        +'<span class="wegas-variabledisplay-box-value">(' + value + '<span class="wegas-variabledisplay-box-valueMax">/'+variableDescriptor.get("maxValue")+'</span>)</span>'
                        +'<span class="wegas-variabledisplay-box-units">'+acc.join('')+'</span>');
                }
                else{
                    this.get(CONTENTBOX).setContent('<span class="wegas-variabledisplay-box-label">'+this.get('label')+'</span>'
                        +'<span class="wegas-variabledisplay-box-value">(' + value + ')</span>'
                        +'<span class="wegas-variabledisplay-box-units">'+acc.join('')+'</span>');
                }
                break;
            case 'fraction':
                if(variableDescriptor){
                    maxVal = variableDescriptor.get("maxValue");
                    minVal = variableDescriptor.get("minValue");
                }
                this.get(CONTENTBOX).setContent('<span class="wegas-variabledisplay-fraction-label">'+this.get('label')+'</span>'
                    +'<span class="wegas-variabledisplay-fraction-minValue">'+ minVal +'</span>'
                    +'<span class="wegas-variabledisplay-fraction-minSeparator"> / </span>'
                    +'<span class="wegas-variabledisplay-fraction-value">'+ value +'</span>'
                    +'<span class="wegas-variabledisplay-fraction-maxSeparator"> / </span>'
                    +'<span class="wegas-variabledisplay-fraction-maxValue">'+ maxVal +'</span>');
                break;
            case 'valuebox':
                acc = [];
                if (variableDescriptor) {
                    for (i = variableDescriptor.get("minValue"); i <= variableDescriptor.get("maxValue"); i += 1) {
                        acc.push('<div class="wegas-valuebox-unit '
                            + ((i === value) ? "wegas-valuebox-selected" : "")
                            + '">' + i + '</div>');
                    }
                }
                this.get(CONTENTBOX).setContent('<span class="wegas-variabledisplay-valuebox-label">'+this.get('label')+'</span>'
                    + '<div class="wegas-variabledisplay-valuebox-units">' + acc.join('')+"</div");
                break;

            case 'gauge':
                maxVal = 145;
                minVal = 55;

                this.get(CONTENTBOX).setContent('<canvas width="90" height="51"></canvas><br />'
                    + '<div class="wegas-variabledisplay-gauge-text">' + value + '%</div>'
                    + '<center>' + this.get('label') + "</center>");

                ctx = this.get(CONTENTBOX).one('canvas')._node.getContext('2d');

                //G_vmlCanvasManager.initElement(canvas);
                //var ctx = canvas.getContext('2d');

                // LE TOUR DE LA GAUGE
                ctx.beginPath();
                ctx.arc(50, 41, 40, Math.PI, 0, false);
                ctx.arc(80, 41, 10, 0, Math.PI / 2, false);
                ctx.arc(20, 41, 10, Math.PI / 2, Math.PI, false);
                //if (active){
                ctx.fillStyle = "rgb(240, 240, 240)";
                //} else {
                // ctx.fillStyle = "rgba(240, 240, 240, 1)";
                //}
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // LA PARTIE ROUGE
                ctx.beginPath();
                ctx.arc(50, 41, 40, Math.PI, Math.PI * 4 / 3, false);
                ctx.arc(50, 41, 30, Math.PI * 4 / 3, Math.PI, true);
                //if (active){
                ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
                //} else{
                //    ctx.fillStyle = "rgba(100, 100, 100, 0.6)";
                //}
                ctx.fill();
                ctx.closePath();

                // LA PARTIE ORANGE
                ctx.beginPath();
                ctx.arc(50, 41, 40, Math.PI * 4 / 3, Math.PI * 5 / 3, false);
                ctx.arc(50, 41, 30, Math.PI * 5 / 3,  Math.PI * 4 / 3, true);
                // if (active) {
                ctx.fillStyle = "rgba(255, 204, 0, 0.6)";
                //} else{
                //    ctx.fillStyle = "rgba(180, 180, 180, 0.6)";
                //}
                ctx.fill();
                ctx.closePath();

                // LA PARTIE VERTE
                ctx.beginPath();
                ctx.arc(50, 41, 40,  Math.PI * 5 / 3,  Math.PI * 2, false);
                ctx.arc(50, 41, 30, Math.PI * 2, Math.PI * 5 / 3, true);
                //if (active){
                ctx.fillStyle = "rgba(97, 186, 9, 0.6)";
                //} else {
                //    ctx.fillStyle = "rgba(140, 140, 140, 0.6)";
                //}
                ctx.fill();
                ctx.closePath();

                // LE CENTRE DE L'AIGUILLE
                ctx.beginPath();
                ctx.arc(50, 41, 5, 0, Math.PI * 2, false);
                //if (active){
                ctx.fillStyle = "rgb(0, 0, 0)";
                //} else{
                //    ctx.fillStyle = "rgb(32, 32, 32)";
                //}
                ctx.fill();
                ctx.closePath();


                // Logique pour aiguille
                angle_pourcent = 180 / (maxVal - minVal);
                if (value > maxVal) {
                    value = maxVal;
                    angle_value = 180;
                } else if (value < minVal) {
                    value = minVal;
                    angle_value = 0;
                } else {
                    angle_value = (value - minVal) * angle_pourcent;
                }

                if (angle_value > 90) {
                    value_x = 50 + (40 * Math.cos((Math.PI / 180) * (180 - angle_value)));
                    value_y = 41 - (40 * Math.sin((Math.PI / 180) * (180 - angle_value)));
                } else if (angle_value < 90) {
                    value_x = 50 - (40 * Math.cos((Math.PI / 180) * angle_value));
                    value_y = 41 - (40 * Math.sin((Math.PI / 180) * angle_value));
                } else {
                    value_x = 50;
                    value_y = 1;
                }

                // L'AIGUILLE
                ctx.beginPath();
                ctx.moveTo(50, 41);
                ctx.lineTo(value_x, value_y);
                ctx.stroke();
                ctx.closePath();
                break;
            }
        }
    }, {
        ATTRS : {
            variable: {},
            dataSource: {},
            label : {
                validator: Y.Lang.isString
            },
            view: {
                value: "text"
            }
        }
    });

    Y.namespace('Wegas').VariableDisplay = VariableDisplay;
});
