'use strict';
/**
 * PlainBuffer 性能基准测试
 */
const Benchmark = require('benchmark');
const PlainBuffer = require('../lib/PlainBuffer/');
const path = require('path');
const protobuf = require('protobufjs');
const protoRoot = protobuf.loadSync([
    path.join(__dirname, './data/test.proto')
]);
const pTest = protoRoot.lookup('test');

let testString = {
    pk: 'pkValue',
    zhcn: '中文来袭',
    number: 1493083995125,
    bool: true
};

// encode
function encode() {
    const suite = new Benchmark.Suite('Encode');
    suite
    .add('EncodeString#PlainBuffer', function() {
        PlainBuffer.buildPrimayKey(testString);
    })
    .add('EncodeString#Json', function() {
        JSON.stringify(testString);
    })
    .add('EncodeString#protobuf.js', function() {
        let testObj = pTest.PkMsg.fromObject(testString);
        pTest.PkMsg.encode(testObj).finish();
    })
    // add listeners
    .on('start', function() {
        console.log(`====== ${this.name} bench START ======`);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
        console.log('  - memory:', process.memoryUsage());
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        decode();
    })
    // run async
    .run({
        'async': true
    });
}

// decode
function decode() {
    let rawPlainBuffer = PlainBuffer.buildPrimayKey(testString);
    let rawJson = JSON.stringify(testString);
    let rawProtobuf = pTest.PkMsg.encode(pTest.PkMsg.fromObject(testString)).finish();

    const suite= new Benchmark.Suite('Decode');
    suite
    .add('DecodeString#PlainBuffer', function() {
        PlainBuffer.decode(rawPlainBuffer);
    })
    .add('DecodeString#Json', function() {
        JSON.parse(rawJson);
    })
    .add('DecodeString#protobuf.js', function() {
        let testObj = pTest.PkMsg.decode(rawProtobuf);
        pTest.PkMsg.toObject(testObj);
    })
    // add listeners
    .on('start', function() {
        console.log(`====== ${this.name} bench START ======`);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
        console.log('  - memory:', process.memoryUsage());
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run({
        'async': true
    });
}

encode();