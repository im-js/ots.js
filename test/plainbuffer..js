'use strict';
/**
 * PlainBuffer 测试文件
 */
const Long = require('long');
const Cell = require('../lib/PlainBuffer/type/Cell');
const PlainBuffer = require('../lib/PlainBuffer');
const should = require('should');

describe('#PlainBuffer', function() {
    describe('#buildPrimayKey', function() {
        it('input: pk, pkValue', function () {
            let result  = PlainBuffer.buildPrimayKey({
                'pk': 'pkValue'
            });
            should.equal(result.toString('hex'), '7500000001030402000000706b050c0000000307000000706b56616c75650a8509f7');
        });
    });

    describe('#long', function () {
        it('timestamp decode 46:ff:90:81:5b:01:00:00', function () {
            let buf = Buffer.from('46ff90815b010000', 'hex');
            let long = Cell.convertBufferToLong(buf);
            should.deepEqual(long.toNumber(), 1492527415110);
        });

        it('timestam encode 1492527415110', function() {
            let buf = Cell.convertLongToBuffer(Long.fromNumber(1492527415110, true));
            should.deepEqual(buf.toString('hex'), '46ff90815b010000');
        });
    });
});