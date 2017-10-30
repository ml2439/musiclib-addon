define(function(require, exports, module) {
    
        var html = require("text!./musiclib-artists-list.html");
    
        var Empty = require("ratchet/dynamic/empty");
    
        var UI = require("ui");
    
        return UI.registerGadget("musiclib-artists-list", Empty.extend({
    
            TEMPLATE: html,
    
            /**
             * Binds this gadget to the /artists route
             */
            setup: function() {
                this.get("/projects/{projectId}/artists", this.index);
            },
    
            /**
             * Puts variables into the model for rendering within our template.
             * Once we've finished setting up the model, we must fire callback().
             *
             * @param el
             * @param model
             * @param callback
             */
            prepareModel: function(el, model, callback) {
    
                // get the current project
                var project = this.observable("project").get();
    
                // the current branch
                var branch = this.observable("branch").get();
    
                // call into base method and then set up the model
                this.base(el, model, function() {
    
                    // query for musiclib:artist instances
                    branch.queryNodes({ "_type": "musiclib:artist" }).then(function() {
    
                        // store "artists" on the model (as a list) and then fire callback
                        model.artists = this.asArray();
    
                        // add "imageUrl" attribute to each artist
                        // add "browseUrl" attribute to each artist
                        for (var i = 0; i < model.artists.length; i++)
                        {
                            var artist = model.artists[i];
    
                            artist.imageUrl256 = "/preview/repository/" + artist.getRepositoryId() + "/branch/" + artist.getBranchId() + "/node/" + artist.getId() + "/default?size=256&name=preview256&force=true";
                            artist.imageUrl128 = "/preview/repository/" + artist.getRepositoryId() + "/branch/" + artist.getBranchId() + "/node/" + artist.getId() + "/default?size=128&name=preview128&force=true";
                            artist.browseUrl = "/#/projects/" + project._doc + "/documents/" + artist._doc;
                        }
    
                        callback();
                    });
                });
            },
    
            /**
             * This method gets called before the rendered DOM element is injected into the page.
             *
             * @param el the dom element
             * @param model the model used to render the template
             * @param callback
             */
            /*
            beforeSwap: function(el, model, callback)
            {
                this.base(el, model, function() {
                    callback();
                });
            },
            */
    
            /**
             * This method gets called after the rendered DOM element has been injected into the page.
             *
             * @param el the new dom element (in page)
             * @param model the model used to render the template
             * @param originalContext the dispatch context used to inject
             * @param callback
             */
            afterSwap: function(el, model, originalContext, callback)
            {
                this.base(el, model, originalContext, function() {
    
                    // find all .media-popups and attach to a lightbox
                    $(el).find(".media-popup").click(function(e) {
    
                        e.preventDefault();
    
                        var artistIndex = $(this).attr("data-media-index");
                        var artist = model.artists[artistIndex];
    
                        UI.showPopupModal({
                            "title": "Viewing: " + artist.title,
                            "body": "<div style='text-align:center'><img src='" + artist.imageUrl256 + "'></div>"
                        });
                    });
    
                    callback();
                });
            }
    
        }));
    
    });