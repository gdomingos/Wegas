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
        //currentPeriod.setValue(self, 1);                                      // Why?
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
    return !Y.Array.find(Variable.findByName(gm, 'tasks').items, function(t) {
        return t.getInstance(self).active && t.getInstance(self).getPropertyD('completeness') < 100;
    });
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
 * This function calculate the planned value for a given time
 * @param {Number} period
 * @returns {Number} Planned value
 */
function calculatePlanedValue(period) {
    return Y.Array.sum(getActiveTasks(), function(t) {
        if (t.plannification.size() === 0) {                                    // If the user did not provide a planfication
            return t.getPropertyD('bac');                                       // return budget at completion as it is

        } else {                                                                // Otherwise
            return Y.Array.sum(t.plannification, function(p) {                         // return a ratio of the bac and the already passed periods in plannification
                if (parseInt(p) < period) {
                    return t.getPropertyD('bac') / t.plannification.size();
                } else
                    return 0;
            });
        }
    });
}
/**
 * Calculate planedValue, earnedValue, actualCost, projectCompleteness, cpi, spi, save
 * history for variable the same variable and for costs, delay and quality.
 */
function updateVariables() {
    var i, task, employeesRequired,
        ev = 0, ac = 0, sumProjectCompleteness = 0,
        tasksQuality = 0, tasksScale = 0, qualityJaugeValue = 0,
        costs = Variable.findByName(gm, 'costs'),
        delay = Variable.findByName(gm, 'delay'),
        quality = Variable.findByName(gm, 'quality'),
        planedValue = Variable.findByName(gm, 'planedValue'),
        earnedValue = Variable.findByName(gm, 'earnedValue'),
        actualCost = Variable.findByName(gm, 'actualCost'),
        tasks = getActiveTasks(),
        pv = calculatePlanedValue(Variable.findByName(gm, 'periodPhase3').getValue(self));// pv = for each task, sum -> bac * task completeness / 100

    debug("tasks: " + tasks + "*" + tasks.length);
    for (i = 0; i < tasks.length; i++) {
        task = tasks[i];
        sumProjectCompleteness += task.getPropertyD('completeness');
        debug("calc ev: " + task.getPropertyD('bac') + "*" + task.getPropertyD('completeness'));
        ev += task.getPropertyD('bac') * task.getPropertyD('completeness') / 100;
        //pv += parseInt(task.getProperty('bac')) * (getPlannifiedCompleteness(v) / 100);
        //ac += parseInt(task.getProperty('wages')) + (parseInt(task.getProperty('completeness')) / 100) * parseInt(task.getProperty('fixedCosts')) + parseInt(task.getProperty('unworkedHoursCosts'));

        tasksScale += task.duration * Y.Array.sum(task.requirements, function(r) {
            return r.quantity;
        });

        employeesRequired = Y.Array.sum(task.requirements, function(r) {
            return r.quantity;
        });
        if (task.getPropertyD('completeness') > 0) {                        //...and started
            debug("calc ac" + task + "*" + task.getPropertyD('wages') + "*" + task.getPropertyD('fixedCosts') + "*" + task.getPropertyD('unworkedHoursCosts'))
            ac += task.getPropertyD('wages') + task.getPropertyD('fixedCosts') + task.getPropertyD('unworkedHoursCosts');
            //TO check
            tasksQuality += task.getPropertyD('quality') * task.duration * employeesRequired;
        } else {
            tasksQuality += (100 + task.getPropertyD('quality')) * task.duration * employeesRequired;
        }
    }

    Variable.findByName(gm, 'projectCompleteness')
        .setValue(self, sumProjectCompleteness / tasks.length);                 // completness = sum of all task's completeness in %

    //nbCompleteTasks = sumProjectCompleteness * activeTasks / (activeTasks * 100);
    //Variable.findByName(gm, 'projectCompleteness').setValue(self, nbCompleteTasks * 100 / activeTasks);
    //projectCompleteness.setValue(self, sumProjectCompleteness);

    planedValue.setValue(self, pv);

    earnedValue.setValue(self, ev);                                             // ev = for each task, sum -> bac * planified task completeness / 100

    actualCost.setValue(self, ac);                                              // ac = project fixe costs + for each task, sum -> wages + (completeness / 100) * fixed costs + unworkedHoursCosts
    //actualCost.setValue(self, ac + parseInt(projectFixCosts.getValue(self)));

    println("updateVariables(): pv: " + pv + ", ac: " + ac + ", ev: " + ev);
    // Costs
    if (pv > 0) {
        var cpi = ev / ac * 100;                                                // cpi = ev / ac * 100
        costs.setValue(self, Math.min(Math.max(Math.round(cpi), costs.minValueD), costs.maxValueD));
        Variable.findByName(gm, 'cpi').setValue(self, cpi);
    } else {
        costs.setValue(self, 100);
        Variable.findByName(gm, 'cpi').setValue(self, 100);
    }

    // Delay
    if (pv > 0) {
        var spi = ev / pv * 100;                                                // spi = ev / pv * 100
        delay.setValue(self, Math.min(Math.max(Math.round(spi), delay.minValueD), delay.maxValueD));
        Variable.findByName(gm, 'spi').setValue(self, spi);
    } else {
        delay.setValue(self, 100);
        Variable.findByName(gm, 'spi').setValue(self, 100);
    }

    // Quality
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

function addPredecessor(descName, listPredName) {
    var task = Variable.findByName(gameModel, descName);

    Y.Array.each(listPredName, function(predName) {
        task.predecessors.add(Variable.findByName(gameModel, predName));
    });
}
