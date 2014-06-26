/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Benjamin Gerber <ger.benjamin@gmail.com>
 * @author Yannick Lagger <lagger.yannick@gmail.com>
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
//Global variables
var gm = self.getGameModel(),
    testMode = true,
    STEPS = 10,
    minTaskDuration = 0.1,
    taskTable = {},
    STEPNAMES = ['Lundi matin', 'Lundi apr�s-midi', 'Mardi matin', 'Mardi apr�s-midi', 'Mercredi matin',
        'Mercredi apr�s-midi', 'Jeudi matin', 'Jeudi apr�s-midi', 'Vendredi matin', 'Vendredi apr�s-midi', 'Samedi matin'];

/**
 * Divide period in steps (see global variable).
 * Call function step at each step.
 */
function runSimulation() {
    debug('runSimulation()');

    taskTable = {};
    for (var i = 0; i < STEPS; i++) {
        step(i);
    }
}

/**
 * Call fonction to creat activities (createActivities) then get each
 *  activities (but only one per task's requirement). for each activities,
 *   Call the function to calculate the progression of each requirement
 *   (calculateProgress).
 *   Then, calculate and set the quality and the completeness for each tasks
 *   Then, check the end of a requirement inactivities (function ''checkEnd'');
 * @param {Number} currentStep
 */
function step(currentStep) {
    debug('step(' + currentStep + ")");

    var i, work, oneTaskPerActivity,
        taskProgress,
        requirementsByWork, taskInst,
        allCurrentActivities = createActivities(currentStep), //                // create activities
        activities = getActivitiesWithEmployeeOnDifferentNeeds(allCurrentActivities);//get one unique requirement by activities and calculate its progression

    debug("step(): #allCurrentActivities:" + allCurrentActivities.length + ", #activities: " + activities.length);
    for (i = 0; i < activities.length; i++) {                                   //for each need
        calculateProgress(activities[i], allCurrentActivities, currentStep);
    }

    //get each modified task and calculate is new quality and completeness
    oneTaskPerActivity = getUniqueTasksInActivities(activities);
    for (i = 0; i < oneTaskPerActivity.length; i++) {
        taskProgress = 0;
        taskInst = oneTaskPerActivity[i].taskDescriptor.getInstance(self);
        requirementsByWork = getRequirementsByWork(taskInst.requirements);
        for (work in requirementsByWork) {
            taskProgress += requirementsByWork[work].completeness;
        }
        taskProgress = (taskProgress > 97) ? 100 : taskProgress;                //>97 yes, don t frustrate the players please.
        taskInst.setProperty('completeness', Math.round(taskProgress));
        taskInst.setProperty('quality', calculateTaskQuality(oneTaskPerActivity[i].taskDescriptor));
    }
    checkEnd(allCurrentActivities, currentStep);
}

/**
 * calculate how many percent is completed based on current period and planified
 *  length of the task.
 * @param {TaskInstance} taskInst
 * @returns {Number} number between 0 and 100 (both including)
 */
function getPlannifiedCompleteness(taskInst) {
    var i, planif = taskInst.getPlannification(), planifArray = [],
        pastPeriods = 0;
    for (i = 0; i < planif.size(); i++) { //transform list to array to use function ''indexOf''
        planifArray.push(parseInt(planif.get(i)));
    }
    for (i = 0; i <= getCurrentPeriod().getValue(self); i++) {
        if (planifArray.indexOf(i) > -1) {
            pastPeriods += 1;
        }
    }
    return (planifArray.length > 0) ? (pastPeriods / planifArray.length) * 100 : 0;
}

/**
 * return the delay based on the difference (in percent) between
 *  plannifiedcompleteness and real completeness (completeness / planifiedCompleteness * 100)
 * if given task isn't started then delay = completeness + 100
 * planified completeness is based on function ''getPlannifiedCompleteness''
 * @param {taskDescriptor} taskDesc
 * @returns {Number} delay between 0 and 100
 */
function getCurrentTaskDelay(taskDesc) {
    var planif, delay = 0, planif = taskDesc.getInstance(self).getPlannification(),
        completeness = parseInt(taskDesc.getInstance(self).getProperty('completeness')),
        planifiedCompleteness = getPlannifiedCompleteness(taskDesc.getInstance(self));
    if (completeness > 0 && planif.length > 0) {
        if (planifiedCompleteness <= 0) {
            delay = completeness + 100;
        }
        else {
            delay = completeness / planifiedCompleteness * 100;
        }
    }
    return delay;
}

/**
 * Sort an Array of activities to keep only one occurence of task Descriptor
 * in each activities. So in the returned list, two activities can't have the same task.
 * @param {Array} activities  an Array of Activity
 * @returns {Array of activities}
 */
