/**
* @author Benjamin Gerber <ger.benjamin@gmail.com>
*/

YUI.add('wegas-leaderway-folder', function (Y) {
    "use strict";

    var CONTENTBOX = 'contentBox', Folder;

    Folder = Y.Base.create("wegas-folder", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {

        tabview: null,
        tasksChooser: null, 
        tasksList: null,
        currentResourceDescriptor: null,
        handlers: new Array(),
        
        //*** Particular Methods ***/
        // .empty create an error, use sethtml() instead
        clearBeforeSync: function(cb){
            cb.one('.folder .name').setHTML();
            cb.one('.folder .surname').setHTML();
            cb.one('.folder .salary-value').setHTML();
            cb.one('.folder .picture').setHTML();
            cb.one('.folder .leadershipLevel-value').setHTML();
            cb.one('.folder .moral').setHTML();
            cb.one('.folder .confidence').setHTML();
            cb.one('.folder .occupation-value').setHTML();
            cb.one('.folder .skillsets-value').setHTML();
            cb.one('.folder .description-value').setHTML();
            cb.one('.archives .weekSelector').setHTML();
            cb.one('.archives .pastDialogues').setHTML();
        },
     
        makeResourcesSelector: function(cb, listResourcesDescriptor){
            if(cb.one('.listResources .resourceSelector') != null) return;
            var i, j, k, resourceSelector = new Array(), resourceInstance,
            resourceDescriptor, textOccupation;
            for(i=0; i<listResourcesDescriptor.get('items').length; i++){
                resourceSelector.length = 0;
                resourceDescriptor = listResourcesDescriptor.get('items')[i];
                resourceInstance = resourceDescriptor.getInstance();
                textOccupation = (this.getOccupation(resourceInstance).indexOf("Libre") == -1)? "Occupé" : "Libre";
                resourceSelector.push('<div class="resourceSelector">');
                resourceSelector.push('<div class="ID" style="display:none;"><p>');
                resourceSelector.push(resourceDescriptor.get('id'));
                resourceSelector.push('</p></div>');
                if(resourceInstance.properties.picture != null){
                    resourceSelector.push('<div class="picture">');
                    resourceSelector.push('<img src="'+resourceInstance.properties.picture+'" alt="picture" width="30" height="35" />');
                    resourceSelector.push('</div>');
                }
                resourceSelector.push('<div class="name"><p>');
                resourceSelector.push(resourceDescriptor.get('name'));
                resourceSelector.push('</p></div>');
                resourceSelector.push('<div class="occupation"><p>');
                resourceSelector.push(textOccupation);
                resourceSelector.push('</p></div>');
                resourceSelector.push('</div>');
                cb.one('.listResources').insert(resourceSelector.join(""));
            }
            this.handlers.push(cb.all('.listResources .resourceSelector').on('click', function (e) {
               var newResource = null, resourceID = parseInt(e.currentTarget._node.childNodes[0].innerText);
                for(i=0; i<listResourcesDescriptor.get('items').length; i++){
                    resourceDescriptor = listResourcesDescriptor.get('items')[i];
                    if(resourceDescriptor.id == resourceID) newResource = resourceDescriptor;
                }
                if(newResource == null) newResource = listResourcesDescriptor.get('items')[0];
                this.currentResourceDescriptor = newResource;
                this.syncUI();  
            },this));
        },
        
        syncResourcesSelector: function(cb, listResourcesDescriptor){
            var i, resourceDescriptor, resourceInstance, textOccupation;
            for(i=0; i<listResourcesDescriptor.get('items').length; i++){
                resourceDescriptor = listResourcesDescriptor.get('items')[i];
                resourceInstance = resourceDescriptor.getInstance();
                textOccupation = (this.getOccupation(resourceInstance).indexOf("Libre") == -1)? "Occupé" : "Libre";
                cb.all('.listResources .resourceSelector .ID').item(i).setHTML(resourceDescriptor.get('id'));
                if(cb.all('.listResources .resourceSelector .picture')!=null){
                    cb.all('.listResources .resourceSelector .picture').item(i).setHTML('<img src="'+resourceInstance.properties.picture+'" alt="picture" width="30" height="35" />');
                }
                cb.all('.listResources .resourceSelector .name').item(i).setHTML(resourceDescriptor.get('name'));
                cb.all('.listResources .resourceSelector .occupation').item(i).setHTML(textOccupation);
                if(resourceDescriptor.get('id') == this.currentResourceDescriptor.get('id')){
                    cb.all('.listResources .resourceSelector').item(i).addClass('selected');
                }
                else{
                    cb.all('.listResources .resourceSelector').item(i).removeClass('selected');   
                }
            }
        },
        
        syncFolderInformations: function(cb){
            var currentResourceInstance = this.currentResourceDescriptor.getInstance();
            cb.one('.folder .name').insert(this.currentResourceDescriptor.name);
            if(currentResourceInstance.properties.surname){
                cb.one('.folder .surname').insert(currentResourceInstance.properties.surname);   
            }
            if(currentResourceInstance.properties.salary){
                cb.one('.folder .salary-value').insert(currentResourceInstance.properties.salary);   
            }
            if(currentResourceInstance.properties.picture != null){
                cb.one('.folder .picture').insert('<img src="'+currentResourceInstance.properties.picture+'" alt="picture" width=120 height="140" />');
            }
            this.addLevelOfLeadershipInformations(cb, currentResourceInstance);
            cb.one('.folder .moral').insert(this.createGauge('Moral', parseInt(currentResourceInstance.moral)));
            cb.one('.folder .confidence').insert(this.createGauge('Confiance envers son leader', parseInt(currentResourceInstance.confidence)));
            cb.one('.folder .occupation-value').insert(this.getOccupation(currentResourceInstance));
            for (var key in currentResourceInstance.skillset){
                cb.one('.folder .skillsets-value').insert('<div class="skillset gauge">'+this.createGauge(key, parseInt(currentResourceInstance.skillset[key]))+'</div>');
            }
            cb.one('.folder .description-value').insert(this.currentResourceDescriptor.description);            
        },
        
        addLevelOfLeadershipInformations: function(cb, resourceInstance){
            var i, leadershipInfo = new Array(), leadershipLevel;
            if(resourceInstance.properties.leadershipLevel){
                leadershipLevel = parseInt(resourceInstance.properties.leadershipLevel);
                if(leadershipLevel >= 1 && leadershipLevel <=5){
                    leadershipInfo.push('<ul class="leadershipLevel-ul">');
                    leadershipInfo.push('<li class="leadershipLevel-label">Votre niveau de leadership avec ce membre est : </li>');
                    leadershipInfo.push('<li class="leadershipLevel-info">Niveau 5 : '+resourceInstance.properties.surname+" voit en vous un modèle à atteindre.</li>");
                    leadershipInfo.push('<li class="leadershipLevel-info">Niveau 4 : '+resourceInstance.properties.surname+" se rend compte de toute l'énergie que vous avez dépensé pour lui et veux donner l'envie aux autres de se battre pour l'entreprise. </li>");
                    leadershipInfo.push('<li class="leadershipLevel-info">Niveau 3 : '+resourceInstance.properties.surname+" sais ce que vous avez fait pour l'entreprise et travaillera à son tour pour la survie de l'entreprise. </li>");
                    leadershipInfo.push('<li class="leadershipLevel-info">Niveau 2 : '+resourceInstance.properties.surname+" suis vos directives car il vous considère et pense que vos choix sont justifiés.</li>");
                    leadershipInfo.push('<li class="leadershipLevel-info">Niveau 1 : '+resourceInstance.properties.surname+" suis vos directives uniquement parce qu'il en a le devoir.</li>");
                    leadershipInfo.push('</ul>');
                    cb.one('.leadershipLevel-value').insert(leadershipInfo.join(""));
                    
                    cb.all('.leadershipLevel-info').item(5-leadershipLevel).addClass('currentLevel');
                    for(i=0 ; i<=leadershipLevel-1 ; i++){
                        cb.all('.leadershipLevel-info').item(4-i).addClass('levelActive');
                    }
                }
                else{
                    cb.one('.leadershipLevel').insert('<div class="error">Leadership level must to be between 1 to 5)</div>')
                    }
            }
        },

        getOccupation: function(resourceInstance){
            var i, j, occupation = new Array(), sick=false,
            taskListDescriptor = Y.Wegas.app.dataSources.VariableDescriptor.rest.getCachedVariableBy("name", "tasks"),
            listAbsenceDescriptor = Y.Wegas.app.dataSources.VariableDescriptor.rest.getCachedVariableBy("name", "absences"),
            taskDescriptor, taskInstance, taskSkills = new Array();
            for (i = 0; i < listAbsenceDescriptor.items.length; i++) {
                taskDescriptor = listAbsenceDescriptor.items[i];
                taskInstance = taskDescriptor.getInstance();
                if(taskInstance.active){
                    for(j = 0; j < resourceInstance.assignments.length; j++){
                        if(taskDescriptor.id == resourceInstance.assignments[j].taskDescriptorId){
                            sick=true;
                            occupation.push('Arrêt maladie (revient dans ');
                            occupation.push(taskInstance.duration);
                            (taskInstance.duration > 1)?occupation.push(' semaines).') : occupation.push(' semaine).');
                            break;
                        }
                    }
                }
            }
            if(!sick){
                for (i = 0; i < taskListDescriptor.items.length; i++) {
                    for(j = 0; j < resourceInstance.assignments.length; j++){
                        taskDescriptor = taskListDescriptor.items[i];
                        if(taskDescriptor.id == resourceInstance.assignments[j].taskDescriptorId){
                            taskInstance = taskDescriptor.getInstance();
                            for(var key in taskInstance.skillset){
                                taskSkills.push('<li class="task-skill-value">'+key+' ('+taskInstance.skillset[key]+')</li>');
                            }
                            occupation.push('<div class="task">');
                            occupation.push('<div class="task-name"><span class= class"task-name-label">Mandat : </span><span= class"task-name-value">'+taskDescriptor.name+'</span></div>');
                            occupation.push('<ul class="task-skill"><span class="task-skill-label">Compétence demandée : </span>'+taskSkills.join("")+'</ul></div>');
                            occupation.push('<div class="task-salary"><span class="task-salary-label">Rémunération : </span><span class="task-salary-value">'+taskInstance.properties.salary+'</span></div>');
                            occupation.push('<div class="task-duration"><span class="task-duration-label">Durée de travail restant : </span><span class="task-duration-value">'+taskInstance.duration+'</span></div>');
                            occupation.push("</div>");
                            sick=false;
                            taskSkills.length = 0;
                        }
                    }
                }
            }
            if(occupation.length <= 0){
                occupation.push('Libre pour un mandat, travail habituel.');
            }
            return occupation.join("");
        },

        createGauge: function(label, nomberOfUnits){
            var gauge = new Array("");
            if(typeof nomberOfUnits === 'number'){
                if(nomberOfUnits>=0 && nomberOfUnits<=100){
                    gauge.push('<span class="gauge-label">');
                    gauge.push(label);
                    gauge.push(' <span class="gauge-value">(');
                    gauge.push(nomberOfUnits);
                    gauge.push('/100)</span><span class="gauge-units">');
                    for(var i=0; i<nomberOfUnits; i++){
                        gauge.push('<div class="gauge-unit"></div>');
                    }
                    gauge.push('</span></div>');
                }
                else{
                    gauge.push('<span class="error">The number for the gauge "'+label+'" must to be between 0 to 100.</span>');
                }
            }
            else{
                gauge.push('<span class="error">Unvalid number to create gauge : '+ label+"</span>");
            }
            return gauge.join("");
        },
        
    
        syncArchivesInformations: function(cb){
            cb.one('.archives .pastDialogues').insert("<p>Aucune archive de discussion n'est actuellement disponible.</p>");
        },
        
        bindActions: function(cb){
            this.handlers.push(cb.one('.actions .giveTask').on('click', function (e) {
                if(this.tasksChooser != null) this.tasksChooser.show();
            }, this));
        },
        
        syncAction: function(cb){
            var i, resInstance, showActiongGiveTask = true, resourceInstance;
            resInstance = this.currentResourceDescriptor.getInstance();
            if(this.currentResourceDescriptor != null){
                resourceInstance = this.currentResourceDescriptor.getInstance();
                for(i=0 ;i<resInstance.assignments.length; i++){
                    if(this.getOccupation(resourceInstance).indexOf("Libre") == -1){
                        showActiongGiveTask = false;   
                    }
                }
            }
            if(showActiongGiveTask){
                cb.one('.actions .giveTask').show();
            }
            else{
                cb.one('.actions .giveTask').hide();
            }
        },
        
        setTextSelectedTask: function(taskDescriptor){
            var i, listResourcesDescriptor = Y.Wegas.app.dataSources.VariableDescriptor.rest.getCachedVariableBy("name", "tasks"),
            selectedRowInformation = this.tasksChooser.get(CONTENTBOX).one('.yui3-widget-ft .selectedTask');
            selectedRowInformation.setHTML();
            selectedRowInformation.insert("Mandat sélectionné : "+taskDescriptor.name);
        },
        
        assignTask: function(resourceDescriptor, taskDescriptor){
            var feedbackNode = this.get(CONTENTBOX).one('.actions .feedback');
            if(taskDescriptor != null && resourceDescriptor != null){
                Y.Wegas.app.dataSources.VariableDescriptor.rest.sendRequest({
                    request: "/Script/Run/Player/" + Y.Wegas.app.get('currentPlayer'),
                    cfg: {
                        method: "POST",
                        data: Y.JSON.stringify({
                            "@class": "Script",
                            "language": "JavaScript",
                            "content": "importPackage(com.wegas.core.script);\nassignTask("+resourceDescriptor.id+","+taskDescriptor.id+");"
                        })
                    }
                });
                feedbackNode.addClass('green');
                feedbackNode.insert("Le mandat à été délégué !");
            }
            else{
                feedbackNode.addClass('red');
                feedbackNode.insert("Le mandat n'a pas pu être délégué.");
            }
                this.syncUI();
                setTimeout(function(){
                    feedbackNode.setHTML();
                    feedbackNode.removeClass('green');
                    feedbackNode.removeClass('red');
                }, 5000);
        },

        // *** Lifecycle Methods *** //
        renderUI: function(){
            var cb = this.get(CONTENTBOX);
            this.tabview = new Y.TabView({
                children: [{
                    label: 'Dossier',
                    content: '<div class="folder">\n\
                    <div class="basic_informations section">\n\
                    <div class="picture"></div>\n\
                        <div class="name_surname"><span class="name"></span><span class="surname"></span></div>\n\
                        <div class="salary"><span class="salary-label">Salaire hebdomadaire : </span><span class="salary-value"></span></div>\n\
                    </div>\n\
                    <div class="occupation section"><div class="title-section">Occupation actuelle : </div><div class="occupation-value"></div></div>\n\
                    <div class="leadershipLevel section"><div class="title-section">Niveau de leadership : </div><div class="leadershipLevel-value"></div></div>\n\
                    <div class="conditions section"><div class="title-section">Conditions : </div>\n\
                        <div class="moral gauge"></div>\n\
                        <div class="confidence gauge"></div>\n\
                    </div>\n\
                    <div class="skillsets section"><div class="title-section">Compétences : </div><div class="skillsets-value"></div></div>\n\
                    <div class="description section"><div class="title-section">Description : </div><div class="description-value"></div></div>\n\
                </div>'
                }, {
                    label: 'Archives',
                    content: '<div class="archives">\n\
                        <div class="weekSelector"></div>\n\
                        <div class="pastDialogues"></div>\n\
                    </div>'
                },
                {
                    label: 'Actions',
                    content: '\n\
                    <div class="actions">\n\
                        <div class="feedback"></div>\n\
                        <div class="actions-list">\n\
                            <div class="speak action">S\'entretenir</div>\n\
                            <div class="giveTask action">Donner un mandat</div>\n\
                        </div>\n\
                    </div>'
                }]
            });
                this.tasksChooser = new Y.Panel({
                    contentBox : Y.Node.create('<div class="tasksChooser"></div>'),
                    bodyContent: '<div class="tasksChooser-tasklist"></div>',
                    width      : 950,
                    zIndex    : 100,
                    centered   : true,
                    modal      : true,
                    render     : cb,
                    visible    : false,
                    buttons    : {
                        footer: [
                            {
                                name  : 'cancel',
                                label : 'Annuler',
                                action: 'onCancel'
                            },
                            {
                                name     : 'proceed',
                                label    : 'Assigner le mandat',
                                action   : 'onOK'
                            }
                        ]
                    }
            });
            this.tasksChooser.get(CONTENTBOX).one('.yui3-widget-ft span').insert('<div class="selectedTask"></div>', 'before')
            this.tasksList = new Y.Wegas.TaskList({pickingMode:true});
            cb.insert('<div class="menuFolder"><div class="listResources"></div></div>');
            this.tabview.render(cb);
        },

        bindUI: function(){
            var cb = this.get(CONTENTBOX);
            this.handlers.push(Y.Wegas.app.dataSources.VariableDescriptor.after("response", this.syncUI, this));
            this.handlers.push(Y.Wegas.app.after('currentPlayerChange', this.syncUI, this));
            this.handlers.push(this.tabview.after('rendered', this.bindActions(cb), this));
            this.handlers.push(this.tasksList.after('rowSelected', this.setTextSelectedTask, this));
            this.tasksChooser.onOK = Y.bind(function(e){
                var taskDescriptor;
                taskDescriptor = this.tasksList.getSelectedTaskDescriptor();
                this.tasksChooser.hide();
                this.assignTask(this.currentResourceDescriptor, taskDescriptor);
            }, this);
            this.tasksChooser.onCancel = function(e){
                this.hide();
            }
        },
          
        syncUI: function() {
            var cb = this.get(CONTENTBOX),
            listResourcesDescriptor = Y.Wegas.app.dataSources.VariableDescriptor.rest.getCachedVariableBy("name", "resources");
            if(listResourcesDescriptor == null) return;
            if(!this.tasksList.rendered) this.tasksList.render(".tasksChooser-tasklist");
            if(this.currentResourceDescriptor == null) this.currentResourceDescriptor = listResourcesDescriptor.items[0];
            this.clearBeforeSync(cb);
            this.makeResourcesSelector(cb, listResourcesDescriptor);
            this.syncResourcesSelector(cb, listResourcesDescriptor);
            this.syncFolderInformations(cb);
            this.syncArchivesInformations(cb);
            this.syncAction(cb)
        },
        
        destroy: function(){
            var i;
            this.tabview.destroy();
            this.tasksChooser.destroy();
            this.tasksList.destroy();
            for (i=0; i<this.handlers.length;i++) {
                this.handlers[i].detach();
            }
        }
    }, {
        ATTRS : {
            content: { }
        }
    });

    Y.namespace('Wegas').Folder = Folder;
});
