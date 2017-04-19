'use strict';
/**
 * OTS 服务类
 * API 描述: https://help.aliyun.com/document_detail/27304.html
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
        this.protoOTSCore = protoRoot.lookup('com.alicloud.openservices.tablestore.core.protocol');
    }

    GetRow(tableName, pk, options, callback) {
        let protoGetRowRequest = this.protoOTSCore.lookupType('GetRowRequest');
        let protoGetRowResponse = this.protoOTSCore.lookupType('GetRowResponse');
        let req = protoGetRowRequest.create(Object.assign({
            tableName,
            primaryKey: PlainBuffer.buildPrimayKey(pk)
        }, options));

        let buf = protoGetRowRequest.encode(req).finish();
        this.connection.req('GetRow', buf, function(err, body) {
            if(err) {
                return callback(err);
            }

            let resp = protoGetRowResponse.decode(body);
            PlainBuffer.decode(resp.row);
        });
    }

    PutRow(tableName, pk, attr, options, callback) {
        let protoPutRowRequest = this.protoOTSCore.lookupType('PutRowRequest');
        let protoPutRowResponse = this.protoOTSCore.lookupType('PutRowResponse');

        let primaryKeyBuf = PlainBuffer.buildPrimayKey(pk, attr);

        console.log(primaryKeyBuf.toString('hex'));
        // let req = protoPutRowRequest.create(Object.assign({
        //     tableName,
        // }, options));
    }
}

module.exports = OTS;