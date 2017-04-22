'use strict';
/**
 * 过滤条件构造器测试
 */
const should = require('should');
const filterMaker = require('../lib/filterMaker');

describe('#filterMaker', function() {
    it('Make Filter Col0 > 21', function() {
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

        should.equal(result.toString('hex'), '0801121708031204436f6c301a0900150000000000000020012801');
    });
});