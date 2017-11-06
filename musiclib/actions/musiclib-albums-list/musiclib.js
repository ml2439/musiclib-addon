define(function (require, exports, module) {

    // called by alpaca; 'this' is alpaca control
    var loadAlbums = function (callback) {

        if (this.parent.children.length === 0) {
            return callback([]);
        }

        var albumName = this.parent.childrenByPropertyId['albumname'].getValue();

        // alpaca control instance
        var me = this;

        $.ajax({
            url: `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${albumName}&api_key=8a3ce4ba56411d1474cfb9fa9f335752&format=json`,
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

    // var fetchArtist = function (name) {

    //     var artistName = name.split(' ').join('+');

    //     $.ajax({
    //         url: `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=8a3ce4ba56411d1474cfb9fa9f335752&format=json`,
    //         async: false,
    //         dataType: 'json'
    //     })
    //         .done(function (data) {
    //             // if succeed, resultArtist is an array of one element which is the artist of interest.
    //             resultArtist = data.results.artistmatches.artist.filter(a => a.url === `https://www.last.fm/music/${artistName}`);
    //             return resultArtist[0];
    //         })
    //         .fail(function () {
    //             console.log("error");
    //         })
    //         .always(function () {
    //             console.log("complete");
    //         });

    // }

    var createAlbum = function (branch, id, title, callback) {
        Chain(branch).createNode({
            "_type": "musiclib:album",
            "id": id,
            "title": title
        }).then(function () {
            callback(null, this);
        })
    };

    var assureAlbum = function (branch, id, title, callback) {
        Chain(branch).trap(function (err) {
            // if queryNodes fails, create one
            createAlbum(branch, id, title, callback);
            return false;               // stop chaining
        }).queryNodes({
            "_type": "musiclib:album",
            "id": id
        }).keepOne().then(function () {
            callback(null, this);
        })
    };

    var createArtist = function (branch, id, name, listeners, callback) {
        Chain(branch).createNode({
            "_type": "musiclib:artist",
            "id": id,
            "title": name,
            "listeners": parseInt(listeners)
        }).then(function () {
            callback(null, this);
        })
    };

    var assureArtist = function (branch, name, callback) {
        Chain(branch).trap(function (err) {
            // if queryNodes fails, fetch artist data with its url(made out of name) and create one
            // ajax response containing artist info
            // var artistInfo = fetchArtist(name);
            $.ajax({
                url: `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${name.split(' ').join('+')}&api_key=8a3ce4ba56411d1474cfb9fa9f335752&format=json`,
                async: false,
                dataType: 'json'
            })
                .done(function (data) {
                    // if succeed, resultArtist is an array of one element which is the artist of interest.
                    resultArtist = data.results.artistmatches.artist.filter(a => a.name === name);
                    var artistInfo = resultArtist[0];
                    createArtist(branch, artistInfo.url, name, artistInfo.listeners, callback);
                })
                .fail(function () {
                    console.log("error");
                })
                .always(function () {
                    console.log("complete");
                });
    
            return false;
        }).queryNodes({
            "_type": "musiclib:artist",
            "title": name
        }).keepOne().then(function () {
            callback(null, this);
        })
    };

    exports.loadAlbums = loadAlbums;
    exports.createArtist = createArtist;
    exports.createAlbum = createAlbum;
    exports.assureArtist = assureArtist;
    exports.assureAlbum = assureAlbum;

});

