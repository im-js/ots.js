'use strict';
/**
 * API CURD 测试
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
    describe('#Symbol', function () {
        it('ensure INF_MAX, INF_MIN symbol Equality', function () {
            should.deepEqual(ots.INF_MAX, OTS.INF_MAX);
            should.deepEqual(ots.INF_MIN, OTS.INF_MIN);
        });
    });
    
    describe('#PutRow', function() {
        it('Put row with pk=pkvalue, attr Col0, Col1 With returnType RT_NONE', function(done) {
            ots.PutRow('sampleTable', {
                pk: 'pkValue'
            }, {
                Col0: 19,
                Col1: 'test value 中文值2'
            }, {
                returnContent: {
                    returnType: 'RT_NONE'
                }
            }, function (err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                should.equal(result.consumed.capacityUnit.read, 0, 'capacityUnit.read shoud be 0');
                done();
            });
        });

        it('Put Row with pk=testKey', function(done) {
            ots.PutRow('sampleTable', {
                pk: 'testKey'
            }, {
                Col0: 288,
                Col10: 'hello ots'
            }, null, function (err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                should.equal(result.consumed.capacityUnit.read, 0, 'capacityUnit.read shoud be 0');
                done();
            });
        });

        it('PutRow with pk=testKey2', function (done) {
            ots.PutRow('sampleTable', {
                pk: 'testKey2',
            }, {
                Col0: 290,
                Col10: 'Okaha'
            }, null, function(err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                should.equal(result.consumed.capacityUnit.read, 0, 'capacityUnit.read shoud be 0');
                done();
            });
        });
    });

    describe('#UpdateRow', function() {
        it('Update Row identify by pk with pkValue', function(done) {
            ots.UpdateRow('sampleTable', {
                pk: 'pkValue'
            }, {
                Col0: 20,
                isRead: true,
                debet: -10
            }, null, function(err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                should.equal(result.consumed.capacityUnit.read, 1, 'capacityUnit.read shoud be 1');
                done();
            });
        });
    });

    describe('#GetRow', function() {
        it('Get Row identify by pk with pkValue', function(done) {
            ots.GetRow('sampleTable',{
                pk: 'pkValue'
            }, {
                maxVersions: 1
            }, function (err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.read, 1, 'capacityUnit.read shoud be 1');
                should.deepEqual(result.rowDecode, {
                    pk: {
                        pk: 'pkValue'
                    },
                    attr: {
                        Col0: 20,
                        Col1: 'test value 中文值2',
                        isRead: true,
                        debet: -10
                    }
                });
                done();
            });
        });
    });

    describe('#GetRange', function() {
        it('GetRange with SingleColumnValueFilter Col0 > 21', function (done) {
            ots.GetRange('sampleTable', {
                inclusiveStartPrimaryKey: {
                    pk: 'a'
                },
                exclusiveEndPrimaryKey: {
                    pk: ots.INF_MAX
                },
                filter: {
                    type: 'FT_SINGLE_COLUMN_VALUE',
                    filter:  {
                        comparator: 'CT_GREATER_THAN',
                        columnName: 'Col0',
                        columnValue: 21,
                        filterIfMissing: false,
                        latestVersionOnly: true
                    }
                }
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.rowsDecode[0].pk.pk, 'testKey');
                done();
            });
        });

        it('GetRange with CompositeColumnValueFilter Col > 10 and Col10 = \'hello ots\' ', function (done) {
            ots.GetRange('sampleTable', {
                inclusiveStartPrimaryKey: {
                    pk: 'a'
                },
                exclusiveEndPrimaryKey: {
                    pk: ots.INF_MAX
                },
                filter: {
                    type: 'FT_COMPOSITE_COLUMN_VALUE',
                    filter: {
                        combinator: 'LO_AND',
                        subFilters: [
                            {
                                type: 'FT_SINGLE_COLUMN_VALUE',
                                filter:  {
                                    comparator: 'CT_GREATER_THAN',
                                    columnName: 'Col0',
                                    columnValue: 10,
                                    filterIfMissing: false,
                                    latestVersionOnly: true
                                }
                            },
                            {
                                type: 'FT_SINGLE_COLUMN_VALUE',
                                filter:  {
                                    comparator: 'CT_EQUAL',
                                    columnName: 'Col10',
                                    columnValue: 'hello ots',
                                    filterIfMissing: true,
                                    latestVersionOnly: true
                                }
                            }
                        ]
                    }
                }
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.rowsDecode.length, 1);
                should.equal(result.rowsDecode[0].pk.pk, 'testKey');
                done();
            });
        });

        it('GetRange with CompositeColumnValueFilter Col > 10 and (Col10 = \'hello ots\' or Col10 = \'Okaha\') ', function (done) {
            ots.GetRange('sampleTable', {
                inclusiveStartPrimaryKey: {
                    pk: 'a'
                },
                exclusiveEndPrimaryKey: {
                    pk: ots.INF_MAX
                },
                filter: {
                    type: 'FT_COMPOSITE_COLUMN_VALUE',
                    filter: {
                        combinator: 'LO_AND',
                        subFilters: [
                            {
                                type: 'FT_SINGLE_COLUMN_VALUE',
                                filter:  {
                                    comparator: 'CT_GREATER_THAN',
                                    columnName: 'Col0',
                                    columnValue: 10,
                                    filterIfMissing: false,
                                    latestVersionOnly: true
                                }
                            },
                            {
                                type: 'FT_COMPOSITE_COLUMN_VALUE',
                                filter:  {
                                    combinator: 'LO_OR',
                                    subFilters: [
                                        {
                                            type:'FT_SINGLE_COLUMN_VALUE',
                                            filter: {
                                                comparator: 'CT_EQUAL',
                                                columnName: 'Col10',
                                                columnValue: 'hello ots',
                                                filterIfMissing: true,
                                                latestVersionOnly: true
                                            }
                                        },
                                        {
                                            type:'FT_SINGLE_COLUMN_VALUE',
                                            filter: {
                                                comparator: 'CT_EQUAL',
                                                columnName: 'Col10',
                                                columnValue: 'Okaha',
                                                filterIfMissing: true,
                                                latestVersionOnly: true
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.rowsDecode.length, 2);
                should.equal(result.rowsDecode[0].pk.pk, 'testKey');
                should.equal(result.rowsDecode[1].pk.pk, 'testKey2');
                done();
            });
        });

        it('GetRange with ColumnPaginationFilter offset 1 limit 2', function(done) {
            ots.GetRange('sampleTable', {
                inclusiveStartPrimaryKey: {
                    pk: 'a'
                },
                exclusiveEndPrimaryKey: {
                    pk: ots.INF_MAX
                },
                filter: {
                    type: 'FT_COLUMN_PAGINATION',
                    filter:  {
                        offset: 1,
                        limit: 2
                    }
                }
            }, function(err, result) {
                let {rowsDecode: [
                    row0,
                    row1,
                    row2
                ]} = result;
                should.ifError(err);
                should.equal(Object.keys(row0.attr).length, 2);
                should.equal(Object.keys(row1.attr).length, 1);
                should.equal(Object.keys(row2.attr).length, 1);
                done();
            });
        });

        it('GetRange order z->a', function(done) {
            ots.GetRange('sampleTable', {
                inclusiveStartPrimaryKey: {
                    pk: 'z'
                },
                exclusiveEndPrimaryKey: {
                    pk: 'a'
                }
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.rowsDecode[0].pk.pk, 'testKey2');
                should.equal(result.rowsDecode[1].pk.pk, 'testKey');
                should.equal(result.rowsDecode[2].pk.pk, 'pkValue');
                done();
            });
        });

        it('GetRange INF_MIN->INF_MAX', function (done) {
            ots.GetRange('sampleTable', {
                inclusiveStartPrimaryKey: {
                    pk: ots.INF_MIN
                },
                exclusiveEndPrimaryKey: {
                    pk: ots.INF_MAX
                }
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.rowsDecode[0].pk.pk, 'pkValue');
                should.equal(result.rowsDecode[1].pk.pk, 'testKey');
                done();
            });
        });
    });

    describe('#DeleteRow', function() {
        it('DeleteRow Row identify by pk with pkValue', function(done) {
            ots.DeleteRow('sampleTable', {
                pk: 'pkValue'
            }, null, function(err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                should.equal(result.consumed.capacityUnit.read, 1, 'capacityUnit.read shoud be 1');
                done();
            });
        });
    });
});