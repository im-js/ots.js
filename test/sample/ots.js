'use strict';
const OTS = require('../../');

let ots = new OTS({
    endPoint: process.env.otsEndPoint,
    accessId: process.env.otsAccessId,
    accessKey: process.env.otsAccessKey,
    instanceName: process.env.otsInstanceName
});

module.exports = ots;