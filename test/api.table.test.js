'use strict';
/**
 * 数据库表操作
 */
const should = require('should');
const ots = require('./sample/ots');

describe('#apiTable', function () {
    const testTable = `table_${process.version.replace(/\./g, '_')}`;
    describe('#CreateTable', function() {
        it('table1 with pk1:STRING, pk2:INTEGER, pk3:BINARY', function(done) {
            ots.CreateTable({
                tableMeta: {
                    tableName: testTable,
                    primaryKey: [
                        {
                            name: 'pk1',
                            type: 'STRING'
                        },
                        {
                            name: 'pk2',
                            type: 'INTEGER',
                            option: 'AUTO_INCREMENT'
                        },
                        {
                            name: 'pk3',
                            type: 'BINARY'
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
                done();
            });
        });
    });

    describe('#ListTable', function() {
        it('tableNames Length should >=1', function(done) {
            ots.ListTable(function (err, result) {
                should.ifError(err);
                (result.tableNames.length).should.be.aboveOrEqual(1);
                done();
            });
        });
    });

    describe('#UpdateTable', function() {
        it('update maxVersion=2', function (done) {
            ots.UpdateTable(testTable, {
                tableOptions: {
                    maxVersions: 2
                }
            }, function(err, result) {
                should.ifError(err);
                should.equal(result.tableOptions.maxVersions, 2);
                done();
            });
        });
    });

    describe('#DescribeTable', function() {
        it('describe table1', function(done) {
            ots.DescribeTable(testTable, function(err, result) {
                should.ifError(err);
                should.equal(result.tableMeta.tableName, testTable);
                done();
            });
        });
    });

    describe('#DeleteTable', function() {
        it('delete table1', function (done) {
            ots.DeleteTable(testTable, function(err) {
                should.ifError(err);
                done();
            });
        });
    });
});