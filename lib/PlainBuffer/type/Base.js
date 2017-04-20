'use strict';
/**
 * 解析基类
 */
const Long = require('long');

class Base {
    constructor(buffer, pos = 0) {
        this.buffer = buffer;
        this.pos = pos;
        this.length = 0;
    }

    static formatBuffer(buffer) {
        let hexStr = buffer.toString('hex');
        let formatStr = '';
        for(let i = 0; i < hexStr.length; i+=2) {
            formatStr += hexStr.substr(i, 2) + ':';
        }
        return formatStr.slice(0, -1);
    }

    static convertLongToBuffer(long) {
        let buf = Buffer.allocUnsafe(8);
        buf.writeUInt32LE(long.getLowBitsUnsigned());
        buf.writeUInt32LE(long.getHighBitsUnsigned(), 4);
        return buf;
    }

    static convertBufferToLong(buf) {
        return Long.fromBits(buf.readUInt32LE(), buf.readUInt32LE(4));
    }

    static getRawLittleEndian64(number) {
        let long = Long.fromNumber(number, true);
        let buf = Buffer.allocUnsafe(8);
        for(let i = 0; i < 8; i++) {
            buf.writeUInt8(long.shiftRight(8 * i).and(0xff).toNumber(), i);
        }
        return buf;
    }

    _readString(length) {
        this.length += length;
        return this.buffer.toString('utf8', this.pos, this.pos +=length);
    }

    _readUInt32LE() {
        let result = this.buffer.readUInt32LE(this.pos);
        this.length += 4;
        this.pos += 4;
        return result;
    }

    _readUInt8() {
        this.length++;
        return this.buffer.readUInt8(this.pos++);
    }

    _rollbackUint8() {
        this.length--;
        this.pos--;
    }

    _readLong() {
        this.length += 8;
        return Base.convertBufferToLong(this.buffer.slice(this.pos, this.pos += 8));
    }

    _currentByte() {
        return this.buffer[this.pos - 1];
    }
}

module.exports = Base;