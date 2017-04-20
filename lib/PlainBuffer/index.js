'use strict';
/**
 * PlainBuffer 构造函数
 * https://help.aliyun.com/document_detail/50600.html
 */

const Row = require('./type/Row');
const Cell = require('./type/Cell');
const checksum = require('./checksum');
const CONST_VALUE = require('./CONST_VALUE');
const {
    PB_TAG
} = CONST_VALUE;

class PlainBuffer {
    // Output Stream
    static buildPrimayKey(pk, attr, isDelete = false) {
        let bufHeader = Buffer.allocUnsafe(5), pos = 0;
        // 写入 Header
        bufHeader.writeUInt32LE(PB_TAG.HEADER.value, pos);
        pos += PB_TAG.HEADER.length;
        // 写入 pk 键
        bufHeader.writeUInt8(PB_TAG.PK.value, pos);
        pos += PB_TAG.PK.length;

        // 写入 pk cell 标签
        let bufPks = [];
        for(let key in pk) {
            if(!pk.hasOwnProperty(key)) {
                continue;
            }

            bufPks.push(Cell.getCellBuf(key, pk[key], null, 'pk'));
        }

        // 写入 attr 键
        let bufAttrHeader = Buffer.from([0x00]);
        let bufAttrs = [];
        if (attr) {
            bufAttrHeader.writeUInt8(PB_TAG.ATTR.value);

            for(let key in attr) {
                if(!attr.hasOwnProperty(key)) {
                    continue;
                }
                // bufAttrs.push(Cell.getCellBuf(key, attr[key], Date.now()));
                bufAttrs.push(Cell.getCellBuf(key, attr[key], Date.now()));
            }
        }

        // 尾部参数
        let bufTail = [];
        // row 检验，delete marker 位设置
        let bufRowChecksum = Buffer.from([
            PB_TAG.ROW_CHECKSUM.value,
            0x00
        ]);
        let rowChecksum = 0x00;
        // cells 遍历
        let cells = bufAttrHeader.readUInt8() === PB_TAG.ATTR.value ? bufPks.concat(bufAttrs) : bufPks;
        for(let i = 0; i < cells.length; i++) {
            let crc = cells[i][cells[i].length - 1];
            rowChecksum = checksum.crc8(rowChecksum, crc);
        }
        // 没有deleteMarker, 要与0x0做crc.
        rowChecksum = checksum.crc8(rowChecksum, +(isDelete));
        bufRowChecksum.writeUInt8(rowChecksum, 1);
        bufTail.unshift(bufRowChecksum);

        // deleteMarker 设置
        if(isDelete) {
            bufTail.unshift(Buffer.from([PB_TAG.DELETE_MARKER.value]));
        }

        // 判断 attrs 是否需要写入
        let bufAttrSet = [];
        if(bufAttrHeader.readUInt8() === PB_TAG.ATTR.value) {
            bufAttrSet = [
                bufAttrHeader,
                ...bufAttrs
            ];
        }

        // 结果输出
        return Buffer.concat([
            bufHeader,
            ...bufPks,
            ...bufAttrSet,
            ...bufTail
        ]);
    }

    // Input Stream
    static decode(buffer, mutiple = false) {
        let pos = 0;
        // 校验
        let header = buffer.readUInt32LE(pos);
        pos += PB_TAG.HEADER.length;
        if(PB_TAG.HEADER.value !== header) {
            throw new Error('Header 值错误');
        }

        if (mutiple) {
            let rows = [];
            while(buffer[pos]) {
                let row = new Row(buffer, pos);
                pos = row.pos;
                rows.push(row.data);
            }
            return rows;
        } else {
            let row = new Row(buffer, pos);
            return row.data;
        }
    }
}

module.exports = PlainBuffer;