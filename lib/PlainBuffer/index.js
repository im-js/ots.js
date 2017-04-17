'use strict';
/**
 * PlainBuffer 构造函数
 * https://help.aliyun.com/document_detail/50600.html
 */

// const protobuf = require('protobufjs');

const checksum = require('./checksum');
const CONST_VALUE = require('./CONST_VALUE');
const { PB_TAG, PB_VALUE_TYPE, PB_LENGTH } = CONST_VALUE;

function PlainBuffer() {
}

PlainBuffer.getCellCheckum = function(pk, value) {
    let crc = checksum.getChecksum(0x00, pk);

    switch(typeof value) {
        case 'string': {
            let buf = Buffer.from(value);
            crc = checksum.crc8(crc, PB_VALUE_TYPE.STRING);
            crc = checksum.crc8(crc, buf.length);
            crc = checksum.getChecksum(crc, buf);
        }
    }

    return crc;
};

PlainBuffer.buildPrimayKey  = function (pk, value) {
    // 需要做内存检查
    let buf = Buffer.allocUnsafe(128), pos = 0;

    // 写入 Header
    buf.writeUInt32LE(PB_TAG.HEADER.value, pos);
    pos += PB_TAG.HEADER.length;

    // 写入 pk 键
    buf.writeUInt8(PB_TAG.PK.value, pos);
    pos += PB_TAG.PK.length;

    // 写入 cell 标签
    buf.writeUInt8(PB_TAG.CELL.value, pos);
    pos += PB_TAG.CELL.length;

    // 写入 cell_name
    buf.writeUInt8(PB_TAG.CELL_NAME.value, pos);
    pos += PB_TAG.CELL_NAME.length;
    
    let pkLength = buf.write(pk, pos + PB_LENGTH.VALUE_LEN);
    buf.writeUInt32LE(pkLength, pos);
    pos += pkLength + PB_LENGTH.VALUE_LEN;

    // 写入 cell_value
    buf.writeUInt8(PB_TAG.CELL_VALUE.value, pos);
    pos += PB_TAG.CELL_VALUE.length;
    // 写入 prefix_length
    let valueOffet = 2 * PB_LENGTH.VALUE_LEN + PB_LENGTH.VALUE_TYPE;
    let valueLength = buf.write(value, pos + valueOffet);
    buf.writeUInt32LE(PB_LENGTH.VALUE_TYPE + PB_LENGTH.VALUE_LEN + valueLength, pos);
    pos += PB_LENGTH.VALUE_LEN;
    // cell_value 值输入
    buf.writeUInt8(PB_VALUE_TYPE.STRING, pos);
    pos += PB_LENGTH.VALUE_TYPE;
    buf.writeUInt32LE(valueLength, pos);
    pos += PB_LENGTH.VALUE_LEN + valueLength;

    // cell 校验
    buf.writeUInt8(PB_TAG.CELL_CHECKSUM.value, pos);
    pos += PB_TAG.CELL_CHECKSUM.length;
    PlainBuffer.getCellCheckum(pk, value);

    // row 检验

    // 结果输
    console.log(buf.slice(0, pos));
};

module.exports = PlainBuffer;