# ots.js
[![Travis CI Build Status](https://travis-ci.org/im-js/ots.js.svg?branch=master)](https://travis-ci.org/im-js/ots.js/)

## Engines
`node >=6.0.0` for es6 support

## Feature
* PlainBuffer Support
* Base on 2015-12-31 API (latest API so far)
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
