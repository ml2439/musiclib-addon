define(function(require, exports, module) {
    
        var Ratchet = require("ratchet/ratchet");
        var Actions = require("ratchet/actions");
        var OneTeam = require("oneteam");
        var $ = require("jquery");
    
        return Ratchet.Actions.register("create_album", Ratchet.AbstractUIAction.extend({
    
            defaultConfiguration: function()
            {
                var config = this.base();
    
                config.title = "Create Album";
                config.iconClass = "glyphicon glyphicon-pencil";
    
                return config;
            },
    
            execute: function(config, actionContext, callback)
            {
                this.doAction(actionContext, function(err, result) {
                    callback(err, result);
                });
            },
    
            doAction: function(actionContext, callback)
            {
                var self = this;
    
                // modal dialog
                Ratchet.fadeModal({
                    "title": "Create an Album",
                    "cancel": true
                }, function(div, renderCallback) {
    
                    // append the "Create" button
                    $(div).find('.modal-footer').append("<button class='btn btn-primary pull-right create'>Create</button>");
    
                    // body
                    $(div).find(".modal-body").html("");
                    $(div).find(".modal-body").append("<div class='form'></div>");
    
                    // form definition
                    var c = {
                        "data": {
                        },
                        "schema": {
                            "type": "object",
                            "properties": {
                                "key": {
                                    "type": "string",
                                    "required": true
                                },
                                "title": {
                                    "type": "string",
                                    "required": true
                                },
                                "description": {
                                    "type": "string"
                                }
                            }
                        },
                        "options": {
                            "fields": {
                                "key": {
                                    "type": "text",
                                    "label": "Key",
                                    "helper": "A unique key for this Album"
                                },
                                "title": {
                                    "type": "text",
                                    "label": "Title"
                                },
                                "description": {
                                    "type": "textarea",
                                    "label": "Description"
                                }
                            }
                        }
                    };
    
                    c.postRender = function(control)
                    {
                        // create button
                        $(div).find('.create').click(function() {
    
                            OneTeam.processFormAction(control, div, function(object) {
    
                                // create project
                                self.block("Creating your Album...", function() {
    
                                    object._type = "n:email_template";
    
                                    // list the definitions on the branch
                                    OneTeam.projectBranch(actionContext, function() {
    
                                        this.createNode(object, {
                                            "rootNodeId": "root",
                                            "parentFolderPath": "/Templates/Email",
                                            "associationType": "a:child"
                                        }).then(function() {
    
                                            self.unblock(function() {
                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
    
                        });
    
                        renderCallback(function() {
    
                            // TODO: anything?
    
                        });
                    };
    
                    OneTeam.formCreate($(div).find(".form"), c);
    
                });
            }
    
        }));
    });
    
    