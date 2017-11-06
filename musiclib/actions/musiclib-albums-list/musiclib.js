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
                console.log("Cannot find " + albumName);
            })
            .always(function () {
                console.log("Complete finding album.");
            });
    };

    var fetchArtist = function (name, callback) {   // who uses fetchArtist defines callback

        var artistName = name.split(' ').join('+');

        $.ajax({
            url: `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=8a3ce4ba56411d1474cfb9fa9f335752&format=json`,
            async: false,
            dataType: 'json'
        })
            .done(function (data) {
                // if succeed, resultArtist is an array of one element which is the artist of interest.
                resultArtist = data.results.artistmatches.artist.filter(a => a.name === name);
                callback(null, resultArtist[0]);
            })
            .fail(function () {
                console.log("Cannot find " + name);
            })
            .always(function () {
                console.log("Complete finding artist.");
            });

    }

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

            fetchArtist(name, function (err, artistInfo) {
                createArtist(branch, artistInfo.url, name, artistInfo.listeners, callback);                
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

