'use strict';
/**
 * API 测试
 */
const OTS = require('../');
let ots = new OTS({
    endPoint: 'http://pl-msgc.cn-hangzhou.ots.aliyuncs.com',
    accessId: 'LTAI0Ak0Ypf0NE1Z',
    accessKey: 'Ds8GICLumeuwEL35nuRZtAkMNpmGxS',
    instanceName: 'pl-msgc'
});

describe('#api', function () {
    describe('#PutRow', function() {
        it('Test: ', function(done) {
            ots.PutRow('sampleTable', {
                'pk': 'pkValue'
            }, {
                'Col0': 19,
                'Col1': 'test'
            });
        });
    });

    /**
Table 值
0a:0b:73:61:6d:70:6c:65:54:61:62:6c:65:12:69:

PK 值
75:00:00:00:01:
03:04:02:00:00:00:70:6b:
05:0c:00:00:00:03:07:00:00:00:70:6b:56:61:6c:75:65:0a:85:

ATTR 值
02:
03:04:04:00:00:00:43:6f:6c:30:05:09:00:00:00:00:13:00:00:00:
00:00:00:00:
07:46:ff:90:81:5b:01:00:00:

CELL checksum
0a:10:

03:04:04:00:00:00:43:6f:6c:31:05:09:00:00:00:03:04:00:00:00:74:65:73:74

:07:46:ff:90:81:5b:01:00:00:

CELL checksum
0a:6b

ROW checksum
:09:bf:


1a:02:08:00:22:02:08:00

         */

    // describe('#GetRow', function() {
    //     it('Test: pk, pkValue', function(done) {
    //         ots.GetRow('sampleTable', [
    //             {
    //                 name: 'pk',
    //                 value: 'pkValue'
    //             }
    //         ], {
    //             maxVersions: 1
    //         });
    //         done();
    //     });
    // });
});