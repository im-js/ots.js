'use strict';
/**
 * 连接管理类
 * 基于 http.Agent 模块做连接池管理。
 * 等待 ots 官方支持 TLS, http2 支持
 */

const request = require('request');
const sign = require('./sign');
const http = require('http');

/**
 * @param {Object} options
 * @param {Integer} options.poolSize - 最大连接数，默认 10
 */
class Connection {
    constructor(endPoint, accessId, accessKey, instanceName, options = {}) {
        this.endPoint = endPoint;
        this.accessId = accessId;
        this.accessKey = accessKey;
        this.instanceName = instanceName;


        this.agent = new http.Agent({
            keepAlive: true,
            maxSockets: options.poolSize || 10
        });
    }

    req(operation, bodyBuf, callback = function() {}) {
        let canonicalURI = `/${operation}`;

        // header 头必含字段
        let headers = {
            'x-ots-date': (new Date()).toISOString(),
            'x-ots-apiversion': '2015-12-31', // 最新版
            'x-ots-accesskeyid': this.accessId,
            'x-ots-instancename': this.instanceName,
            'x-ots-contentmd5': '' // sign.md5(body)
        };

        // 遍历头部
        let canonicalHeaders = [];
        for (let key in headers) {
            if (!headers.hasOwnProperty(key)) {
                continue;
            }

            canonicalHeaders.push(`${key}:${headers[key]}`);
        }

        // 升序排序
        canonicalHeaders.sort();

        // 签名生成
        let stringToSign = canonicalURI + '\n' + 'POST' + '\n\n' + canonicalHeaders.join('\n') + '\n';
        let otsSignature = sign.hmac(this.accessKey, stringToSign);
        headers['x-ots-signature'] = otsSignature;
        
        // 添加 SDK 版本号
        headers['User-Agent'] = 'ots-node-sdk 0.0.1';

        let reqOptions = {
            method: 'POST',
            uri: `${this.endPoint}${canonicalURI}`,
            headers: headers,
            agent: this.agent,
            encoding: null
        };

        if(bodyBuf.length) {
            reqOptions.body = bodyBuf;
        }

        request(reqOptions, function (err, resp, body) {
            callback(err, resp, body);
        });
    }
}

module.exports = Connection;