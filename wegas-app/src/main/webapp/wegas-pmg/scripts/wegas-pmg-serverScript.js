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
//Global variable for easy use
var gm = self.getGameModel();

/**
 * Call all necessary method to pass a period and calculate all variable.
 * set phase (if period egal max period) and set period.
 * if enter in phase 2, change pageGantt and pageTask then call function setWeekliesVariables
 * to calculate values like gauges and EV, AC, ...
 * if period is passed in phase realisation, calculate task progress (call
 *  function completeRealizationPeriod) and check the end of the project (if true, pass to phase 4).
 */
function nextPeriod() {
    var currentPhase = getCurrentPhase(),
        currentPeriod = getCurrentPeriod();

    //allPhaseQuestionAnswered();                                               // First Check if all questions are answered

    if (currentPeriod.getValue(self) === currentPeriod.maxValueD) {             // If end of phase
        currentPhase.add(self, 1);
        //currentPeriod.setValue(self, 1);// Why?
        if (currentPhase.getValue(self) === 2) {
            Variable.findByName(gm, 'ganttPage').setValue(self, 11);
            Variable.findByName(gm, 'taskPage').setValue(self, 12);
        }
    } else if (currentPhase.getValue(self) === 2) {                             // If current phase is the 'realisation' phase
        runSimulation();
        currentPeriod.add(self, 1);
        if (checkEndOfProject()) {                                              // If the project is over
            currentPhase.add(self, 1);
        }
    } else {                                                                    // Otherwise pass to next period
        currentPeriod.add(self, 1);
    }
    updateVariables();
}

/**
 * Check if all active task is complete (Completeness > 100).
 * @returns {Boolean} true if the project is ended
 */
function checkEndOfProject() {
    var i, task, tasks = Variable.findByName(gm, 'tasks');
    for (i = 0; i < tasks.items.size(); i++) {
        task = tasks.items.get(i).getInstance(self);
        if (task.active && task.getPropertyD('completeness') < 100) {
            return false;
        }
    }
    return true;
}

/**
 * Check if all questions from a phase are answered
 */
function allPhaseQuestionAnswered() {
    var i, question, questions;

    try {
        questions = Variable.findByName(gm, "questions").items.get(getCurrentPhase().getValue(self)).items.get(getCurrentPeriod().getValue(self) - 1).items;
    } catch (e) {
        // Unable to find question list for current phase
    }
    if (questions) {
        for (i = 0; i < questions.size(); i++) {
            question = questions.get(i);
            if (!question.isReplied(self) && question.isActive(self)) {
                throw new Error("StringMessage: You have not answered all questions from this week.");
            }
        }
    }
}
/**
 * This function calculate the planned value at a given time
 * @param {Number} period
 * @returns {Number} Planned value
 */
function calculatePlanedValue(period) {
    var i, j, task, pv = 0,
        tasks = Variable.findByName(gm, 'tasks'),
        totalPv = 0;

    println("plannedvalue: " + period);

    for (i = 0; i < tasks.items.size(); i++) {
        task = tasks.items.get(i).getInstance(self);
        if (task.active) {
            totalPv += task.getPropertyD('bac');
            if (task.plannification.size() === 0) {
                pv += task.getPropertyD('bac');
            }
            for (j = 0; j < task.plannification.size(); j++) {
                println("s" + task.plannification.get(j) + "*" + task.getPropertyD('bac') + "*" + (task.getPropertyD('bac') / task.plannification.size()));
                if (parseInt(task.plannification.get(j)) < period) {
                    pv += task.getPropertyD('bac') / task.plannification.size();
                }
            }
        }
    }
    println("pv" + pv);
    return pv;
}
/**
 * Calculate planedValue, earnedValue, actualCost, projectCompleteness, cpi, spi, save
 * history for variable the same variable and for costs, delay and quality.
 */
