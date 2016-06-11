var firebase = require('firebase');

/**
 * The Botkit firebase driver
 *
 * @param {Object} config This must contain a `firebase_uri` property
 * @returns {{teams: {get, save, all}, channels: {get, save, all}, users: {get, save, all}}}
 */
module.exports = function(config) {

    var rootRef = firebase.initializeApp(config).database().ref(),
        teamsRef = rootRef.child('teams'),
        usersRef = rootRef.child('users'),
        channelsRef = rootRef.child('channels');

    return {
        teams: {
            get: get(teamsRef),
            save: save(teamsRef),
            all: all(teamsRef)
        },
        channels: {
            get: get(channelsRef),
            save: save(channelsRef),
            all: all(channelsRef)
        },
        users: {
            get: get(usersRef),
            save: save(usersRef),
            all: all(usersRef)
        }
    };
};

/**
 * Given a firebase ref, will return a function that will get a single value by ID
 *
 * @param {Object} firebaseRef A reference to the firebase Object
 * @returns {Function} The get function
 */
function get(firebaseRef) {
    return function(id, cb) {
        firebaseRef.child(id).once('value').then(function(snapshot) {
          cb(snapshot.val());
        });
    };
}

/**
 * Given a firebase ref, will return a function that will save an object. The object must have an id property
 *
 * @param {Object} firebaseRef A reference to the firebase Object
 * @returns {Function} The save function
 */
function save(firebaseRef) {
    return function(data, cb) {
        var firebase_update = {};
        firebase_update[data.id] = data;
        firebaseRef.update(firebase_update).then(cb);
    };
}

/**
 * Given a firebase ref, will return a function that will return all objects stored.
 *
 * @param {Object} firebaseRef A reference to the firebase Object
 * @returns {Function} The all function
 */
function all(firebaseRef) {
    return function(cb) {
        firebaseRef.once('value').then(function success(records) {
            var results = records.val();

            if (!results) {
                return cb(null, []);
            }

            var list = Object.keys(results).map(function(key) {
                return results[key];
            });

            cb(null, list);
        });
    };
}
