define(function(require) {

    // page: "musiclib-artists-list"
    require("./gadgets/musiclib-artists-list/musiclib-artists-list.js");
    // page: "musiclib-albums-list"
    require("./gadgets/musiclib-albums-list/musiclib-albums-list.js");
    // page: "musiclib-reviews-list"
    require("./gadgets/musiclib-reviews-list/musiclib-reviews-list.js");
    
    // action: "create_album"
    require("./actions/musiclib-albums-list/create_album.js");
    
});
