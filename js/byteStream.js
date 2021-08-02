export class ByteStream {
    dataView;
    pos;

    constructor(bufferOrSize, startPos = 0) {
        if (Number.isInteger(bufferOrSize))
            this.dataView = new DataView(new ArrayBuffer(bufferOrSize));
        else
            this.dataView = new DataView(bufferOrSize);
        this.pos = startPos;
    }

    setPos(pos) {
        this.pos = pos;
    }

    expandIfNeed(freeBytes = 1, addSize = 1000) {
        if (this.pos + freeBytes >= this.dataView.buffer.byteLength) {
            this.expandSize(addSize);
            return true;
        }
        return false;
    }

    expandSize(addSize = 1000) {
        const newReplay = new Uint8Array(this.dataView.buffer.byteLength + addSize);
        newReplay.set(new Uint8Array(this.dataView.buffer), 0);
        console.log(`replay buffer extended from ${ this.dataView.buffer.byteLength } to ${ newReplay.length }`);
        this.dataView = new DataView(newReplay.buffer);
    }

    pack() {
        return new Uint8Array(this.dataView.buffer).subarray(0, this.pos);
    }

    pushUint8(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Uint8Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setUint8(this.pos, value);
        this.pos += Uint8Array.BYTES_PER_ELEMENT;
    };

    pushUint16(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Uint16Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setUint16(this.pos, value);
        this.pos += Uint16Array.BYTES_PER_ELEMENT;
    };

    pushUint32(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Uint32Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setUint32(this.pos, value);
        this.pos += Uint32Array.BYTES_PER_ELEMENT;
    };

    pushInt8(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Int8Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setInt8(this.pos, value);
        this.pos += Int8Array.BYTES_PER_ELEMENT;
    };

    pushInt16(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Int16Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setInt16(this.pos, value);
        this.pos += Int16Array.BYTES_PER_ELEMENT;
    };

    pushInt32(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Int32Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setInt32(this.pos, value);
        this.pos += Int32Array.BYTES_PER_ELEMENT;
    };

    pushFloat32(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Float32Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setFloat32(this.pos, value);
        this.pos += Float32Array.BYTES_PER_ELEMENT;
    };

    pushFloat64(value, autoExpand = 1000) {
        if (autoExpand > 0)
            this.expandIfNeed(Float64Array.BYTES_PER_ELEMENT, autoExpand);
        this.dataView.setFloat64(this.pos, value);
        this.pos += Float64Array.BYTES_PER_ELEMENT;
    };

    shiftUint8() {
        const value = this.dataView.getUint8(this.pos);
        this.pos += Uint8Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftUint16() {
        const value = this.dataView.getUint16(this.pos);
        this.pos += Uint16Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftUint32() {
        const value = this.dataView.getUint32(this.pos);
        this.pos += Uint32Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftInt8() {
        const value = this.dataView.getInt8(this.pos);
        this.pos += Int8Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftInt16() {
        const value = this.dataView.getInt16(this.pos);
        this.pos += Int16Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftInt32() {
        const value = this.dataView.getInt32(this.pos);
        this.pos += Int32Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftFloat32() {
        const value = this.dataView.getFloat32(this.pos);
        this.pos += Float32Array.BYTES_PER_ELEMENT;
        return value;
    };

    shiftFloat64() {
        const value = this.dataView.getFloat64(this.pos);
        this.pos += Float64Array.BYTES_PER_ELEMENT;
        return value;
    };

    getUint8(offset) {
        return this.dataView.getUint8(offset);
    };

    getUint16(offset) {
        return this.dataView.getUint16(offset);
    };

    getUint32(offset) {
        return this.dataView.getUint32(offset);
    };

    getInt8(offset) {
        return this.dataView.getInt8(offset);
    };

    getInt16(offset) {
        return this.dataView.getInt16(offset);
    };

    getInt32(offset) {
        return this.dataView.getInt32(offset);
    };

    getFloat32(offset) {
        return this.dataView.getFloat32(offset);
    };

    getFloat64(offset) {
        return this.dataView.getFloat64(offset);
    };
}
