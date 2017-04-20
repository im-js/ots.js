'use strict';
/**
 * Row 解析
 */
const Base =  require('./Base');
const Cell = require('./Cell');
const checksum = require('../checksum');
const CONST_VALUE = require('../CONST_VALUE');
const {
    PB_TAG,
} = CONST_VALUE;

class Row extends Base {
    constructor(buffer, pos = 0) {
        super(buffer, pos);

        // 解析结果
        this.data = {
            pk: {},
            attr: {}
        };
        this.cellChecksums = [];
        this._decode();
    }

    _decode() {
        this._decodePK();
        this._decodeAttr();
        this._rowChecksum();
    }

    // pk 解析
    _decodePK() {
        if (PB_TAG.PK.value !== this._readUInt8()) {
            return;
        }

        while(PB_TAG.CELL.value === this._readUInt8()) {
            let cell = this._decodeCell();
            this.data.pk[cell.name] = cell.value;
        }
    }

    // attr 解析
    _decodeAttr() {
        if (PB_TAG.ATTR.value !== this._currentByte()) {
            return;
        }

        while(PB_TAG.CELL.value === this._readUInt8()) {
            let cell = this._decodeCell();
            this.data.attr[cell.name] = cell.value;
        }
    }

    // row checksum
    _rowChecksum() {
        let deleteMarkerCrc = 0x00;
        if(PB_TAG.DELETE_MARKER.value === this._currentByte()) {
            deleteMarkerCrc = 0x01;
            this._readUInt8();
        }

        if (PB_TAG.ROW_CHECKSUM.value !== this._currentByte()) {
            throw new Error('Row 校验位缺失');
        }
        let crc = 0x00;
        
        for(let i = 0; i < this.cellChecksums.length; i++) {
            crc = checksum.crc8(crc, this.cellChecksums[i]);
        }

        // 没有deleteMarker, 要与0x0做crc.
        crc = checksum.crc8(crc, deleteMarkerCrc);

        if (crc !== this._readUInt8()) {
            throw new Error('Row 校验失败');
        }
    }

    // cell 解析
    _decodeCell() {
        let cell = new Cell(this.buffer, this.pos);

        // 添加位移
        this.pos += cell.length;
        this.length += cell.length;
        // 添加校验值
        this.cellChecksums.push(cell.data.checksum);

        return cell.data;
    }
}

module.exports = Row;