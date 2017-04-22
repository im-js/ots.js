'use strict';
/**
 * 过滤条件构造器，此处不能更改对象原始值
 */
const _ = require('lodash');
const Cell = require('./PlainBuffer/type/Cell');
const path = require('path');
const protobuf = require('protobufjs');
const PFILTER = protobuf.loadSync([
    path.join(__dirname, './proto/table_store_filter.proto')
]).lookup('com.alicloud.openservices.tablestore.core.protocol');

function makeRawComposite(condition, isReturnObj) {
    // 读取 最底层 filter
    let filter = condition.filter;
    // 递归循环转换值
    let subFilters = [];
    for(let i = 0; i < filter.subFilters.length; i++) {
        subFilters[i] = makeRaw(filter.subFilters[i], true);
    }

    let  compositeColumnValueFilterObj = PFILTER.CompositeColumnValueFilter.fromObject(_.defaults({
        subFilters
    }, filter));

    let filterBytes = PFILTER.CompositeColumnValueFilter.encode(compositeColumnValueFilterObj).finish();

    // 是否返回对象
    let filterObjectRaw = {
        type: condition.type,
        filter: filterBytes
    };
    if(isReturnObj) {
        return filterObjectRaw;
    }

    let filterObject = PFILTER.Filter.fromObject(filterObjectRaw);
    return PFILTER.Filter.encode(filterObject).finish();
}

function makeRawSingle(condition, isReturnObj) {
    // cell value PlainBuffer 编码
    let cellValueBuf = Cell.getCellValueBuf(condition.filter.columnValue);

    let singleColumnValueFilterObj = PFILTER.SingleColumnValueFilter.fromObject(_.defaults({
        columnValue: cellValueBuf
    }, condition.filter));

    let filterBytes = PFILTER.SingleColumnValueFilter.encode(singleColumnValueFilterObj).finish();

    // 是否返回对象
    let filterObjectRaw = {
        type: condition.type,
        filter: filterBytes
    };
    if(isReturnObj) {
        return filterObjectRaw;
    }

    let filterObject = PFILTER.Filter.fromObject(filterObjectRaw);
    return PFILTER.Filter.encode(filterObject).finish();
}

function makeRawPagination(condition, isReturnObj) {
    let columnPaginationFilterObj = PFILTER.ColumnPaginationFilter.fromObject(condition.filter);
    let filterBytes = PFILTER.ColumnPaginationFilter.encode(columnPaginationFilterObj).finish();

    // 是否返回对象
    let filterObjectRaw = {
        type: condition.type,
        filter: filterBytes
    };
    if(isReturnObj) {
        return filterObjectRaw;
    }

    let filterObject = PFILTER.Filter.fromObject(filterObjectRaw);
    return PFILTER.Filter.encode(filterObject).finish();
}

function makeRaw(input, isReturnObj = false) {
    switch(input.type) {
        case 'FT_SINGLE_COLUMN_VALUE': {
            return makeRawSingle(input, isReturnObj);
        }
        case 'FT_COMPOSITE_COLUMN_VALUE': {
            return makeRawComposite(input, isReturnObj);
        }
        case 'FT_COLUMN_PAGINATION': {
            return makeRawPagination(input, isReturnObj);
        }
    }
}

module.exports = {
    makeRaw
};