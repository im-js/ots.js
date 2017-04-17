'use strict';
/**
 * 具体定义参考 READRE.md
 * 所有长度单位为 byte
 */

const PB_TAG = {
    'HEADER': {
        value: 0x75,
        length: 4
    },
    'PK': {
        value: 0x01,
        length: 1
    },
    'ATTR': {
        value: 0x02,
        length: 1
    },
    'CELL': {
        value: 0x03,
        length: 1
    },
    'CELL_NAME': {
        value: 0x04,
        length: 1
    },
    'CELL_VALUE': {
        value: 0x05,
        length: 1
    },
    'CELL_OP': {
        value: 0x06,
        length: 1
    },
    'CELL_TS': {
        value: 0x07,
        length: 1
    },
    'DELETE_MARKER': {
        value: 0x08,
        length: 1
    },
    'ROW_CHECKSUM': {
        value: 0x09,
        length: 1
    },
    'CELL_CHECKSUM': {
        value: 0x0A,
        length: 1
    }
};

const PB_VALUE_TYPE = {
    'INTEGER': 0x0,
    'DOUBLE': 0x1,
    'BOOLEAN': 0x2,
    'STRING': 0x3,
    'NULL': 0x6,
    'BLOB': 0x7,
    'INF_MIN': 0x9,
    'INF_MAX': 0xa,
    'AUTO_INCREMENT': 0xb
};

const PB_LENGTH = {
    VALUE_TYPE: 1,
    VALUE_LEN: 4
};

module.exports = {
    PB_TAG,
    PB_VALUE_TYPE,
    PB_LENGTH
};