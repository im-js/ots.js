'use strict';
/**
 * OTS 服务类
 * API 描述: https://help.aliyun.com/document_detail/27304.html
 * 错误码：https://help.aliyun.com/document_detail/27300.html
 */
const path = require('path');
const protobuf = require('protobufjs');
const PlainBuffer = require('./PlainBuffer');
const Connection = require('./Connection');

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
            path.join(__dirname, './proto/table_store.proto'),
            path.join(__dirname, './proto/table_store_filter.proto')
        ]);
        this.PCORE = protoRoot.lookup('com.alicloud.openservices.tablestore.core.protocol');
    }

    GetRow(tableName, pk, options, callback = function() {}) {
        const operation = 'GetRow';
        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            primaryKey: PlainBuffer.buildPrimayKey(pk)
        }, options));

        this._makeRequest(operation, req, function(err, body) {
            if (err) {
                return callback(err);
            }
            // row 值解析
            body.rowDecode = PlainBuffer.decode(body.row);
            callback(err, body);
        });
    }

    PutRow(tableName, pk, attr, options, callback = function() {}) {
        const operation = 'PutRow';
        let req = this.PCORE[`${operation}Request`].fromObject(Object.assign({
            tableName,
            row: PlainBuffer.buildPrimayKey(pk, attr),
            condition: {
                rowExistence: 'IGNORE'
            },
        }, options));

        this._makeRequest(operation, req, function(err, body) {
            callback(err, body);
        });
    }

    _makeRequest(operation, req, callback) {
        let reqBuf = this.PCORE[`${operation}Request`].encode(req).finish();
        this.connection.req(operation, reqBuf, (err, resp, body) => {
            if(err) {
                return callback(err);
            }

            if (resp.statusCode !== 200) {
                return callback(this.PCORE.Error.decode(body));
            }

            callback(null, this.PCORE[`${operation}Response`].decode(body));
        });
    }
}

module.exports = OTS;