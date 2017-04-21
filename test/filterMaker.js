'use strict';
/**
 * 过滤条件构造器测试
 */

const filterMaker = require('../lib/filterMaker');

describe('#filterMaker', function() {
    it('Make', function() {
        let result = filterMaker.makeRaw({
            type: 'FT_SINGLE_COLUMN_VALUE',
            filter:  {
                comparator: 'CT_GREATER_THAN',
                columnName: 'Col0',
                columnValue: 21,
                filterIfMissing: true,
                latestVersionOnly: true
            }
        });
/**
0a:0b:73:61:6d:70:6c:65:54:61:62:6c:65:12:22:75:00:00:00:01:03:04:02:00:00:00:70:6b:05:0c:00:00:00:03:07:00:00:00:70:6b:56:61:6c:75:65:0a:85:09:f7

28:01:3a:1b:08:01:12:17:

// byte
08:03:12:04:43:6f:6c:30:1a:09:00:15:00:00:00:00:00:00:00:20:01:28:01
08:03:12:04:43:6f:6c:30:1a:09:00:15:00:00:00:00:00:00:00:20:01:28:01

08:01:12:17:08:03:12:04:43:6f:6c:30:1a:09:00:15:00:00:00:00:00:00:00:20:01:28:01
 */
    });
});