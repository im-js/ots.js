# ots.js
[![npm version](https://img.shields.io/npm/v/ots.js.svg)](https://www.npmjs.com/package/ots.js)
[![Travis CI Build Status](https://travis-ci.org/im-js/ots.js.svg?branch=master)](https://travis-ci.org/im-js/ots.js/)

## Engines
`node >=6.0.0` for es6 support

## Feature
* Base on `2015-12-31` API (latest API so far)
* PlainBuffer Support
* AutoIncrement PrimaryKey Support

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
====== PlainBuffer bench START ======
#encodeString-英文 x 90,286 ops/sec ±2.21% (72 runs sampled)
  - memory: { rss: 79097856, heapTotal: 43077632, heapUsed: 19759840 }
#encodeString-中文 x 88,226 ops/sec ±1.23% (77 runs sampled)
  - memory: { rss: 79884288, heapTotal: 43077632, heapUsed: 14666376 }
#encodeInteger x 109,069 ops/sec ±1.57% (73 runs sampled)
  - memory: { rss: 95891456, heapTotal: 57757696, heapUsed: 13551944 }
#encodeMix x 37,376 ops/sec ±1.33% (75 runs sampled)
  - memory: { rss: 97460224, heapTotal: 58806272, heapUsed: 22687840 }
====== PlainBuffer bench END =====
```
You can also run the benchmark
```shell
npm run bench
```