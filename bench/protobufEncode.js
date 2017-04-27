'use strict';

const path = require('path');
const protobuf = require('protobufjs');
const protoRoot = protobuf.loadSync([
    path.join(__dirname, './data/test.proto')
]);

const pTest = protoRoot.lookup('test');

let obj = pTest.Test1.fromObject({
    a: [150, 1]
});

let buf = pTest.Test1.encode(obj).finish();

console.log(buf);