function getUniqueTasksInActivities(activities) {
    var i, j, oneTaskPerActivity = [], wasAdded;
    if (activities.length > 0) {
        oneTaskPerActivity.push(activities[0]);
    }
    for (i = 0; i < activities.length; i++) {
        wasAdded = false;
        for (j = 0; j < oneTaskPerActivity.length; j++) {
            if (oneTaskPerActivity[j].taskDescriptor === activities[i].taskDescriptor) {
                wasAdded = true;
                break;
            }
        }
        if (!wasAdded) {
            oneTaskPerActivity.push(activities[i]);
        }
    }
    return oneTaskPerActivity;
}

/**
 * Sort an Array of activities to keep only one occurence of requirement
 * in each activities. So in the returned list, two activities can't have the same requirement.
 * @param {Array} activities  an Array of Activity
 * @returns {Array} an Array of Activity
 */
function getActivitiesWithEmployeeOnDifferentNeeds(activities) {
    var i, j, activitiesAsNeeds = [], wasAdded;
    if (activities.length > 0) {
        activitiesAsNeeds.push(activities[0]);
    }
    for (i = 1; i < activities.length; i++) { //for each need
        wasAdded = false;
        if (getActivitiesWithEmployeeOnSameNeed(activities, activities[i]).length > 1) {
            for (j = 1; j < activitiesAsNeeds.length; j++) {
                if (activities[i] === activitiesAsNeeds[j]) {
                    wasAdded = true;
                    break;
                }
            }
        }
        if (!wasAdded) {
            activitiesAsNeeds.push(activities[i]);
        }
    }
    return activitiesAsNeeds;
}

/**
 * Sort the given array to keep only activities with employee on the same requirement
 * @param {Array} activities an Array of Activity
 * @param {Activity} activity
 * @returns {Array} an Array of Activity
 */
function getActivitiesWithEmployeeOnSameNeed(activities, activity) {
    return activities.filter(function(a) {
        return activity.time === a.time
            && activity.taskDescriptor === a.taskDescriptor
            && activity.requirement === a.requirement;
    });
}

/**
 * Create activities for each reserved (having an occupation at this time) employees having a valid assignement.
 * if a corresponding activity exist in the past, get it, else create activity
 *  and adjust its value.
 * @param {Number} currentStep
 * @returns {Array} an Array of Activity
 */
function createActivities(currentStep) {
    var i, employee, activity, assignables, existingActivity,
        activities = [],
        employees = flattenList(Variable.findByName(gm, 'employees')),
        currentPeriod = getCurrentPeriod().getValue(self) + currentStep / 10;
    if (!employees) {
        return [];
    }
    for (i = 0; i < employees.length; i++) {
        employee = employees[i].getInstance(self);
        if (isReservedToWork(employee)) {                                       //have a 'player created' occupation
            assignables = checkAssignments(employee, currentStep);
            if (assignables.length > 0) {                                       //have assignable tasks
                existingActivity = findLastStepCorrespondingActivity(employee, assignables[0].taskDescriptor, currentPeriod);
                if (existingActivity) {                                         //set corresponding past activity if it existe. Else create it.
                    activity = existingActivity;
                } else {
                    activity = employee.createActivity(assignables[0].taskDescriptor);
                }
                if (selectRequirementFromActivity(activity) === null) {         // Possible d'am�liorer la performance en ne cr�ant pas d'activity. Mais n�cessite de cr�er une nouvelle fonction comme "selectRequirementFromActivity" en ne passant pas par une activity.
                    employee.removeActivity(activity);
                } else {
                    activity.setRequirement(selectRequirementFromActivity(activity));
                    activity.setTime(currentPeriod);
                    activities.push(activity);
                }
            }
        }
        removeAssignmentsFromCompleteTasks(employee);
    }
    return activities;
}

/**
 * When the task is complete remove all assignment from this task.
 * @param {ResourceInstance} employeeInst
 */
function removeAssignmentsFromCompleteTasks(employeeInst) {
    var assignment, i, task;

    for (i = 0; i < employeeInst.assignments.size(); i++) {
        assignment = employeeInst.assignments.get(i);
        task = assignment.taskDescriptor.getInstance(self);
        if (task.getPropertyD('completeness') >= 100) {
            task.assignments.remove(i);
        }
    }
}

/**
 * Check and return the most adapted requirement in the task of the activity,
 *  for the employee in the activity. Use function (''selectRequirement'') to
 *   choose the requirement.
 * @param {Activity} activity
 * @returns {WRequirement} the selected (most adapted) requierement
 */
function selectRequirementFromActivity(activity) {
    var selectedReq, workAs, taskInst, reqByWorks, metier;
    taskInst = activity.taskDescriptor.getInstance(self);
    metier = activity.resourceInstance.skillsets.keySet().toArray()[0].toString();
    reqByWorks = getRequirementsByWork(taskInst.requirements);
    workAs = selectFirstUncompletedWork(taskInst.requirements, reqByWorks, metier);
    selectedReq = selectRequirement(taskInst, activity.resourceInstance, workAs, reqByWorks);
    return selectedReq;
}

