'use strict';
/**
 * PlainBuffer 性能基准测试
 */
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite('PlainBuffer');

const PlainBuffer = require('../lib/PlainBuffer/');

// add tests
suite
.add('#encodeString-英文', function() {
    PlainBuffer.buildPrimayKey({
        pk: 'pkValue'
    });
})
.add('#encodeString-中文', function() {
    PlainBuffer.buildPrimayKey({
        pk: '中文字符串'
    });
})
.add('#encodeInteger', function() {
    PlainBuffer.buildPrimayKey({
        pk: 19389938
    });
})
.add('#encodeMix', function() {
    PlainBuffer.buildPrimayKey({
        pk1: 'pkValue',
        pk2: '中文字符串',
        pk3: 19389938
    });
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
    console.log(`====== ${this.name} bench END ======`);
})
// run async
.run({
    'async': true
});
