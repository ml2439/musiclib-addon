define(function (require, exports, module) {

    var Ratchet = require("ratchet/ratchet");
    var Actions = require("ratchet/actions");
    var OneTeam = require("oneteam");
    var MusicLib = require("./musiclib.js");
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
                            "albumname": {
                                "type": "string",
                                "required": true
                            },
                            "albumlist": {
                                "type": "string"
                            }
                        },
                        "dependencies": {
                            "albumlist": ["albumname"]
                        }
                    },
                    "options": {
                        "fields": {
                            "albumname": {
                                "type": "text",
                                "label": "Find Album by Name"
                            },
                            "albumlist": {
                                "type": "select",
                                "label": "Choose From",
                                "dataSource": MusicLib.loadAlbums
                            }
                        }
                    }
                };

                c.postRender = function (control) {

                    var albumArray, albumUrl;

                    // refresh select list on albumname change
                    control.childrenByPropertyId['albumname'].on('change', function () {
                        control.childrenByPropertyId['albumlist'].refresh();
                    })

                    // refresh albumname on select list change 
                    control.childrenByPropertyId['albumlist'].on('change', function () {
                        albumUrl = control.childrenByPropertyId['albumlist'].getValue();
                        albumArray = control.childrenByPropertyId['albumlist'].apiResults.filter(a => a.url === albumUrl);
                        control.childrenByPropertyId['albumname'].setValue(albumArray[0].name);
                    })

                    // create button
                    $(div).find('.create').click(function () {

                        var branch = actionContext.observable("branch").get();

                        MusicLib.assureAlbum(branch, albumUrl, albumArray[0].name, albumArray[0].image, function (err, album) {
                            MusicLib.assureArtist(branch, albumArray[0].artist, function (err, artist) {
                                album.createdBy = {
                                    "ref": artist.ref()
                                };
                                album.update().then(function () {
                                    $(div).modal("hide");
                                    callback();
                                });
                            })
                        })
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