/**
 * Research and return an activity having the same task, the same employee and
 *  worked on at the last step.
 * @param {ResourceInstance} employeeInst
 * @param {TaskDescriptor} taskDesc
 * @param {Number} currentPeriod
 * @returns {Activity} activity
 */
function findLastStepCorrespondingActivity(employeeInst, taskDesc, period) {
    var i, activity, occurence = null;
    for (i = 0; i < employeeInst.activities.size(); i++) {
        activity = employeeInst.activities.get(i);
        if (activity.taskDescriptor === taskDesc                                // if the task of activity match with the given task (same task and same employee == same activity)
            && period - Math.floor(period) !== 0                            // if it s not a new period (current step !== 0)
            && parseFloat(activity.time) === getFloat(period - 0.1)) { //if activity was used the last step
            occurence = activity;
            break;
        }
    }
    return occurence;
}

/**
 * Research and return an activity having the same task, the same employee and
 *  worked on in previous period or step.
 * @param {ResourceInstance} employeeInst
 * @param {TaskDescriptor} taskDesc
 * @param {Number} currentPeriod
 * @returns {Activity} activity
 */
function haveCorrespondingActivityInPast(employeeInst, taskDesc, currentPeriod) {
    var i, activity, occurence = false;
    for (i = 0; i < employeeInst.activities.size(); i++) {
        activity = employeeInst.activities.get(i);
        if (activity.taskDescriptor === taskDesc   //if the task of activity match with the given task (same task and same employee == same activity)
            && currentPeriod > parseFloat(activity.time)) {
            occurence = true;
            break;
        }
    }
    return occurence;
}

/**
 * Check if the given resource have an occupation where time correspond to the current time.
 * If its true, the employee is reserved (and the function return true)
 * @param {RessourceInstance} employeeInst
 * @returns {Boolean} is reserved
 */
function isReservedToWork(employeeInst) {
    var i, occupations = employeeInst.getOccupations(),
        currentPeriod = getCurrentPeriod().getValue(self);
    for (i = 0; i < occupations.size(); i++) {
        if (parseInt(occupations.get(i).time) === currentPeriod) {
            return occupations.get(i).editable;                                 // Illness, etc. occupations are not editable
        }
    }
    return false;
}

/**
 *  Return the given list but without the invalid Assignments.
 *  An valid assignment is one where its bound task completion is < 100 and
 *  where a employee can progress decently without problem of predecessor
 *   ( see function ''getPredecessorFactor'');
 * @param {Array} assignments an Array of Assignment
 * @returns {Array} an Array of Assignment
 */
function getAssignables(assignments, currentStep) {
    var i, ii, taskDesc, assignables = [], work, exist;
    for (i = 0; i < assignments.size(); i++) {
        work = null;
        exist = false;
        taskDesc = assignments.get(i).taskDescriptor;
        if (parseInt(taskDesc.getInstance(self).getProperty('completeness')) < 100 && getPredecessorFactor(taskDesc) >= 0.2) { //if the task isn t terminated and average of predecessors advancement is upper than 20%
            for (ii = 0; ii < taskDesc.getInstance(self).requirements.size(); ii++) {
                if (assignments.get(i).resourceInstance.skillsets.keySet().toArray()[0].toString() == taskDesc.getInstance(self).requirements.get(ii).work.toString()) {
                    exist = true;
                    assignables.push(assignments.get(i));
                    break;
                }
            }
            if (!exist) {
                sendMessage('(' + getStepName(currentStep) + ') Impossible de progresser sur la t�che : ' + taskDesc.label,
                    'Je suis cens� travailler sur la t�che "' + taskDesc.label + '" mais je ne suis pas qualifi� pour ce travail. <br/> Salutations <br/>' + assignments.get(i).resourceInstance.descriptor.label + '<br/> ' + assignments.get(i).resourceInstance.skillsets.keySet().toArray()[0],
                    assignments.get(i).resourceInstance.descriptor.label);
                assignments.remove(i);
                //TODO add unworked hours
            }

        }
    }
    return assignables;
}

/**
 * For each activity, send different message if a task is completed or if the
 *  employee can't work on a task because a predecessor is not enough advanced.
 *  Return the next avalaible assignements.
 * @param {Array} assignments An Array of Assignment
 * @param {Number} currentStep
 * @returns {Array} An Array of Assignment
 */
