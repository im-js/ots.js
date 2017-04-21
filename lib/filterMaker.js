'use strict';
/**
 * 过滤条件构造器
 */
const Cell = require('./PlainBuffer/type/Cell');
const path = require('path');
const protobuf = require('protobufjs');
const PFILTER = protobuf.loadSync([
    path.join(__dirname, './proto/table_store_filter.proto')
]).lookup('com.alicloud.openservices.tablestore.core.protocol');

// 原始数据接口
function makeRawComposite(conditions) {
    for(let i = 0; i < conditions.length; i++) {
        // 读取 最底层 filter
        let condition = conditions[i];
        for(let j = 0; j < condition.filter.length; j++) {
            let filter = condition.filter[j];
            let filterObject = PFILTER.SingleColumnValueFilter.fromObject(filter);
            let bytes = PFILTER.SingleColumnValueFilter.encode(filterObject).finish();
            console.log(bytes);
        }
    }
}

function makeRawSingle(condition) {
    if (condition.type === 'FT_SINGLE_COLUMN_VALUE') {
        // cell value PlainBuffer 编码
        let cellValueBuf = Cell.getCellValueBuf(condition.filter.columnValue);

        let filterObject = PFILTER.SingleColumnValueFilter.fromObject(Object.assign({}, condition.filter, {
            columnValue: cellValueBuf
        }));

        let bytes = PFILTER.SingleColumnValueFilter.encode(filterObject).finish();

        filterObject = PFILTER.Filter.fromObject({
            type: condition.type,
            filter: bytes
        });

        bytes = PFILTER.Filter.encode(filterObject).finish();
        return bytes;
    }
}

function makeRaw(input) {
    return makeRawSingle(input);
}

module.exports = {
    makeRaw,
    makeRawComposite,
    makeRawSingle
};