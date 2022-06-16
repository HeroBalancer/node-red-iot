const fs = require("fs");
const bcrypt = require("bcrypt");
const sha512crypt = require("sha512crypt-node");

function parseShadow(content) {
    if (typeof content !== 'string') {
        throw new Error('expected a string');
    }
    return content
        .split('\n')
        .map(mapShadowEntry)
        .filter(Boolean);
};

function mapShadowEntry(line, i) {
    if (!line || !line.length || line.charAt(0) === '#') {
        return null;
    }

    // see https://en.wikipedia.org/wiki/Passwd for field descriptions
    var fields = line.split(':');
    return {
        username: fields[0],
        password: fields[1],
    };
};

function parseGroup(content) {
    if (typeof content !== 'string') {
        throw new Error('expected a string');
    }
    return content
        .split('\n')
        .map(mapGroupEntry)
        .filter(Boolean);
};
function mapGroupEntry(line, i) {
    if (!line || !line.length || line.charAt(0) === '#') {
        return null;
    }

    // see https://en.wikipedia.org/wiki/Passwd for field descriptions
    var fields = line.split(':');
    return {
        groupname: fields[0],
        password: fields[1],
        gid: fields[2],
        users: fields[3].split(','),
    };
};

function getUsers() {
    const fGroup = fs.readFileSync("/data/auth/group", "utf8");
    const fShadow = fs.readFileSync("/data/auth/shadow", "utf8");

    const groups = parseGroup(fGroup);
    const userpws = parseShadow(fShadow).filter(function (x) {
        return x.password !== '!' && x.password.charAt(0) === '$';
    });

    const wbmadmin = groups.find(function (x) {
        return x.groupname === 'wbmadmin';
    });
    if (!wbmadmin) return [];

    return wbmadmin.users.map(function (u) {
        return ({
            ...userpws.find(function (upw) {
                return upw.username === u;
            }),
            permissions: "*"
        })
    });
}
function getUser(username) {
    const users = getUsers();
    if (!users) return null;

    return users.find(function (u) {
        return u.username === username;
    });
}
function validateUserPassword(username, password) {
    const user = getUser(username);
    if (!user) return false;

    const passwordHash = user.password;
    const hashSplit = passwordHash.split('$');
    const algoritm = hashSplit[1];
    const salt = hashSplit[2];
    if (algoritm === '6') {
        if (sha512crypt.sha512crypt(password, salt) === passwordHash)
            return true;
        else
            return false;
    }
    else {
        return bcrypt.compareSync(password, passwordHash);
    }
}

module.exports = {
    getUsers,
    getUser,
    validateUserPassword
};