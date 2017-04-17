'use strict';
const request = require('request');
const sign = require('./sign');

function req(operation, body) {
    let canonicalURI = `/${operation}`;

    // header 头必含字段
    let headers = {
        'x-ots-date': (new Date()).toISOString(),
        'x-ots-apiversion': '2015-12-31',
        'x-ots-accesskeyid': 'LTAI6Y8IXGqHCYQL',
        'x-ots-instancename': 'pl-msgc',
        'x-ots-contentmd5': '' //sign.md5(body)
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
    let otsSignature = sign.hmac('q4CYgwfgawGEl1d93aQSsDTJixtd8p', stringToSign);
    headers['x-ots-signature'] = otsSignature;

    console.log(headers);
    request({
        method: 'POST',
        uri: `http://pl-msgc.cn-hangzhou.ots.aliyuncs.com${canonicalURI}`,
        headers: headers,
        body: Buffer.from(body, 'hex'),
        encoding: null
    }, function (err, resp, body) {
        console.log(err, body, body.length);
        console.log(body.toString());
    });
}

module.exports = {
    req: req
};