'use strict';
/**
 * PlainBuffer 测试文件
 */

const PlainBuffer = require('../lib/PlainBuffer');
const should = require('should');

describe('#PlainBuffer', function() {
    describe('#buildPrimayKey', function() {
        it('Test: pk, pkValue', function () {
            let result  = PlainBuffer.buildPrimayKey('pk', 'pkValue');
            should.equal(result.toString('hex'), '7500000001030402000000706b050c0000000307000000706b56616c75650a8509f7');
        });
    });
});