function updateVariables() {
    var i, j, task, employeesRequired,
        ev = 0, pv = 0, ac = 0, sumProjectCompleteness = 0, activeTasks = 0,
        tasksQuality = 0, tasksScale = 0,
        costsJaugeValue = 100, delayJaugeValue = 100, qualityJaugeValue = 0,
        tasks = Variable.findByName(gm, 'tasks'),
        costs = Variable.findByName(gm, 'costs'),
        delay = Variable.findByName(gm, 'delay'),
        quality = Variable.findByName(gm, 'quality'),
        planedValue = Variable.findByName(gm, 'planedValue'),
        earnedValue = Variable.findByName(gm, 'earnedValue'),
        actualCost = Variable.findByName(gm, 'actualCost'),
        exectutionPeriods = Variable.findByName(gm, 'periodPhase3');

    for (i = 0; i < tasks.items.size(); i++) {
        task = tasks.items.get(i).getInstance(self);
        sumProjectCompleteness += parseFloat(task.getProperty('completeness'));
        if (task.active) {                                                      //if task is active
            activeTasks += 1;
            ev += task.getPropertyD('bac') * task.getPropertyD('completeness') / 100;
            //pv += parseInt(task.getProperty('bac')) * (getPlannifiedCompleteness(v) / 100);
            //ac += parseInt(task.getProperty('wages')) + (parseInt(task.getProperty('completeness')) / 100) * parseInt(task.getProperty('fixedCosts')) + parseInt(task.getProperty('unworkedHoursCosts'));

            employeesRequired = 0;
            for (j = 0; j < task.requirements.size(); j++) {
                employeesRequired += task.requirements.get(j).quantity;
            }
            tasksScale += task.duration * employeesRequired;
            if (task.getPropertyD('completeness') > 0) {                        //...and started
                ac += task.getPropertyD('wages') + task.getPropertyD('fixedCosts') + task.getPropertyD('unworkedHoursCosts');
                //TO check
                tasksQuality += task.getPropertyD('quality') * task.duration * employeesRequired;
            } else {
                tasksQuality += (100 + task.getPropertyD('quality')) * task.duration * employeesRequired;
            }
        }
    }

    // completness = sum of all task's completeness in %
    Variable.findByName(gm, 'projectCompleteness').setValue(self, sumProjectCompleteness / activeTasks);
    //nbCompleteTasks = sumProjectCompleteness * activeTasks / (activeTasks * 100);
    //Variable.findByName(gm, 'projectCompleteness').setValue(self, nbCompleteTasks * 100 / activeTasks);
    //projectCompleteness.setValue(self, sumProjectCompleteness);

    // pv = for each task, sum -> bac * task completeness / 100
    planedValue.setValue(self, calculatePlanedValue(exectutionPeriods.getValue(self)));
    // ev = for each task, sum -> bac * planified task completeness / 100
    earnedValue.setValue(self, ev);
    // ac = project fixe costs + for each task, sum -> wages + (completeness / 100) * fixed costs + unworkedHoursCosts
    //Variable.findByName(gm, 'actualCost').setValue(self, ac + parseInt(projectFixCosts.getValue(self)));
    actualCost.setValue(self, ac);
    //cpi = ev / ac * 100
    Variable.findByName(gm, 'cpi').setValue(self, (ev / ac * 100));
    //spi = ev / pv * 100
    Variable.findByName(gm, 'spi').setValue(self, (ev / pv * 100));

    // costs = EV / AC * 100
    if (planedValue.getValue(self) > 0) {
        costsJaugeValue = Math.round((earnedValue.getValue(self) / actualCost.getValue(self)) * 100);
    }
    costsJaugeValue = Math.min(Math.max(costsJaugeValue, costs.minValueD), costs.maxValueD);
    costs.setValue(self, costsJaugeValue);

    // delay = EV / PV * 100
    if (planedValue.getValue(self) > 0) {
        delayJaugeValue = Math.round(earnedValue.getValue(self) * 100 / planedValue.getValue(self));
    }
    delayJaugeValue = Math.min(Math.max(delayJaugeValue, delay.minValueD), delay.maxValueD);
    delay.setValue(self, delayJaugeValue);

    //quality
    //with weighting of task's scale = sum each task -> task quality / task scale
    if (tasksScale > 0) {
        qualityJaugeValue = (tasksQuality / tasksScale);
    }
    //whitout weighting of task's scale
    //if (activeTasks > 0) {
    //    qualityJaugeValue = tasksQuality / activeTasks;
    //}
    qualityJaugeValue += Variable.findByName(gm, 'qualityImpacts').getValue(self) / 2;
    qualityJaugeValue = Math.min(Math.max(qualityJaugeValue, quality.minValueD), quality.maxValueD);
    quality.setValue(self, qualityJaugeValue);

    costs.getInstance(self).saveHistory();
    delay.getInstance(self).saveHistory();
    quality.getInstance(self).saveHistory();
    planedValue.getInstance(self).saveHistory();
    earnedValue.getInstance(self).saveHistory();
    actualCost.getInstance(self).saveHistory();
    Variable.findByName(gm, 'managementApproval').getInstance(self).saveHistory();
    Variable.findByName(gm, 'userApproval').getInstance(self).saveHistory();
}
