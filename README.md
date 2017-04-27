# ots.js
[![npm version](https://img.shields.io/npm/v/ots.js.svg)](https://www.npmjs.com/package/ots.js)
[![Build Status](https://travis-ci.org/im-js/ots.js.svg?branch=master)](https://travis-ci.org/im-js/ots.js)

## Engines
`node >=6.0.0` for es6 support

## Usage
install
```javascript
npm install ots.js
```
init
```javascript
const OTS = require('ots.js');

let ots = new OTS({
    endPoint: process.env.otsEndPoint,
    accessId: process.env.otsAccessId,
    accessKey: process.env.otsAccessKey,
    instanceName: process.env.otsInstanceName
});

ots.CreateTable(...);
...
```

## Feature
* Base on `2015-12-31` API (latest API so far)
* PlainBuffer Support
* AutoIncrement PrimaryKey Support
* Connection Pool support ?

## Test
Before run test, please export following configuration to your env
```shell
export \
    otsEndPoint='like http://pl-msgc.cn-hangzhou.ots.aliyuncs.com' \
    otsAccessId='' \
    otsAccessKey='' \
    otsInstanceName='';
```
then
```shell
npm test
```

## Performance
PlainBuffer Test Result
```
====== Encode bench START ======
EncodeString#PlainBuffer x 30,025 ops/sec ±0.97% (85 runs sampled)
  - memory: { rss: 70176768, heapTotal: 47271936, heapUsed: 29746856 }
EncodeString#Json x 1,175,011 ops/sec ±0.96% (84 runs sampled)
  - memory: { rss: 82063360, heapTotal: 57757696, heapUsed: 21108072 }
EncodeString#protobuf.js x 1,092,644 ops/sec ±1.47% (82 runs sampled)
  - memory: { rss: 81297408, heapTotal: 56709120, heapUsed: 27769104 }
Fastest is EncodeString#Json
====== Decode bench START ======
DecodeString#PlainBuffer x 70,891 ops/sec ±1.28% (85 runs sampled)
  - memory: { rss: 84955136, heapTotal: 58806272, heapUsed: 14220824 }
DecodeString#Json x 656,429 ops/sec ±1.06% (88 runs sampled)
  - memory: { rss: 86065152, heapTotal: 60903424, heapUsed: 14851056 }
DecodeString#protobuf.js x 1,642,783 ops/sec ±1.22% (85 runs sampled)
  - memory: { rss: 86183936, heapTotal: 60923904, heapUsed: 20393256 }
Fastest is DecodeString#protobuf.js
```
You can also run the benchmark
```shell
npm run bench
```