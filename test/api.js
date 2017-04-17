'use strict';
/**
 * API 测试
 */
const OTS = require('../');
let ots = new OTS({
    endPoint: 'http://pl-msgc.cn-hangzhou.ots.aliyuncs.com',
    accessId: '',
    accessKey: '',
    instanceName: 'pl-msgc'
});

describe('#api', function () {
    describe('#GetRow', function() {
        it('Test: pk, pkValue', function(done) {
            ots.GetRow();
            done();
        });
    });
});