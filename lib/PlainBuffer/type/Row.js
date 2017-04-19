'use strict';
/**
 * Row 解析
 */
const Base =  require('./Base');
const Cell = require('./Cell');
const CONST_VALUE = require('../CONST_VALUE');
const checksum = require('../checksum');
const {
    PB_TAG,
    PB_VALUE_TYPE,
    PB_LENGTH
} = CONST_VALUE;

class Row extends Base {
    constructor(buffer, pos = 0) {
        super(buffer, pos);

        // 解析结果
        this.data = {};
        this._decode();
    }

    _decode() {
        this._decodePK();
        this._decodeColumns();
    }

    _decodePK() {
        let byte = this._readUInt8();
        if (PB_TAG.PK.value !== byte) {
            return;
        }

        byte = this._readUInt8();
        if (PB_TAG.CELL.value === byte) {
            this.data.primaryKey = this._decodeCell();
        }
    }

    // attr 解析
    _decodeColumns() {
        let columns = [];
        let byte = this._readUInt8();
        if (PB_TAG.ATTR.value !== byte) {
            return;
        }
        
        byte = this._readUInt8();
        if (PB_TAG.CELL.value === byte) {
            columns.push(this._decodeCell());
        }

        console.log(columns);
    }

    _decodeCell() {
        let cell = new Cell(this.buffer, this.pos);
        // 添加位移
        this.pos += cell.length;
        this.length += cell.length;

        return cell.data;
    }
}

module.exports = Row;