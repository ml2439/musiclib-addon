define(function (require, exports, module) {
    
    // called by alpaca; 'this' is alpaca control
    exports.loadAlbums = function (callback) {

        if (this.parent.children.length === 0) {
            return callback([]);
        }

        var findName = this.parent.childrenByPropertyId['albumname'].getValue();

        // alpaca control instance
        var me = this;

        $.ajax({
            url: `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${findName}&api_key=8a3ce4ba56411d1474cfb9fa9f335752&format=json`,
            async: false,
            dataType: 'json'
        })
            .done(function (data) {
                me.apiResults = data.results.albummatches.album;
                resultAlbums = data.results.albummatches.album.map(function (a) {
                    return {
                        "value": a.url,
                        "text": a.name + ' (by ' + a.artist + ')'
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
    };

});

