const authLib = require("./auth-lib");

module.exports = {
    type: "credentials",
    users: function (username) {
        return new Promise(function (resolve) {
            // Do whatever work is needed to check username is a valid
            // user.
            const user = authLib.getUser(username);
            if (user) {
                resolve(user);
            } else {
                // Resolve with null to indicate this user does not exist
                console.error(`User '${username}' does not exist or is not in the 'wbmadmin' unix group.`);
                resolve(null);
            }
        });
    },
    authenticate: function (username, password) {
        return new Promise(function (resolve) {
            // Do whatever work is needed to validate the username/password
            // combination.
            const user = authLib.getUser(username);
            if (user) {
                // Resolve with the user object. Equivalent to having
                // called users(username);
                if (authLib.validateUserPassword(username, password)) {
                    console.log(`User '${username}' logged in successfully.`);
                    resolve(user);
                }
                else {
                    console.error(`User '${username}' failed to login: Password Hash did not match!`);
                    resolve(null);
                }
            }
            else {
                // Resolve with null to indicate the username/password pair
                // were not valid.
                console.error(`User '${username}' failed to login: User does not exist or is not in the 'wbmadmin' unix group.`);
                resolve(null);
            }
        });
    },
    default: function () {
        return new Promise(function (resolve) {
            // Resolve with the user object for the default user.
            // If no default user exists, resolve with null.
            //resolve({anonymous: true, permissions:"read"});
            resolve(null);
        });
    }
};