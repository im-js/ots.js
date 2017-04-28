'use strict';
/**
 * 自增主键测试
 */
const should = require('should');
const ots = require('./sample/ots');

describe('#autoIncrementPK', function() {
    const testTable = `autoIncrementPk_${process.version.replace(/\./g, '_')}`;
    before(function(done) {
        ots.CreateTable({
            tableMeta: {
                tableName: testTable,
                primaryKey: [
                    {
                        name: 'pk',
                        type: 'STRING'
                    },
                    {
                        name: 'pkIncr',
                        type: 'INTEGER',
                        option: 'AUTO_INCREMENT'
                    },
                    {
                        name: 'other',
                        type: 'STRING'
                    }
                ]
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
            // 需要有 2 秒延时，因为表创建后，并不能立即生效
            setTimeout(function () {
                done();
            }, 2e3);
        });
    });

    after(function(done) {
        ots.DeleteTable(testTable, function(err) {
            should.ifError(err);
            done();
        });
    });

    describe('#Increment', function () {
        it('PutRow 1', function(done) {
            ots.PutRow(testTable, {
                pk: 'autoIncr',
                pkIncr: ots.AUTO_INCREMENT,
                other: 'other'
            }, null, null, function(err) {
                should.ifError(err);
                done();
            });
        });
        
        it('PutRow 2', function(done) {
            ots.PutRow(testTable, {
                pk: 'autoIncr',
                pkIncr: ots.AUTO_INCREMENT,
                other: 'other'
            }, null, null, function(err) {
                should.ifError(err);
                done();
            });
        });

        it('row1.autoIncr shoud lessThan row2.autoIncr', function(done) {
            ots.GetRange(testTable, {
                inclusiveStartPrimaryKey: {
                    pk: 'autoIncr',
                    pkIncr: ots.INF_MIN,
                    other: ots.INF_MIN
                },
                exclusiveEndPrimaryKey: {
                    pk: 'autoIncr',
                    pkIncr: ots.INF_MAX,
                    other: ots.INF_MAX
                }
            }, function(err, result) {
                should.ifError(err);
                let {
                    rowsDecode: [
                        row1,
                        row2
                    ]
                } = result;
                (row1.pk.pkIncr).should.be.lessThan(row2.pk.pkIncr);
                done();
            });
        });
    });
});