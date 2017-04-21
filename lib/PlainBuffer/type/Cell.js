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
    PB_LENGTH,
    PB_SYSTEM
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
                // symbol 只用于查询，数据库中无此数据类型
                case 'symbol': {
                    if (PB_SYSTEM.OTS_INF_MAX === value) {
                        crc = checksum.crc8(crc, PB_VALUE_TYPE.INF_MAX);
                    } else if(PB_SYSTEM.OTS_INF_MIN === value) {
                        crc = checksum.crc8(crc, PB_VALUE_TYPE.INF_MIN);
                    }
                    break;
                }
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

                case 'boolean': {
                    crc = checksum.crc8(crc, PB_VALUE_TYPE.BOOLEAN);
                    crc = checksum.crc8(crc, +(value));
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

    static getCellValueBuf(value) {
        // 不带 prefix_length 的 cell_value buf 值
        let buf;
        // 进行数据类型判断
        switch (typeof value) {
            // symbol 只用于查询，数据库中无此数据类型
            case 'symbol': {
                // cell_value
                if (PB_SYSTEM.OTS_INF_MAX === value) {
                    buf = Buffer.from([PB_VALUE_TYPE.INF_MAX]);
                } else if(PB_SYSTEM.OTS_INF_MIN === value) {
                    buf = Buffer.from([PB_VALUE_TYPE.INF_MIN]);
                }
                break;
            }
            case 'number': {
                // 计算 cell_value 起始位置
                let longBuf = Cell.convertLongToBuffer(Long.fromNumber(value));
                buf = Buffer.concat([Buffer.from([PB_VALUE_TYPE.INTEGER]), longBuf]);
                break;
            }
            case 'string': {
                let bufHeader = Buffer.alloc(PB_LENGTH.VALUE_TYPE + PB_LENGTH.VALUE_LEN);
                let bufString = Buffer.from(value);
                bufHeader.writeUInt8(PB_VALUE_TYPE.STRING);
                bufHeader.writeUInt32LE(bufString.length, PB_LENGTH.VALUE_TYPE);

                buf = Buffer.concat([
                    bufHeader,
                    bufString
                ]);
                break;
            }
            case 'boolean': {
                buf = Buffer.from([PB_VALUE_TYPE.BOOLEAN, +(value)]);
                break;
            }
        }

        return buf;
    }

    static getCellBuf(key, value, ts, cellType = 'attr') {
        // 数据类型限制
        if (cellType !== 'pk' && typeof value === 'symbol') {
            throw new Error('symbol 类型只能用于主键');
        }
        let bufValue = Cell.getCellValueBuf(value);
        let bufKey = Buffer.from(key);
        // 写入时间戳
        let bufTs = Cell.convertLongToBuffer(Long.fromNumber(ts));

        // 预估数据大小，留 8 字节冗余
        let bufLength = bufValue.length + bufKey.length + bufTs.length + 22;
        let buf = Buffer.allocUnsafe(bufLength), pos = 0;
        
        // 写入 cell ta
        pos = buf.writeUInt8(PB_TAG.CELL.value, pos); // + 1

        // 写入 cell_name
        pos = buf.writeUInt8(PB_TAG.CELL_NAME.value, pos); // +1
        pos = buf.writeUInt32LE(bufKey.length, pos); // +4
        pos += buf.write(key, pos);

        // 写入 cell_value
        pos = buf.writeUInt8(PB_TAG.CELL_VALUE.value, pos); // +1
        // 写入 prefix_length
        pos = buf.writeUInt32LE(bufValue.length, pos); // +4
        pos += buf.write(bufValue.toString('hex'), pos, 'hex');

        // 写入 timestamp
        if(ts) {
            // 写入 cell_ts tag
            pos = buf.writeUInt8(PB_TAG.CELL_TS.value, pos); // +1
            pos += buf.write(bufTs.toString('hex'), pos, 'hex');
        }

        // cell 校验
        pos = buf.writeUInt8(PB_TAG.CELL_CHECKSUM.value, pos); // +1
        let cellChecksum = Cell.getChecksum(key, value, ts);
        pos = buf.writeUInt8(cellChecksum, pos); // +1

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

    // 同 case 'string' 等，需要一一匹配
    _decodeCellValue() {
        if (this._readUInt8() === PB_TAG.CELL_VALUE.value) {
            // TODO: 读取 prefixLength，未发现用处
            this._readUInt32LE();
            
            let type = this._readUInt8();
            switch (type) {
                case PB_VALUE_TYPE.STRING: {
                    this.data.value = this._readString(this._readUInt32LE());
                    break;
                }
                case PB_VALUE_TYPE.INTEGER: {
                    this.data.value = this._readLong().toNumber();
                    break;
                }
                case PB_VALUE_TYPE.BOOLEAN: {
                    this.data.value = !!(this._readUInt8());
                    break;
                }
            }

            // 解析 ts
            if(this._readUInt8() === PB_TAG.CELL_TS.value) {
                this.data.ts = this._readLong().toNumber();
            }  else {
                this._rollbackUint8();
            }
        }
    }

    // 数据合法性校验
    _checksum() {
        let byte = this._readUInt8();
        if (byte !== PB_TAG.CELL_CHECKSUM.value) {
            throw new Error('Cell 校验位缺失');
        }

        byte = this._readUInt8();
        let cellChecksum = Cell.getChecksum(this.data.name, this.data.value, this.data.ts);

        if(byte !== cellChecksum) {
            throw new Error('Cell 数据不合法');
        } else {
            this.data.checksum = cellChecksum;
        }
    }
}

module.exports = Cell;