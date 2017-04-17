'use strict';

const cryptoLib = require('crypto');

function hmac(key, string) {
    return cryptoLib.createHmac('sha1', key).update(string).digest('base64');
}

function md5(data) {
    return cryptoLib.createHash('md5').update(data).digest('base64');
}

module.exports = {
    hmac: hmac,
    md5: md5
};