'use strict';
/**
 * Row 数据解析
 */
const Long = require('long');
const Base = require('./Base');
const CONST_VALUE = require('../CONST_VALUE');
const checksum = require('../checksum');
const {
    PB_TAG,
    PB_VALUE_TYPE,
    PB_LENGTH
} = CONST_VALUE;

class Cell extends Base {
    constructor(buffer, pos = 0) {
        super(buffer, pos);

        // 解析结果
        this.data = {};
        this._decode();
    }

    static getChecksum (key, value, ts, cellType) {
        let crc = 0x00;

        if (key) {
            crc = checksum.getChecksum(crc, key);
        }

        if (value) {
            switch(typeof value) {
                case 'string': {
                    let buf = Buffer.from(value);
                    crc = checksum.crc8(crc, PB_VALUE_TYPE.STRING);
                    crc = checksum.getChecksum(crc, buf.length);
                    crc = checksum.getChecksum(crc, buf);
                    break;
                }

                case 'number': {
                    crc = checksum.crc8(crc, PB_VALUE_TYPE.INTEGER);
                    crc = checksum.getChecksum(crc, Long.fromNumber(value));
                    break;
                }
            }
        }

        if (ts) {
            crc = checksum.getChecksum(crc, Long.fromNumber(ts));
        }

        if (cellType) {
            // 现假定为 cell_op，对应一字节
            crc = checksum.crc8(crc, cellType);
        }

        return crc;
    }

    static getCellBuf(key, value, ts /*,cellType*/) {
        // TODO: 需要做内存检查，预估数组大小
        let buf = Buffer.allocUnsafe(512), pos = 0;
        
        // 写入 cell tag
        buf.writeUInt8(PB_TAG.CELL.value, pos);
        pos += PB_TAG.CELL.length;

        // 写入 cell_name
        buf.writeUInt8(PB_TAG.CELL_NAME.value, pos);
        pos += PB_TAG.CELL_NAME.length;
        
        let keyLength = buf.write(key, pos + PB_LENGTH.VALUE_LEN);
        buf.writeUInt32LE(keyLength, pos);
        pos += keyLength + PB_LENGTH.VALUE_LEN;

        // 写入 cell_value
        buf.writeUInt8(PB_TAG.CELL_VALUE.value, pos);
        pos += PB_TAG.CELL_VALUE.length;
        // 进行数据类型判断
        switch (typeof value) {
            case 'number': {
                // 计算 cell_value 起始位置
                let valueOffet = PB_LENGTH.VALUE_LEN + PB_LENGTH.VALUE_TYPE;
                let longBuf = Cell.convertLongToBuffer(Long.fromNumber(value));
                buf.write(longBuf.toString('hex'), pos + valueOffet, 'hex');
                // 写入 prefix_length
                buf.writeUInt32LE(PB_LENGTH.VALUE_TYPE + PB_LENGTH.LITTLE_ENDIAN_64_SIZE, pos);
                pos += PB_LENGTH.VALUE_LEN;
                // cell_value 的 type 和 length 属性写入
                buf.writeUInt8(PB_VALUE_TYPE.INTEGER, pos);
                pos += PB_LENGTH.VALUE_TYPE + PB_LENGTH.LITTLE_ENDIAN_64_SIZE;
                break;
            }
            case 'string': {
                // 计算 cell_value 起始位置
                let valueOffet = 2 * PB_LENGTH.VALUE_LEN + PB_LENGTH.VALUE_TYPE;
                let valueLength = buf.write(value, pos + valueOffet);
                // 写入 prefix_length
                buf.writeUInt32LE(PB_LENGTH.VALUE_TYPE + PB_LENGTH.VALUE_LEN + valueLength, pos);
                pos += PB_LENGTH.VALUE_LEN;
                // cell_value 的 type 和 length 属性写入
                buf.writeUInt8(PB_VALUE_TYPE.STRING, pos);
                pos += PB_LENGTH.VALUE_TYPE;
                buf.writeUInt32LE(valueLength, pos);
                pos += PB_LENGTH.VALUE_LEN + valueLength;
                break;
            }
        }

        // 写入 timestamp
        if(ts) {
            // 写入 cell_ts tag
            buf.writeUInt8(PB_TAG.CELL_TS.value, pos);
            pos += PB_TAG.CELL_TS.length;
            // 写入时间戳
            let tsBuf = Cell.convertLongToBuffer(Long.fromNumber(ts));
            buf.write(tsBuf.toString('hex'), pos, 'hex');
            pos += PB_LENGTH.LITTLE_ENDIAN_64_SIZE;
        }

        // cell 校验
        buf.writeUInt8(PB_TAG.CELL_CHECKSUM.value, pos);
        pos += PB_TAG.CELL_CHECKSUM.length;
        let cellChecksum = Cell.getChecksum(key, value, ts);
        buf.writeUInt8(cellChecksum, pos);
        pos += PB_LENGTH.CHECKSUM;

        return buf.slice(0, pos);
    }

    _decode() {
        this._decodeCellName();
        this._decodeCellValue();
        this._checksum();
        return this;
    }

    _decodeCellName() {
        let byte = this._readUInt8();

        if (byte === PB_TAG.CELL_NAME.value) {
            let length = this._readUInt32LE();
            this.data.name = this._readString(length);
        }
    }

    _decodeCellValue() {
        let byte = this._readUInt8();
        if (byte === PB_TAG.CELL_VALUE.value) {
            // TODO: 读取 prefixLength，未发现用处
            this._readUInt32LE();

            let type = this._readUInt8();
            let length = this._readUInt32LE();
            switch (type) {
                case PB_VALUE_TYPE.STRING: {
                    this.data.value = this._readString(length);
                }
            }
        }
    }

    // 数据合法性校验
    _checksum() {
        let byte = this._readUInt8();
        if (byte !== PB_TAG.CELL_CHECKSUM.value) {
            throw new Error('数据校验缺失');
        }

        byte = this._readUInt8();
        let cellChecksum = Cell.getChecksum(this.data.name, this.data.value);

        if(byte !== cellChecksum) {
            throw new Error('数据不合法');
        }
    }
}

module.exports = Cell;