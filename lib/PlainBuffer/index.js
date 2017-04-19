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
    PB_TAG,
    PB_VALUE_TYPE,
    PB_LENGTH
} = CONST_VALUE;

class PlainBuffer {
    // Output Stream
    static buildPrimayKey(pk, attr) {
        let bufHeader = Buffer.allocUnsafe(5), pos = 0;
        // 写入 Header
        bufHeader.writeUInt32LE(PB_TAG.HEADER.value, pos);
        pos += PB_TAG.HEADER.length;
        // 写入 pk 键
        bufHeader.writeUInt8(PB_TAG.PK.value, pos);
        pos += PB_TAG.PK.length;

        // 写入 cell 标签
        let bufPks = [];
        for(let key in pk) {
            if(!pk.hasOwnProperty(key)) {
                continue;
            }

            bufPks.push(Cell.getCellBuf(key, pk[key]));
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
                bufAttrs.push(Cell.getCellBuf(key, attr[key], 1492527415110));
            }
        }

        // row 检验
        let bufRowChecksum = Buffer.from([
            PB_TAG.ROW_CHECKSUM.value,
            0x00
        ]);
        let rowChecksum = 0x00;

        // cells 值校验
        let cells = bufAttrHeader.readUInt8() === PB_TAG.ATTR.value ? bufPks.concat(bufAttrs) : bufPks;

        for(let i = 0; i < cells.length; i++) {
            let crc = cells[i][cells[i].length - 1];
            rowChecksum = checksum.crc8(rowChecksum, crc);
        }

        // 没有deleteMarker, 要与0x0做crc.
        rowChecksum = checksum.crc8(rowChecksum, 0x00);
        bufRowChecksum.writeUInt8(rowChecksum, 1);

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
            bufRowChecksum
        ]);
    }

    // Input Stream
    static decode(buffer) {
        let pos = 0;
        // 校验
        let header = buffer.readUInt32LE(pos);
        pos += PB_TAG.HEADER.length;
        if(PB_TAG.HEADER.value !== header) {
            throw new Error('Header 值错误');
        }
        
        let row = new Row(buffer, pos);
        console.log(row);
    }
}

module.exports = PlainBuffer;

/**
75:00:00:00:01:03: 04:02:00:00:00:70:6b:05:0c:00:00:00:03:07:00:00:00:70:6b:56:61:6c:75:65:0a:85:

02:
03:04:04:00:00:00:43:6f:6c:30:
05:09:00:00:00:00:01:00:00:00:00:00:00:00:07:1e:06:4b:6a:5b:01:00:00:0a:7b:03:04:04:00:00:00:43:6f:6c:31:05:09:00:00:00:00:01:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:ee:03:04:04:00:00:00:43:6f:6c:32:05:09:00:00:00:00:02:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:96:03:04:04:00:00:00:43:6f:6c:33:05:09:00:00:00:00:03:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:be:03:04:04:00:00:00:43:6f:6c:34:05:09:00:00:00:00:04:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:66:03:04:04:00:00:00:43:6f:6c:35:05:09:00:00:00:00:05:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:4e:03:04:04:00:00:00:43:6f:6c:36:05:09:00:00:00:00:06:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:36:03:04:04:00:00:00:43:6f:6c:37:05:09:00:00:00:00:07:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:1e:03:04:04:00:00:00:43:6f:6c:38:05:09:00:00:00:00:08:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:81:03:04:04:00:00:00:43:6f:6c:39:05:09:00:00:00:00:09:00:00:00:00:00:00:00:07:f2:05:4b:6a:5b:01:00:00:0a:a9:09:89

 */