function checkAssignments(employeeInst, currentStep) {
    if (employeeInst.assignments.isEmpty()) {
        return [];
    }
    var i, taskDesc, taskInst, exist,
        assignments = employeeInst.assignments,
        employeeName = employeeInst.descriptor.label,
        employeeJob = employeeInst.skillsets.keySet().toArray()[0],
        nextTasks = getAssignables(assignments, currentStep);

    for (i = 0; i < assignments.size(); i++) {
        exist = false;
        taskDesc = assignments.get(i).taskDescriptor;
        taskInst = taskDesc.getInstance();
        if (parseFloat(taskInst.getProperty('completeness')) >= 100) {
            if (nextTasks[0]) {
                sendMessage('(' + getStepName(currentStep) + ') Fin de la t�che : ' + taskDesc.label,
                    'La t�che "' + taskDesc.label + '" est termin�e, je passe � la t�che ' + nextTasks[0].taskDescriptor.label + ' <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                    employeeName);
            } else {
                sendMessage('(' + getStepName(currentStep) + ') Fin de la t�che : ' + taskDesc.label,
                    'La t�che "' + taskDesc.label + '" est termin�e. Je retourne � mes activit�s traditionnelles. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                    employeeName);
            }
            assignments.remove(i);
            break;
        } else if (i === 0 && getPredecessorFactor(taskDesc) <= 0.2) {
            sendMessage('(' + getStepName(currentStep) + ') Impossible de progresser sur la t�che : ' + taskDesc.label,
                'Je suis sens� travailler sur la t�che "' + taskDesc.label + '" mais les t�ches pr�cedentes ne sont pas assez avanc�es. <br/> Je retourne donc � mes occupations habituel. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                employeeName);
            assignments.remove(i);
            //TODO add unworked hours
            break;
        }
    }
    return nextTasks;
}

/**
 * Get a number which determinate if a task can be already worked or if
 * its predecessors is not enough advanced.
 * @param {TaskDescriptor} taskDesc
 * @returns {Number} number between 0 and 1.
 */
function getPredecessorFactor(taskDesc) {
    var i, predecessorsAdvancements, predecessors, average, numberOfPredecessors;
    predecessorsAdvancements = 0;
    numberOfPredecessors = 0;
    predecessors = taskDesc.getPredecessors();
    for (i = 0; i < predecessors.size(); i++) {
        if (isTrue(predecessors.get(i).getInstance(self).active)) {
            predecessorsAdvancements += predecessors.get(i).getInstance(self).getPropertyD('completeness');
            numberOfPredecessors += 1;
        }
    }
    if (numberOfPredecessors > 0) {
        average = predecessorsAdvancements / numberOfPredecessors;
    } else {
        average = 100;
    }
    return Math.pow(average / 100, parseInt(taskDesc.getInstance(self).getProperty('predecessorsDependances')));
}

/**
 * Return th first uncomplete kind of work in the given list requirements.
 * An uncomplete requirement is one where its completeness is smaller than its maxLimit.
 * @param {List} requirements List of WRequirements
 * @param {Object} reqByWorks object returned by function ''getRequirementsByWork'', can be null
 * @returns {String} work
 */
function selectFirstUncompletedWork(requirements, reqByWorks, metier) {
    var work, firstUncompletedWork;
    if (!reqByWorks) {
        reqByWorks = getRequirementsByWork(requirements); // get requirements merged by kind of work.
    }
    for (work in reqByWorks) {
        if (reqByWorks[work].completeness < reqByWorks[work].maxLimit && metier == work) { //check if the maximum limite from all requirements of the current kind of work is smaller than the completeness of the current kind of work
            firstUncompletedWork = work;
            break;
        }
    }
    return firstUncompletedWork;
}

/**
 * Select the most appropriate requirement for a employee.
 * the requirement must be the same type of work than the given parameter
 *  'work as' and must be match with this condition : req.completeness < max limit of req in this kind of job * employee on this task / total of employee of req in this kind of job
 * If several requirement match, select the one which have least difference between its level and the level of the given employee
 * * @param {TaskInstance} taskInst
 * @param {EmployeeInstance} employeeInst
 * @param {String} workAs string which define current work type of the given employee (can be different than his job)
 * @param {Object} reqByWorks object returned by function ''getRequirementsByWork''
 * @returns {WRequirement} the selected requirement
 */
function selectRequirement(taskInst, employeeInst, workAs, reqByWorks) {
    var i, req, requirements = taskInst.requirements, selectedReq = null,
        totalOfPersonneInTask = 0, deltaLevel = 1000,
        level = parseInt(employeeInst.skillsets.get(employeeInst.skillsets.keySet().toArray()[0]));
    for (i = 0; i < requirements.size(); i++) {
        totalOfPersonneInTask += parseInt(requirements.get(i).quantity);
    }
    for (i = 0; i < requirements.size(); i++) {
        req = requirements.get(i);
        if (req.work == workAs && parseFloat(req.completeness) < (reqByWorks[workAs].maxLimit * totalOfPersonneInTask / reqByWorks[workAs].totalOfEmployees)) {
            if (Math.abs(deltaLevel) > level - parseInt(req.level)) {
                deltaLevel = level - parseInt(req.level);
                selectedReq = req;
            }
        }
    }
    return selectedReq;
}

/**
 * Return an object which requirements are gathered by work.
 * this object contains (by work) :
 * - maxLimit, the bigger limit found on this requirement job
 * - typesOfLevels, an Array of all found levels on this requirement job
 * - totalOfEmployees, the sum of all employees required on this requirement job.
 * - completeness the sum of each (completeness * quantity of required employees) divided by the total of employee on this requirement job.
 * @param {WRequirement} requirements
 * @returns {Object} works
 */
function getRequirementsByWork(requirements) {
    var i, req, works = {}, work, needsCompletion = 0, totalOfEmployees = 0;
    for (i = 0; i < requirements.size(); i++) {
        req = requirements.get(i);
        //keep an occurance of each kind of work needed
        if (works[req.work]) {
            work = works[req.work];
            work.totalByWork += req.quantity;
        } else {
            work = works[req.work] = {
                maxLimit: 0,
                typesOfLevels: [],
                totalOfEmployees: 0,
                completeness: 0,
                totalByWork: req.quantity,
                dimFactorAdvancement: false
            };
        }
        //keep the highest limit of all limits from each kind of work needed
        if (work.maxLimit < parseInt(req.limit)) {
            work.maxLimit = parseInt(req.limit);
        }
        //keep all kind of levels for each kind of work needed
        if (work.typesOfLevels.indexOf(req.level) <= -1) {
            work.typesOfLevels.push(req.level);
        }
        //keep the summe of personns needed for each kind of work needed
        totalOfEmployees += parseInt(req.quantity);
        //is needed for next calcul
        needsCompletion += (parseFloat(req.completeness) * parseInt(req.quantity));
        work.completeness += parseFloat(req.completeness);
    }
    for (work in works) {
        //keep the summe of personns needed for each kind of work needed
        works[work].totalOfEmployees = totalOfEmployees;

        if (works[work].completeness > (works[work].totalByWork / totalOfEmployees) * 100) {
            works[work].dimFactorAdvancement = true;
        }
    }
    return works;
}

/**
 * Calculate the progression and the quality of each worked requirement at this step.
 * Return the progression of the requirement.
 * @param {Activity} activity an Activity
 * @param {Array} allActivities an Array of Activity
 * @returns {Number} a number between 0 and 100
 */
function calculateProgress(activity, allActivities, currentStep) {
    debug("calculateProgress(activity: " + activity + ", currentStep: " + currentStep + ")");

    var i, employeeDesc, employeeInst, activityRate, averageSkillsetQuality,
        correctedRessources,
        affectedEmployeesDesc = [], stepAdvance = 1, sumActivityRate = 0,
        employeesMotivationXActivityRate = 0,
        employeesMotivationFactor, employeesSkillsetXActivityRate = 0,
        employeeSkillsetFactor, activityCoefficientXActivityRate = 0,
        numberOfEmployeeOnNeedOnNewTask = 0, otherWorkFactor = 1,
        needProgress, motivationXActivityRate = 0, skillsetXActivityRate = 0,
        stepQuality = 0,
        taskDesc = activity.taskDescriptor,
        taskInst = taskDesc.getInstance(self),
        requirements = taskInst.requirements,
        reqByWorks = getRequirementsByWork(requirements),
        selectedReq = activity.requirement,
        workAs = selectedReq.work,
        sameNeedActivity = getActivitiesWithEmployeeOnSameNeed(allActivities, activity),
        // @fixme should thie be here or in the next loop?
        level = parseInt(activity.resourceInstance.skillsets.get(activity.resourceInstance.skillsets.keySet().toArray()[0])),
        deltaLevel = level - parseInt(selectedReq.level);

    if (currentStep === 0) {
        taskTable[taskDesc.name] = parseInt(taskDesc.getInstance(self).getProperty('completeness'));
    }

    //For each need
    for (i = 0; i < sameNeedActivity.length; i++) {
        employeeInst = sameNeedActivity[i].resourceInstance;
        employeeDesc = employeeInst.descriptor;
        affectedEmployeesDesc.push(employeeDesc);
        activityRate = parseFloat(employeeDesc.getInstance(self).getProperty('activityRate'));
        sumActivityRate += activityRate;
        //Calculate ressource motivation factor
        employeesMotivationFactor = 1 + 0.05 * parseFloat(employeeDesc.getProperty('coef_moral')) * (parseInt(employeeDesc.getInstance(self).moral) - 7);
        //Calcul variables for needMotivationFactor (num�rateur de la moyenne pond�r�e de facteur motivation besoin)
        employeesMotivationXActivityRate += employeesMotivationFactor * activityRate;
        //Calcul variables for needSkillsetFactor
        if (deltaLevel > 0) {
            employeeSkillsetFactor = 1 + 0.05 * parseFloat(taskDesc.getProperty('competenceRatioSup')) * deltaLevel;
            if (employeeSkillsetFactor < 0) {
                employeeSkillsetFactor = 0;
            }
        } else {
            employeeSkillsetFactor = 1 + 0.05 * parseFloat(taskDesc.getProperty('competenceRatioInf')) * deltaLevel;
        }
        //Calcul variables for needSkillFactor (num�rateur de la moyenne pond�r�e facteur comp�tence besoin)
        employeesSkillsetXActivityRate += employeeSkillsetFactor * activityRate;

        //Calcul variable for needActivityFactor (num�rateur de la moyenne pond�r�e facteur taux activit� besoin)
        activityCoefficientXActivityRate += parseFloat(employeeDesc.getProperty('coef_activity')) * activityRate;

        //Calcul variable for learnFactor
        if (!haveCorrespondingActivityInPast(employeeInst, taskDesc, getCurrentPeriod().getValue(self))) {
            numberOfEmployeeOnNeedOnNewTask++;
        }
        //Calculate variable for quality
        motivationXActivityRate += parseInt(employeeInst.moral) * activityRate;
        skillsetXActivityRate += parseInt(employeeInst.skillsets.get(employeeInst.skillsets.keySet().toArray()[0])) * activityRate; //level * activityRate
    }

    //calculate needMotivationFactor, needSkillsetFactor and activityNeedRateFactor
    if (sumActivityRate !== 0) {
        stepAdvance *= employeesMotivationXActivityRate / sumActivityRate; //needMotivationFactor (facteur motivation besoin)
        stepAdvance *= employeesSkillsetXActivityRate / sumActivityRate; //needSkillsetFactor (facteur comp�tence besoin)
        stepAdvance *= activityCoefficientXActivityRate / (affectedEmployeesDesc.length * 100); //activityNeedRateFactor (facteur taux activit� besoin)
    }

    // calculate baseAdvance
    stepAdvance *= 1 / (STEPS * (parseInt(taskDesc.getInstance(self).duration))); //baseAdvance

    // calculate numberOfRessourcesFactor
    if (reqByWorks[workAs].totalOfEmployees !== 0) {
        if (affectedEmployeesDesc.length <= reqByWorks[workAs].totalOfEmployees) {
            correctedRessources = reqByWorks[workAs].totalOfEmployees + parseFloat(taskDesc.getProperty('coordinationRatioInf')) * (affectedEmployeesDesc.length - reqByWorks[workAs].totalOfEmployees);
            if (correctedRessources / affectedEmployeesDesc.length < 0.2) {
                correctedRessources = affectedEmployeesDesc.length / 5;
            }
        } else {
            correctedRessources = reqByWorks[workAs].totalOfEmployees + parseFloat(taskDesc.getProperty('coordinationRatioSup')) * (affectedEmployeesDesc.length - reqByWorks[workAs].totalOfEmployees);
        }
        stepAdvance *= correctedRessources / reqByWorks[workAs].totalOfEmployees; //numberOfRessourcesFactor
    }

    if (reqByWorks[workAs].dimFactorAdvancement) {
        otherWorkFactor = 0.8;
    }
    stepAdvance *= otherWorkFactor;

    //calculate randomFactor                                                    
    stepAdvance *= getRandomFactorFromTask(taskInst);

    //calculate learnFactor
    if (taskTable[taskDesc.name] > 15 && !workOnTask(employeeDesc.label, taskDesc.name)) {
        stepAdvance *= 1 - ((numberOfEmployeeOnNeedOnNewTask * (parseFloat(taskDesc.getProperty('takeInHandDuration') / 100))) / affectedEmployeesDesc.length);//learnFactor
    }

    //calculate tasks bonusRatio
    stepAdvance *= (parseFloat(taskInst.getProperty('bonusRatio')));

    //calculate project bonusRatio
    stepAdvance *= parseFloat(Variable.findByName(gm, 'bonusRatio').getValue(self));

    //calculate predecessorFactor
    stepAdvance *= getPredecessorFactor(taskDesc); //predecessor factor

    stepAdvance *= 100;

    stepAdvance /= affectedEmployeesDesc.length;

    //calculate new needCompleteness
    needProgress = parseFloat(selectedReq.completeness) + stepAdvance;

    //calculate stepQuality
    if (sumActivityRate !== 0) {
        stepQuality = 1 + 0.03 * ((motivationXActivityRate / sumActivityRate) - 7); //Motivation quality
        averageSkillsetQuality = (skillsetXActivityRate / sumActivityRate);
        if (averageSkillsetQuality >= parseInt(selectedReq.level)) {
            stepQuality += 1 + 0.02 * (averageSkillsetQuality - parseInt(selectedReq.level)); //skillset (level) quality
        } else {
            stepQuality += 1 + 0.03 * (averageSkillsetQuality - parseInt(selectedReq.level)); //skillset (level) quality
        }
    }
    stepQuality = (stepQuality / 2) * 100;                                      //step Quality
    if (needProgress > 0) {
        selectedReq.setQuality((parseFloat(selectedReq.quality) * parseFloat(selectedReq.completeness) + stepQuality * stepAdvance) / needProgress);
    }

    //set Wage (add 1/steps of the need's wage at task);
    taskInst.setProperty('wages', (parseInt(taskInst.getProperty('wages')) + Math.round((parseInt(activity.resourceInstance.getProperty('wage')) / 4) / STEPS)));

    debug('sameNeedActivity.length : ' + sameNeedActivity.length);
    debug('employeesMotivationFactor : ' + employeesMotivationFactor);
    debug('employeesMotivationXActivityRate : ' + employeesMotivationXActivityRate);
    debug('sumActivityRate : ' + sumActivityRate);
    debug('deltaLevel : ' + deltaLevel);
    debug('employeeSkillsetFactor : ' + employeeSkillsetFactor);
    debug('employeesSkillsetXActivityRate : ' + employeesSkillsetXActivityRate);
    debug('activityCoefficientXActivityRate : ' + activityCoefficientXActivityRate);
    debug('numberOfEmployeeOnNeedOnNewTask : ' + numberOfEmployeeOnNeedOnNewTask);
    debug('motivationXActivityRate: ' + motivationXActivityRate);
    debug('skillsetXActivityRate: ' + skillsetXActivityRate);
    debug('NeedMotivationFactor : ' + employeesMotivationXActivityRate / sumActivityRate);
    debug('NeedSkillsetFactor : ' + employeesMotivationXActivityRate / sumActivityRate);
    debug('ActivityNeedRateFactor : ' + activityCoefficientXActivityRate / sumActivityRate);
    debug('baseAdvance : ' + 1 / (STEPS * (parseInt(taskDesc.getInstance(self).duration))));
    debug('numberOfRessourcesFactor : ' + correctedRessources / reqByWorks[workAs].totalOfEmployees);
    debug('otherWorkFactor : ' + otherWorkFactor);
    debug('randomFactor (not same value as used !) : ' + getRandomFactorFromTask(taskInst));
    debug('learnFactor : ' + (1 - ((numberOfEmployeeOnNeedOnNewTask * (parseFloat(taskInst.getProperty('takeInHandDuration') / 100))) / affectedEmployeesDesc.length)));
    debug('taskbonusRatio : ' + parseFloat(taskInst.getProperty('bonusRatio')));
    debug('projectBonusRatio : ' + parseFloat(Variable.findByName(gm, 'bonusRatio').getValue(self)));
    debug('predecessorFactor : ' + getPredecessorFactor(taskDesc)); //predecessor factor);
    debug('wages : ' + (parseInt(taskInst.getProperty('wages')) + (parseInt(activity.resourceInstance.getProperty('wage')) / STEPS))); //predecessor factor);
    debug('stepAdvance : ' + stepAdvance);
    debug('need completeness : ' + parseFloat(selectedReq.completeness));
    debug('needProgress : ' + needProgress);
    debug('StepQuality : ' + (parseFloat(selectedReq.quality) * parseFloat(selectedReq.completeness) + stepQuality * stepAdvance) / needProgress);
    debug('facteur motivation besoin : ' + employeesMotivationXActivityRate / sumActivityRate);
    debug('facteur competence besoin : ' + employeesSkillsetXActivityRate / sumActivityRate);
    debug('nb employ� affect� : ' + affectedEmployeesDesc.length);
    debug('facteur taux activit� besoin : ' + activityCoefficientXActivityRate / (affectedEmployeesDesc.length * 100));
    debug('Ressource corrig�e : ' + correctedRessources);
    debug('emp total : ' + reqByWorks[workAs].totalOfEmployees);
    debug('Facteur nb ressource besoin : ' + correctedRessources / reqByWorks[workAs].totalOfEmployees);
    debug('task completness : ' + taskInst.getProperty('completeness'));

    //set need progress (after calcuateQuality) and return it
    selectedReq.setCompleteness(needProgress);
    return  needProgress;
}

/**
 * Return a random factor based on properties 'randomDurationSup' and 'randomDurationInf'
 * of the given task.
 * @param {TaskInstance} taskInst
 * @returns {Number} a factor between 0 and 2
 */
function getRandomFactorFromTask(taskInst) {
    var rn = Math.floor(Math.random() * 100), //number 0 to 100 (0 inclusive, 100 exclusive);
        randomDurationSup = parseFloat(taskInst.getProperty('randomDurationSup')),
        randomDurationInf = parseFloat(taskInst.getProperty('randomDurationInf')),
        duration = parseInt(taskInst.duration), delta,
        randomFactor, x = Math.random();

    if (rn < 3) {
        delta = -(0.25 * x + 0.75) * randomDurationInf;
    } else if (rn < 10) {
        delta = -(0.25 * x + 0.50) * randomDurationInf;
    } else if (rn < 25) {
        delta = -(0.25 * x + 0.25) * randomDurationInf;
    } else if (rn < 50) {
        delta = -0.25 * x * randomDurationInf;
    } else if (rn < 75) {
        delta = 0.25 * x * randomDurationSup;
    } else if (rn < 90) {
        delta = (0.25 * x + 0.25) * randomDurationSup;
    } else if (rn < 97) {
        delta = (0.25 * x + 0.50) * randomDurationSup;
    } else {
        delta = (0.25 * x + 0.75) * randomDurationSup;
    }

    randomFactor = duration + delta;

    if (randomFactor < minTaskDuration) {
        randomFactor = minTaskDuration;
    }

    return getFloat((duration / randomFactor), 2);
}

/**
 * Calculate the current quality of the task based on the average of the quality
 *  in each bound requirement and weighted by the progression of its cmpleteness.
 * @param {TaskDescriptor} taskDesc
 * @returns {Number} a number btween 0 and 200
 */
function calculateTaskQuality(taskDesc) {
    var i, req, needQualityXNeedProgress = 0, needProgress = 0;
    for (i = 0; i < taskDesc.getInstance(self).requirements.size(); i++) {
        req = taskDesc.getInstance(self).requirements.get(i);
        needQualityXNeedProgress += (parseFloat(req.quality) * parseFloat(req.completeness));
        needProgress += parseFloat(req.completeness);
    }
    return Math.round((needQualityXNeedProgress / needProgress));
}

function getCurrentPhase() {
    return Variable.findByName(gm, 'currentPhase');
}

function getCurrentPeriod() {
    var periods = Variable.findByName(gm, 'currentPeriod');
    if (periods !== null && currentPhase.value !== null) {
        return periods.items.get(currentPhase.value);
    }
    return null;
}

/**
 * return true if arg == boolean true or string 'true'
 * @param {String or Boolean} arg
 * @returns {Boolean} state
 */
function isTrue(arg) {
    return (arg == true || arg == 'true') ? true : false;
}

/**
 * return a float with a length = to the given "numberOfDigit"
 * @param {Number} number
 * @param {Number} numberOfDigit
 * @returns {Number}
 */
function getFloat(number, numberOfDigit) {
    numberOfDigit = Math.pow(10, (numberOfDigit > 1) ? numberOfDigit : 1);
    return Math.round(number * numberOfDigit) / numberOfDigit;
}

/**
 * Check the end of a task or of a requirement and send corresponding messages.
 * if it's the last step, call function ''checkAssignments'' to send other kind of messages.
 * @param {Array} allCurrentActivities, an Array of Activity
 * @param {Number} currentStep
 */
function checkEnd(allCurrentActivities, currentStep) {
    var i, employeeInst, taskInst, taskDesc, employeeName, employeeJob,
        nextWork, reqByWorks;
    for (i = 0; i < allCurrentActivities.length; i++) {
        taskDesc = allCurrentActivities[i].taskDescriptor;
        taskInst = taskDesc.getInstance(self);
        employeeInst = allCurrentActivities[i].resourceInstance;
        employeeName = employeeInst.descriptor.label;
        employeeJob = employeeInst.skillsets.keySet().toArray()[0];
        if (currentStep === STEPS - 1) {
            checkAssignments(employeeInst, currentStep);
        } else if (parseFloat(taskInst.getProperty('completeness')) < 100) {
            reqByWorks = getRequirementsByWork(taskInst.requirements);
            nextWork = selectFirstUncompletedWork(taskInst.requirements, reqByWorks, employeeInst.skillsets.keySet().toArray()[0].toString());
            if (allCurrentActivities[i].requirement.work != nextWork) {
                sendMessage(getStepName(currentStep) + ') T�che : ' + taskDesc.label + ' en partie termin�e',
                    'Nous avons termin� la partie ' + allCurrentActivities[i].requirement.work + ' de la t�che ' + taskDesc.label + '. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                    employeeName);
//                sendMessage(getStepName(currentStep) + ') T�che : ' + taskDesc.label + ' en partie termin�e',
//                        'Nous avons termin� la partie ' + allCurrentActivities[i].requirement.work + ' de la t�che ' + taskDesc.label + '. Je passe � ' + nextWork + '. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
//                        employeeName);
            }
        }
    }
}

/**
 * Return a name for each step.
 * @param {Number} step
 * @returns {String} the name of the step
 */
function getStepName(step) {
    return STEPNAMES[step];
}

/**
 * Send a message to the current player.
 * @param String subject, the subject of the message.
 * @param String message, the content of the message.
 * @param String from, the sender of the message.
 */
function sendMessage(subject, content, from) {
    Variable.find(gameModel, "inbox").sendMessage(self, subject, content, from, []);
}

/**
 * Print a console msg if in debug mode
 * 
 * @param {String} msg
 */
function debug(msg) {
    if (testMode) {
        println(msg);
    }
}
