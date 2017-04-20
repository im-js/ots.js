'use strict';
/**
 * API 测试
 */
const should = require('should');
const OTS = require('../');
let ots = new OTS({
    endPoint: 'http://pl-msgc.cn-hangzhou.ots.aliyuncs.com',
    accessId: 'LTAI0Ak0Ypf0NE1Z',
    accessKey: 'Ds8GICLumeuwEL35nuRZtAkMNpmGxS',
    instanceName: 'pl-msgc'
});

describe('#api', function () {
    describe('#PutRow', function() {
        it('Put Col0, Col1 With returnType RT_NONE', function(done) {
            ots.PutRow('sampleTable', {
                'pk': 'pkValue'
            }, {
                'Col0': 19,
                'Col1': 'test value 中文值2'
            }, {
                returnContent: {
                    returnType: 'RT_NONE'
                }
            }, function (err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                done();
            });
        });
    });

    describe('#GetRow', function() {
        it('Get Row identify by pk with pkValue', function(done) {
            ots.GetRow('sampleTable',{
                'pk': 'pkValue'
            }, {
                maxVersions: 1
            }, function (err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.read, 1, 'capacityUnit.read shoud be 1');
                should.deepEqual(result.rowDecode, {
                    pk: { pk: 'pkValue' },
                    attr: { Col0: 19, Col1: 'test value 中文值2' }
                });
                done();
            });
        });
    });
});