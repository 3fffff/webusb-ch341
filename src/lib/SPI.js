import { CH341 } from "./CH341.js"

export class SPI extends CH341 {
  static PACKET_LENGTH = 0x1F
  static MAX_PACKETS = 256
  static MAX_PACKET_LEN = (SPI.PACKET_LENGTH * SPI.MAX_PACKETS)
  static lsb = true
  swapBytes(bytes) {
    const swap = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++)
      swap[i] = this.swapByte(bytes[i])
    return swap
  }

  swapByte(byte) {
    let swap = 0;
    for (let i = 0; i < 8; ++i) {
      const bit = (byte >> i) & 1;
      swap |= (bit << (8 - i))
    }
    return swap;
  }

  async setSpeed(dspeed = false) {
    const mode = CH341.CMD_I2C_STM_SET | (dspeed ? CH341.STM_SPI_DBL : 0);
    const command = new Uint8Array([
      CH341.CMD_I2C_STREAM,
      mode,
      CH341.CMD_I2C_STM_END
    ]);
    await this.device.transferOut(this.endpointOut, command);
  }

  async #chipSelect(cs, enable) {
    const csio = [0x36, 0x35, 0x33, 0x27];
    const command = new Uint8Array(enable ? [CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | csio[cs], CH341.CMD_UIO_STM_DIR | 0x3F, CH341.CMD_UIO_STM_END] : [CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | 0x37, CH341.CMD_UIO_STM_END])
    await this.device.transferOut(this.endpointOut, command);
  }

  async spiStream(cs, data, swap = false) {
    const result = [];
    const packets = Math.floor(data.length / SPI.PACKET_LENGTH);
    const rest = data.length % SPI.PACKET_LENGTH;  // Cleaner than subtraction

    await this.#chipSelect(cs, true);

    for (let i = 0; i < packets; i++) {
      const start = i * SPI.PACKET_LENGTH;
      const chunk = data.subarray(start, start + SPI.PACKET_LENGTH);
      const payload = swap ? this.swapBytes(chunk) : chunk;
      await this.device.transferOut(this.endpointOut, new Uint8Array([CH341.CMD_SPI_STREAM, ...payload]));
      const res = await this.receiveBytes(SPI.PACKET_LENGTH);
      result.push(...new Uint8Array(res));
    }

    if (rest > 0) {
      const start = packets * SPI.PACKET_LENGTH;
      const chunk = data.subarray(start, start + rest);  // Fixed end index
      const payload = swap ? this.swapBytes(chunk) : chunk;
      const stream = new Uint8Array([CH341.CMD_SPI_STREAM, ...payload])
      await this.device.transferOut(this.endpointOut, stream);
      const res = await this.receiveBytes(SPI.PACKET_LENGTH);
      result.push(...new Uint8Array(res));
    }

    await this.#chipSelect(cs, false);
    return result;
  }

  async readByte(cs, byte) {
    await this.#chipSelect(cs, true)
    const command = new Uint8Array([CH341.CMD_SPI_STREAM, byte]); // Read status
    const result = await this.device.transferOut(this.endpointOut, command);
    console.log(result)
    const buffer = await this.receiveBytes()
    console.log(buffer)
    this.#chipSelect(cs, false)
  }

  async Write8Data(reg, value) {
    await this.spiStream(this.cs, new Uint8Array([reg & 0x7F, value]), true);
  }
  
  async Read8Data(reg) {
    const res = await this.spiStream(this.cs, [reg | 0x80, 0x00], true);
    return res; 
  }
}
