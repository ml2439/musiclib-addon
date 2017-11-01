define(function (require, exports, module) {

    var Ratchet = require("ratchet/ratchet");
    var Actions = require("ratchet/actions");
    var OneTeam = require("oneteam");
    var $ = require("jquery");

    return Ratchet.Actions.register("create_album", Ratchet.AbstractUIAction.extend({

        defaultConfiguration: function () {
            var config = this.base();

            config.title = "Create Album";
            config.iconClass = "glyphicon glyphicon-pencil";

            return config;
        },

        execute: function (config, actionContext, callback) {
            this.doAction(actionContext, function (err, result) {
                callback(err, result);
            });
        },

        doAction: function (actionContext, callback) {
            var self = this;

            // modal dialog
            Ratchet.fadeModal({
                "title": "Create an Album",
                "cancel": true
            }, function (div, renderCallback) {

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
                            "title": {
                                "type": "string",
                                "required": true
                            },
                            "albumlist": {
                                "type": "string"
                            }
                        }
                    },
                    "options": {
                        "fields": {
                            "title": {
                                "type": "text",
                                "label": "Title"
                            },
                            "albumlist": {
                                "type": "select",
                                "label": "Choose From",
                                "dataSource": function (callback) {
                                    if(this.parent.children.length === 0) {
                                        return callback([]);
                                    }
                                    var searchTitle = this.parent.childrenByPropertyId['title'].getValue();

                                    $.ajax({
                                        url: `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${searchTitle}&api_key=8a3ce4ba56411d1474cfb9fa9f335752&format=json`,
                                        async: false,
                                        dataType: 'json'
                                    })
                                        .done(function (data) {
                                            resultAlbums = data.results.albummatches.album.map(function (a) {
                                                return {
                                                    "value": a.name,
                                                    "text": a.name
                                                }
                                            });
                                            callback(resultAlbums);
                                        })
                                        .fail(function () {
                                            console.log("error");
                                        })
                                        .always(function () {
                                            console.log("complete");
                                        });
                                }
                            }
                        }
                    }
                };

                c.postRender = function (control) {

                    // refresh albumlist on change
                    control.childrenByPropertyId['title'].on('change', function () {
                        control.childrenByPropertyId['albumlist'].refresh();
                    })

                    // refresh albumlist on keyup
                    // control.childrenByPropertyId['title'].on('keyup', function () {
                    //     control.childrenByPropertyId['albumlist'].refresh();
                    // })
                    
                    // create button
                    $(div).find('.create').click(function () {

                        OneTeam.processFormAction(control, div, function (object) {

                            // create project
                            self.block("Creating your Album...", function () {

                                object._type = "n:email_template";

                                // list the definitions on the branch
                                OneTeam.projectBranch(actionContext, function () {

                                    this.createNode(object, {
                                        "rootNodeId": "root",
                                        "parentFolderPath": "/Templates/Email",
                                        "associationType": "a:child"
                                    }).then(function () {

                                        self.unblock(function () {
                                            callback();
                                        });
                                    });
                                });
                            });
                        });

                    });

                    renderCallback(function () {

                        // TODO: anything?

                    });
                };

                OneTeam.formCreate($(div).find(".form"), c);

            });
        }

    }));
});

