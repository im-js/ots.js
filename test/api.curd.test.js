'use strict';
/**
 * API CURD 测试
 */
const should = require('should');
const OTS = require('../');
const ots = require('./sample/ots');

describe('#apiCurd', function () {
    
    before(function(done) {
        ots.CreateTable({
            tableMeta: {
                tableName: 'sampleTable',
                primaryKey: [{
                    name: 'pk',
                    type: 'STRING'
                }]
            },
            reservedThroughput: {
                capacityUnit: {
                    read: 0,
                    write: 0
                }
            },
            tableOptions: {
                timeToLive: -1,
                maxVersions: 1
            }
        }, function(err) {
            should.ifError(err);
            // 需要有 1.5 秒延时，因为表创建后，并不能立即生效
            setTimeout(function () {
                done();
            }, 3000);
        });
    });

    after(function(done) {
        ots.DeleteTable('sampleTable', function(err) {
            should.ifError(err);
            done();
        });
    });

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

    describe('#BatchGetRow', function() {
        it('table: smapleTalbe primayKey: pk:pkValue, pk:testKey', function(done) {
            ots.BatchGetRow({
                tables: [
                    {
                        tableName: 'sampleTable',
                        maxVersions: 1,
                        primaryKey: [
                            {
                                pk: 'pkValue'
                            },
                            {
                                pk: 'testKey'
                            }
                        ]
                    }
                ]
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.tables[0].rows[0].rowDecode.pk.pk, 'pkValue');
                should.equal(result.tables[0].rows[1].rowDecode.pk.pk, 'testKey');
                done();
            });
        });
    });

    describe('#BatchWriteRow', function() {
        it('mix PUT, UPDATE, DELETE operation', function(done) {
            ots.BatchWriteRow({
                tables: [
                    {
                        tableName: 'sampleTable',
                        rows: [
                            {
                                type: 'PUT',
                                rowChange: {
                                    pk: {
                                        pk: 'batchRow'
                                    },
                                    attr: {
                                        way: 'batchWriteRow'
                                    }
                                },
                                condition: {
                                    rowExistence: 'IGNORE'
                                }
                            },
                            {
                                type: 'UPDATE',
                                rowChange: {
                                    pk: {
                                        pk: 'pkValue'
                                    },
                                    attr: {
                                        name: 'Gina'
                                    }
                                },
                                condition: {
                                    rowExistence: 'EXPECT_EXIST'
                                }
                            },
                            {
                                type: 'DELETE',
                                rowChange: {
                                    pk: {
                                        pk: 'testKey',
                                    }
                                },
                                condition: {
                                    rowExistence: 'EXPECT_EXIST'
                                }
                            }
                        ]
                    }
                ]
            }, function(err, result) {
                should.ifError(err);
                let {
                    tables: [
                        {
                            rows: [
                                row0,
                                row1,
                                row2
                            ]
                        }
                    ]
                } = result;
                should.strictEqual(row0.isOk, true);
                should.strictEqual(row1.isOk, true);
                should.strictEqual(row2.isOk, true);
                done();
            });
        });
    });

    describe('#DeleteRow', function() {
        it('DeleteRow Row identify by pk with pkValue', function(done) {
            ots.DeleteRow('sampleTable', {
                pk: 'batchRow'
            }, null, function(err, result) {
                should.ifError(err);
                should.equal(result.consumed.capacityUnit.write, 1, 'capacityUnit.write shoud be 1');
                should.equal(result.consumed.capacityUnit.read, 1, 'capacityUnit.read shoud be 1');
                done();
            });
        });
    });
});