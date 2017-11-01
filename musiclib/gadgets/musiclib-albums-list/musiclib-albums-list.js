define(function (require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");

    return Ratchet.GadgetRegistry.register("musiclib-albums-list", DocList.extend({

        configureDefault: function () {
            this.base();

            this.config({
                "observables": {
                    "query": "musiclib-albums-list_query",
                    "sort": "musiclib-albums-list_sort",
                    "sortDirection": "musiclib-albums-list_sortDirection",
                    "searchTerm": "musiclib-albums-list_searchTerm",
                    "selectedItems": "musiclib-albums-list_selectedItems"
                }
            });
        },

        setup: function () {
            this.get("/projects/{projectId}/albums", this.index);
        },
        
        entityTypes: function () {
            return {
                "plural": "albums",
                "singular": "album"
            }
        },

        doGitanaQuery: function (context, model, searchTerm, query, pagination, callback) {
            var self = this;
//1 Only using MongoDB
            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title"]);
            }
            query._type = "musiclib:album";

            OneTeam.projectBranch(self, function () {

                this.queryNodes(query, pagination).then(function () {
                    callback(this);
                });

            });

//2 Only using ElasticSearch
            // if(!searchTerm) {
            //     searchTerm = "";
            // }

            // OneTeam.projectBranch(self, function () {

            //     this.searchNodes(searchTerm, pagination).then(function () {
            //         callback(this);
            //     });

            // });

//3 MongoDB fetch everything then ElasticSearch
            // query._type = "musiclib:album";

            // var o = {};
            // o.query = query;
            // if(searchTerm){
            //     o.search = searchTerm;
            // }
            // OneTeam.projectBranch(self, function () {

            //     this.find(o, pagination).then(function () {
            //         callback(this);
            //     });

            // });
            
            
        },

        // click and goto
        linkUri: function (row, model, context) {
            return OneTeam.linkUri(this, row) + "/editor";
        },

        iconClass: function (row) {
            return null;
        },

        // default attachment
        iconUri: function(row, model, context)
        {
            return OneTeam.iconUriForNode(row);
        },

        columnValue: function (row, item, model, context) {
            var self = this;

            var value = this.base(row, item);

            if (item.key == "titleDescription") {
                value = OneTeam.listTitleDescription(context, row, self.linkUri(row, model, context));
            }

            return value;
        }


    }));

});