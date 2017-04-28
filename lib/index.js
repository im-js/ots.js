'use strict';
/**
 * OTS 服务类
 * API 描述: https://help.aliyun.com/document_detail/27304.html
 * 错误码：https://help.aliyun.com/document_detail/27300.html
 */
const _ = require('lodash');
const path = require('path');
const protobuf = require('protobufjs');
const PlainBuffer = require('./PlainBuffer');
const Connection = require('./Connection');
const CONST_VALUE = require('./PlainBuffer/CONST_VALUE');
const filterMaker = require('./filterMaker');
const {
    PB_SYSTEM
} = CONST_VALUE;

class OTS {
    /**
     * 初始化
     * @param {Object} options
     * @param {String} options.endPoint - 实例地址
     * @param {String} options.accessId - 令牌 ID
     * @param {String} options.accessKey - 令牌秘钥
     * @param {String} options.instanceName - 实例名称
     */
    constructor(options) {
        let {
            endPoint,
            accessId,
            accessKey,
            instanceName
        } = options;

        // 初始化连接，http 是否可以有连接池
        this.connection = new Connection(endPoint, accessId, accessKey, instanceName);

        // 加载 protobuf 定义
        const protoRoot = protobuf.loadSync([
            path.join(__dirname, './proto/table_store.proto')
        ]);

        this.PCORE = protoRoot.lookup('com.alicloud.openservices.tablestore.core.protocol');

        // 添加常量定义
        this.INF_MAX = PB_SYSTEM.OTS_INF_MAX;
        this.INF_MIN = PB_SYSTEM.OTS_INF_MIN;
        this.AUTO_INCREMENT = PB_SYSTEM.OTS_AUTO_INCREMENT;
    }

