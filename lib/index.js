'use strict';
/**
 * 入口文件
 */
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
    }

    GetRow() {
        this.connection.req('GetRow', Buffer.allocUnsafe(10));
    }
}

module.exports = OTS;