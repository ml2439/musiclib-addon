define(function(require, exports, module) {
    
        var html = require("text!./musiclib-reviews-list.html");
    
        var Empty = require("ratchet/dynamic/empty");
    
        var UI = require("ui");
    
        return UI.registerGadget("musiclib-reviews-list", Empty.extend({
    
            TEMPLATE: html,
    
            /**
             * Binds this gadget to the /reviews route
             */
            setup: function() {
                this.get("/projects/{projectId}/reviews", this.index);
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
    
                    // query for musiclib:review instances
                    branch.queryNodes({ "_type": "musiclib:review" }).then(function() {
    
                        // store "reviews" on the model (as a list) and then fire callback
                        model.reviews = this.asArray();
    
                        // add "imageUrl" attribute to each review
                        // add "browseUrl" attribute to each review
                        for (var i = 0; i < model.reviews.length; i++)
                        {
                            var review = model.reviews[i];
    
                            review.imageUrl256 = "/preview/repository/" + review.getRepositoryId() + "/branch/" + review.getBranchId() + "/node/" + review.getId() + "/default?size=256&name=preview256&force=true";
                            review.imageUrl128 = "/preview/repository/" + review.getRepositoryId() + "/branch/" + review.getBranchId() + "/node/" + review.getId() + "/default?size=128&name=preview128&force=true";
                            review.browseUrl = "/#/projects/" + project._doc + "/documents/" + review._doc;
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
    
                        var reviewIndex = $(this).attr("data-media-index");
                        var review = model.reviews[reviewIndex];
    
                        UI.showPopupModal({
                            "title": "Viewing: " + review.title,
                            "body": "<div style='text-align:center'><img src='" + review.imageUrl256 + "'></div>"
                        });
                    });
    
                    callback();
                });
            }
    
        }));
    
    });