    PutRow(tableName, pk, attr, options, callback) {
        const operation = 'PutRow';
        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            row: PlainBuffer.buildPrimayKey(pk, attr),
            condition: {
                rowExistence: 'IGNORE'
            },
            returnContent: {
                returnType: 'RT_NONE'
            }
        }, options));

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    UpdateRow(tableName, pk, attr, options, callback) {
        const operation = 'UpdateRow';
        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            rowChange: PlainBuffer.buildPrimayKey(pk, attr),
            condition: {
                rowExistence: 'EXPECT_EXIST'
            }
        }, options));

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    GetRow(tableName, pk, options, callback) {
        const operation = 'GetRow';
        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            primaryKey: PlainBuffer.buildPrimayKey(pk),
            maxVersions: 1
        }, options));

        return this._makeRequestPromiseOrNot(operation, req, function(result) {
            // row 值解析
            result.rowDecode = PlainBuffer.decode(result.row);
            return result;
        }, callback);
    }

    DeleteRow(tableName, pk, options, callback) {
        const operation = 'DeleteRow';
        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            primaryKey: PlainBuffer.buildPrimayKey(pk, null, true),
            condition: {
                rowExistence: 'EXPECT_EXIST'
            }
        }, options));

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    /**
     * options.direction 有坑如下，用户无需自行设置，由 SDK 进行判断更新
     * 若为正序，则 inclusive_start_primary 应小于 exclusive_end_primary，响应中各行按照主键由小到大的顺序进行排列；
     * 若为逆序，则 inclusive_start_primary 应大于 exclusive_end_primary，响应中各行按照主键由大到小的顺序进行排列；
     */
    GetRange(tableName, options, callback) {
        const operation = 'GetRange';
        // 数据转向
        let direction = 'FORWARD';
        for(let key in options.inclusiveStartPrimaryKey) {
            if(!options.inclusiveStartPrimaryKey.hasOwnProperty(key)) {
                continue;
            }

            let startValue = options.inclusiveStartPrimaryKey[key];
            let endValue = options.exclusiveEndPrimaryKey[key];
            // 特殊值比较
            if(startValue === PB_SYSTEM.OTS_INF_MAX || endValue === PB_SYSTEM.OTS_INF_MIN) {
                direction = 'BACKWARD';
                break;
            }

            if(startValue === PB_SYSTEM.OTS_INF_MIN || endValue === PB_SYSTEM.OTS_INF_MAX) {
                direction = 'FORWARD';
                break;
            }

            // 普通值比较
            if(startValue > endValue) {
                direction = 'BACKWARD';
                break;
            } else if(startValue < endValue) {
                break;
            }
        }

        // primaryKey 处理
        options.inclusiveStartPrimaryKey = PlainBuffer.buildPrimayKey(options.inclusiveStartPrimaryKey);
        options.exclusiveEndPrimaryKey = PlainBuffer.buildPrimayKey(options.exclusiveEndPrimaryKey);

        // filter 处理
        if(options.filter) {
            options.filter = filterMaker.makeRaw(options.filter);
        }

        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            direction,
            maxVersions: 1
        }, options));

        return this._makeRequestPromiseOrNot(operation, req, function(result) {
            result.rowsDecode = PlainBuffer.decode(result.rows, true);
            result.nextStartPrimaryKeyDecode = PlainBuffer.decode(result.nextStartPrimaryKey);
            return result;
        }, callback);
    }

    BatchGetRow(optisons, callback) {
        const operation = 'BatchGetRow';
        let  tablesNew = [];
        // 循环解析 PlainBuffer
        for(let i = 0; i < optisons.tables.length; i++) {
            let condition = optisons.tables[i];
            let primaryKeys = condition.primaryKey, primaryKeysBuf = [];
            for(let j = 0; j < primaryKeys.length; j++) {
                primaryKeysBuf[j] = PlainBuffer.buildPrimayKey(primaryKeys[j]);
            }
            tablesNew[i] = _.defaults({
                primaryKey: primaryKeysBuf
            }, condition);
        }

        let req = this.PCORE[`${operation}Request`].fromObject({
            tables: tablesNew
        });

        return this._makeRequestPromiseOrNot(operation, req, function(result) {
            let tables = result.tables;
            for(let i = 0; i < tables.length; i++) {
                let rows = tables[i].rows;
                for(let j = 0; j < rows.length; j++) {
                    rows[j].rowDecode = PlainBuffer.decode(rows[j].row);
                }
            }
            return result;
        }, callback);
    }

    BatchWriteRow(optisons, callback) {
        const operation = 'BatchWriteRow';
        let  tablesNew = [];
        // 循环解析 PlainBuffer
        for(let i = 0; i < optisons.tables.length; i++) {
            let condition = optisons.tables[i];
            let rows = condition.rows ,rowsNew = [];
            for(let j = 0; j < rows.length; j++) {
                let rowChange = rows[j].rowChange;
                rowsNew.push(_.defaults({
                    rowChange: PlainBuffer.buildPrimayKey(
                        rowChange.pk,
                        rowChange.attr,
                        rows[j].type === 'DELETE'
                    )
                }, rows[j]));
            }
            tablesNew[i] = _.defaults({
                rows: rowsNew,
            }, condition);
        }

        let req = this.PCORE[`${operation}Request`].fromObject({
            tables: tablesNew
        });

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    CreateTable(optisons, callback) {
        const operation = 'CreateTable';
        let req = this.PCORE[`${operation}Request`].fromObject(optisons);

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    ListTable(callback) {
        const operation = 'ListTable';
        let req = this.PCORE[`${operation}Request`].fromObject({});

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    DeleteTable(tableName, callback) {
        const operation = 'DeleteTable';
        let req = this.PCORE[`${operation}Request`].fromObject({
            tableName
        });

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    UpdateTable(tableName, options, callback) {
        const operation = 'UpdateTable';
        let req = this.PCORE[`${operation}Request`].fromObject(_.assign(options, {
            tableName
        }));

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }

    DescribeTable(tableName, callback) {
        const operation = 'DescribeTable';
        let req = this.PCORE[`${operation}Request`].fromObject({
            tableName
        });

        return this._makeRequestPromiseOrNot(operation, req, null, callback);
    }
    
    _makeRequestPromiseOrNot(...args) {
        let callback = args.pop();
        if(callback) {
            return this._makeRequest(...args, callback);
        } else {
            return new Promise((resolve, reject) => {
                this._makeRequest(...args, (err, result) => {
                    if(err) {
                        return reject(err);
                    }

                    resolve(result);
                });
            });
        }
    }

    _makeRequest(operation, req, processor, callback) {
        let reqBuf = this.PCORE[`${operation}Request`].encode(req).finish();

        this.connection.req(operation, reqBuf, (err, resp, body) => {
            if(err) {
                return callback(err);
            }

            if (resp.statusCode !== 200) {
                return callback(this.PCORE.Error.decode(body));
            }

            // 结果预处理
            let result = this.PCORE[`${operation}Response`].decode(body);
            if(processor) {
                result = processor(result);
            }

            callback(null, result);
        });
    }
}

OTS.INF_MAX = PB_SYSTEM.OTS_INF_MAX;
OTS.INF_MIN = PB_SYSTEM.OTS_INF_MIN;
OTS.AUTO_INCREMENT = PB_SYSTEM.OTS_AUTO_INCREMENT;

module.exports = OTS;