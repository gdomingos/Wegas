/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 * @author Benjamin Gerber <ger.benjamin@gmail.com>
 */
YUI.add('wegas-proggame-display', function(Y) {
    "use strict";

    var ProgGameDisplay, GRIDSIZE = 32;
    /**
     * Level display, should handle canvas, for now renders the level as a
     * table element.
     *
     */
    ProgGameDisplay = Y.Base.create("wegas-proggame-display", Y.Widget, [], {
        CONTENT_TEMPLATE: '<div><div class="object-layer"></div><div id="cr-stage"></div></div>',
        renderMethod: null,
        gridH: null,
        gridW: null,
        allowNextCommand: null,
        initializer: function() {
            this.allowNextCommand = false;
            this.publish("commandExecuted", {});
            if (this.get('map')) {
                this.gridH = this.get('map').length;
                this.gridW = this.get('map')[0].length;
            }
        },
        renderUI: function() {
            var i, j;

            Crafty.init(GRIDSIZE * this.gridW, GRIDSIZE * this.gridH);
            if (Crafty.support.canvas) {
                Crafty.canvas.init();
                this.renderMethod = 'Canvas';
            } else {
                this.renderMethod = 'DOM';
            }

            Crafty.refWidget = this;

            Crafty.bind('commandExecuted', function() {
                if (Crafty.refWidget.allowNextCommand) {
                    Crafty.refWidget.allowNextCommand = false;
                    Crafty.refWidget.fire('commandExecuted');
                }
            });

            Crafty.background('rgb(110,110,110)');
            //sprites (temporary, need to create dynamically)
            Crafty.sprite(24, 32, Y.Wegas.app.get("base") + '/wegas-proggame/images/characters.png', {
                characters: [0, 0]
            });
            Crafty.sprite(32, 32, Y.Wegas.app.get("base") + '/wegas-proggame/images/lightning.png', {
                lightning: [0, 0]
            });
            Crafty.sprite(32, 32, Y.Wegas.app.get("base") + '/wegas-proggame/images/terrain.png', {
                terrain: [0, 0]
            });
            //move function
            Crafty.c('move4Direction', {//require Tween and spriteAnimation with "moveUp", "moveRight" "moveDown" and "moveLeft" animation
                tweenEnd: null,
                init: function() {
                    var i, sprites = this.cfg.sprites;
                    this.requires("Tween, SpriteAnimation");
                    for (i = 0; i < sprites.length; i++) {
                        if (sprites[i].name === 'moveUp'
                                || sprites[i].name === 'moveRight'
                                || sprites[i].name === 'moveDown'
                                || sprites[i].name === 'moveLeft') {
                            this.animate(sprites[i].name, sprites[i].x, sprites[i].y, sprites[i].toX);
                        }
                    }
                    this.tweenEnd = []; //Tween x and y. Thus, the tween end when this variable contain x and y.
                    this.bind('TweenEnd', function(e) {
                        this.tweenEnd.push(e);
                        if (this.tweenEnd.length === 2) {
                            this.stop();
                            Crafty.trigger('moveEnded');
                            Crafty.trigger('commandExecuted');
                        }
                    }, this);
                },
                execMove: function(direction, toX, toY, speed) {
                    var animDir, time, dist;
                    switch (direction) {
                        case 1:
                            animDir = 'moveUp';
                            break;
                        case 2:
                            animDir = 'moveRight';
                            break;
                        case 3:
                            animDir = 'moveDown';
                            break;
                        case 4:
                            animDir = 'moveLeft';
                            break;
                        default:
                            return;
                    }
                    if (!this.isPlaying(animDir)) {
                        this.stop();
                        this.animate(animDir, 10, -1);
                    }
                    speed = (speed > 0) ? speed : 1;
                    dist = Math.sqrt(Crafty.math.squaredDistance(this.pos()._x, this.pos()._y, toX, toY));
                    time = Math.round(((dist / GRIDSIZE) * (100 / speed))) + 1; //+1 because if time = 0, time = infinite
                    this.tweenEnd.length = 0;
                    this.tween({x: toX, y: toY}, time);
                }});
            Crafty.c("shoot", {
                shot: null,
                init: function() {
                    this.bind("moveEnded", function() {
                        if (this.shot) {
                            this.shot.destroy();
                        }
                    }, this);
                },
                execFire: function(dir, toX, toY, speed) {
                    this.shot = Crafty.e('2D, lightningShot, ' + Crafty.refWidget.renderMethod);
                    this.shot.attr('x', this.pos()._x);
                    this.shot.attr('y', this.pos()._y);
                    this.shot.execMove(dir, toX, toY, speed);
                }
            });

            Crafty.c("lightningShot", {//temporary hard-coded
                init: function() {
                    var animations = [{
                            name: "moveUp",
                            x: 0,
                            y: 6,
                            toX: 3
                        }, {
                            name: "moveRight",
                            x: 0,
                            y: 0,
                            toX: 3
                        }, {
                            name: "moveDown",
                            x: 0,
                            y: 2,
                            toX: 3
                        }, {
                            name: "moveLeft",
                            x: 0,
                            y: 4,
                            toX: 3
                        }];
                    this.cfg = {'sprites': animations};
                    this.requires("lightning, Tween, SpriteAnimation, move4Direction");
                }
            });

            Crafty.c("die", {
                isDying: null,
                init: function() {
                    this.requires("Tween");
                    this.isDying = false;
                    this.bind('TweenEnd', function(e) {
                        if (this.isDying) {
                            Crafty.trigger('commandExecuted');
                            this.destroy();
                        }
                    }, this);
                },
                execDie: function() {
                    this.isDying = true;
                    this.tween({alpha: 0}, 50);
                }
            });

            /*---Crafty "render"---*/
            //map
            var mapObject, alea, sprite,
                    //mapObjects = this.get('mapObjects'),
                    map = this.get('map');
            for (i = 0; i < this.gridH; i += 1) {
                for (j = 0; j < this.gridW; j += 1) {

                    mapObject = map[i][j];
                    sprite = (mapObject.sprite) ? ProgGameDisplay.SPRITESHEETS[mapObject.sprite].name : "terrain";
                    if (mapObject) {
                        if (mapObject.x.length && mapObject.y.length && mapObject.x.length === mapObject.y.length) {
                            alea = Math.floor(Math.random() * mapObject.x.length);
                            Crafty.e('2D, ' + this.renderMethod + ', Color, ' + sprite)
                                    .sprite(mapObject.x[alea], mapObject.y[alea])
                                    .attr({x: GRIDSIZE * j, y: GRIDSIZE * i});
                        } else {
                            Crafty.e('2D, ' + this.renderMethod + ', Color, ' + sprite)
                                    .sprite(mapObject.x, mapObject.y)
                                    .attr({x: GRIDSIZE * j, y: GRIDSIZE * i});
                        }
                    }
                    //mapObject = Y.Array.find(mapObjects, function(item) {
                    //    return  map[i][j] === item.name;
                    //});
                    //if (mapObject) {
                    //    var alea;
                    //    //console.log(mapObject.x[0]);
                    //    if (mapObject.x.length && mapObject.y.length && mapObject.x.length === mapObject.y.length) {
                    //        alea = Math.floor(Math.random() * mapObject.x.length);
                    //        Crafty.e('2D, ' + this.renderMethod + ', Color, ' + mapObject.spriteSheet)
                    //                .sprite(mapObject.x[alea], mapObject.y[alea])
                    //                .attr({x: GRIDSIZE * j, y: GRIDSIZE * i});
                    //    } else {
                    //        Crafty.e('2D, ' + this.renderMethod + ', Color, ' + mapObject.spriteSheet)
                    //                .sprite(mapObject.x, mapObject.y)
                    //                .attr({x: GRIDSIZE * j, y: GRIDSIZE * i});
                    //    }
                    //}
                }
            }

            //Entities
            var object, pos, template,
                    objects = this.get('objects'),
                    makeEntity = function(cfg) {
                Crafty.c(cfg.id, {
                    init: function() {
                        this.cfg = cfg;
                        if (cfg.spriteSheet) {
                            this.requires(cfg.spriteSheet);
                            if (cfg.sprites) {
                                this.sprite(cfg.sprites[0].x, cfg.sprites[0].y);
                            }
                        }
                        if (cfg.aptitudes) {
                            this.requires(cfg.aptitudes);
                        }
                    }
                });
            };
            for (i = 0; i < objects.length; i++) {
                template = Y.Array.find(ProgGameDisplay.OBJECTTEMPLATES, function(item) {
                    return item.id === objects[i].id;
                });
                object = Y.mix(objects[i], template || {});
                makeEntity(object);
                pos = this.getRealXYPos([object.x, object.y]);
                Crafty.e('2D, ' + this.renderMethod + ', ' + object.id);
                Crafty(object.id).attr('x', pos[0]);
                Crafty(object.id).attr('y', pos[1]);
                if (Crafty(object.id).execMove) {
                    Crafty(object.id).execMove(object.direction, pos[0], pos[1]);
                }
            }
        },
        destructor: function() {
            var k;
            for (k in Crafty("*")) {
                if (Crafty("*")[k].destroy) {
                    Crafty("*")[k].destroy();
                }
            }
            Crafty.unbind('dieEnded');
            Crafty.unbind('moveEnded');
            Crafty.unbind('commandExecuted');
        },
        execute: function(command) {
            var object, entity, dir, pos, i;
            switch (command.type) {
                case "resetLevel":
                    for (i = 0; i < command.objects.length; i++) {
                        object = command.objects[i];
                        pos = this.getRealXYPos([object.x, object.y]);
                        Crafty(object.id).attr('x', pos[0]);
                        Crafty(object.id).attr('y', pos[1]);
                        if (Crafty(object.id).execMove) {
                            Crafty(object.id).execMove(object.direction, pos[0], pos[1]);
                        }
                    }
                    this.fire("commandExecuted");
                    break;
                case "move":
                    object = command.object;
                    this.set("objects", object);
                    entity = object.id;
                    dir = object.direction;
                    pos = this.getRealXYPos([object.x, object.y]);
                    this.allowNextCommand = true;
                    if (entity && Crafty(entity) && Crafty(entity).execMove) {
                        Crafty(entity).execMove(dir, pos[0], pos[1], 2);
                    } else {
                        this.fire('commandExecuted');
                    }
                    break;
                case "fire":
                    object = command.object;
                    entity = object.id;
                    dir = object.direction;
                    switch (dir) {
                        case 1:
                            pos = this.getRealXYPos([object.x, object.y + object.range]);
                            break;
                        case 2:
                            pos = this.getRealXYPos([object.x + object.range, object.y]);
                            break;
                        case 3:
                            pos = this.getRealXYPos([object.x, object.y - object.range]);
                            break;
                        case 4:
                            pos = this.getRealXYPos([object.x - object.range, object.y]);
                            break;
                    }
                    this.allowNextCommand = true;
                    if (entity && Crafty(entity) && Crafty(entity).execFire) {
                        Crafty(entity).execFire(dir, pos[0], pos[1], 7);
                    } else {
                        this.fire('commandExecuted');
                    }
                    break;
                case "die":
                    object = command.object;
                    entity = object.id;
                    this.allowNextCommand = true;
                    if (entity && Crafty(entity) && Crafty(entity).execDie) {
                        Crafty(entity).execDie();
                    } else {
                        this.fire('commandExecuted');
                    }
                    break;
            }
        },
        getRealXYPos: function(position) {
            var pos = [];
            if (!position || typeof position[0] !== 'number' || typeof position[1] !== 'number') {
                return pos;
            }
            pos.push(position[0] * GRIDSIZE); //x
            pos.push((this.gridH - position[1] - 1) * GRIDSIZE); //y
            return pos;
        }

    }, {
        ATTRS: {
            map: {
                validator: Y.Lang.isArray
            },
            objects: {
            }
        },
        SPRITESHEETS: {
            t: {
                name: "terrain",
                width: 32,
                height: 32,
                tilewidth: 32,
                tileHeight: 32
            }
        },
        OBJECTTEMPLATES: [{
                id: "Player",
                type: "pc",
                direction: 2,
                x: 0,
                y: 0,
                life: 100,
                actions: 20,
                range: 3,
                spriteSheet: "characters",
                aptitudes: "move4Direction, shoot, die",
                sprites: [{
                        name: "moveUp",
                        x: 0,
                        y: 0,
                        toX: 2
                    }, {
                        name: "moveRight",
                        x: 0,
                        y: 1,
                        toX: 2
                    }, {
                        name: "moveDown",
                        x: 0,
                        y: 2,
                        toX: 2
                    }, {
                        name: "moveLeft",
                        x: 0,
                        y: 3,
                        toX: 2
                    }]
            }, {
                direction: 4,
                id: "Enemy",
                type: "npc",
                x: 0,
                y: 0,
                life: 100,
                actions: 0,
                range: 2,
                collides: false,
                spriteSheet: "characters",
                aptitudes: "move4Direction, shoot, die",
                sprites: [{
                        name: "moveUp",
                        x: 9,
                        y: 0,
                        toX: 11
                    }, {
                        name: "moveRight",
                        x: 9,
                        y: 1,
                        toX: 11
                    }, {
                        name: "moveDown",
                        x: 9,
                        y: 2,
                        toX: 11
                    }, {
                        name: "moveLeft",
                        x: 9,
                        y: 3,
                        toX: 11
                    }]
            }, {
                id: "Bloc1",
                type: "other",
                spriteSheet: "terrain",
                sprites: [{
                        x: 23,
                        y: 18
                    }]
            }, {
                id: "Bloc2",
                type: "other",
                spriteSheet: "terrain",
                sprites: [{
                        x: 24,
                        y: 21
                    }]
            }, {
                id: "Bloc3",
                type: "other",
                spriteSheet: "terrain",
                sprites: [{
                        x: 21,
                        y: 21
                    }]
            }],
        mapObjects: [{
                "name": "g",
                "spriteSheet": "terrain",
                "x": [21, 22, 21],
                "y": [5, 5, 11]
            }, {
                "name": "e",
                "spriteSheet": "terrain",
                "x": 17,
                "y": 5
            }, {
                "name": "w",
                "spriteSheet": "terrain",
                "x": 21,
                "y": 17
            },
        ]
    });

    Y.namespace('Wegas').ProgGameDisplay = ProgGameDisplay;
});