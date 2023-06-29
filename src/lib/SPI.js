import { CH341 } from "./CH341.js"

export class SPI extends CH341 {
  static PACKET_LENGTH = 0x20
  static MAX_PACKETS = 256
  static MAX_PACKET_LEN = (SPI.PACKET_LENGTH * SPI.MAX_PACKETS)

  swapBytes(bytes) {
    const swap = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++)
      swap[i] = this.swapByte(bytes[i])
    return bytes
  }

  swapByte(byte) {
    let swap = 0;
    for (let i = 0; i < 8; ++i) {
      const bit = (byte >> i) & 1;
      swap |= (bit << (8 - i))
    }
    return swap;
  }

  async setSpeed(dspeed) {
    const command = dspeed ? new Uint8Array([CH341.CMD_I2C_STREAM, CH341.CMD_I2C_STM_SET, CH341.STM_SPI_DBL, CH341.CMD_I2C_STM_END]) :
      new Uint8Array([CH341.CMD_I2C_STREAM, CH341.CMD_I2C_STM_SET, CH341.CMD_I2C_STM_END]);
    await this.device.transferOut(this.endpointOut, command);
  }

  async ChipSelect(cs, enable) {
    const csio = [0x36, 0x35, 0x33, 0x27];
    const command = new Uint8Array([CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | enable ? csio[cs] : 0x37, CH341.CMD_UIO_STM_DIR | 0x3F, CH341.CMD_UIO_STM_END])
    await this.device.transferOut(this.endpointOut, command);
  }

  async SpiStream(cs, data) {
    const result = new Uint8Array(data.length)
    await this.ChipSelect(cs, true);
    for (let i = 0; i < Math.ceil(data.length / (SPI.PACKET_LENGTH - 1)); i += (SPI.PACKET_LENGTH - 1)) {
      const swappedData = this.swapBytes(data.subarray(i, i + SPI.PACKET_LENGTH - 1))
      const outbuf = new Uint8Array([CH341.CMD_SPI_STREAM, ...swappedData])
      const r = await this.device.transferOut(this.endpointOut, outbuf);
      console.log(r)
      const res = await this.receiveBytes(SPI.PACKET_LENGTH)
      console.log(res)
      for (let j = 0; j < SPI.PACKET_LENGTH; j++)result[SPI.PACKET_LENGTH * i + j] = this.swapByte(res[j])
    }
    await this.ChipSelect(cs, false);
    return result
  }

  async ReadStatus(cs) {
    await this.ChipSelect(cs, true)
    const command = new Uint8Array([CH341.CMD_SPI_STREAM, this.swapByte(0x05)]); // Read status
    const result = await this.device.transferOut(this.endpointOut, command);
    console.log(result)
    const buffer = await this.receiveBytes(SPI.PACKET_LENGTH)
    console.log(buffer)
    this.ChipSelect(cs, false)
  }

  async WriteStatus(cs) {
    await this.ChipSelect(cs, true)
    const commandWrite = new Uint8Array([CH341.CMD_SPI_STREAM, this.swapByte(0x06)]); // write status
    const result = await this.device.transferOut(this.endpointOut, commandWrite);
    console.log(result)
    const buffer = await this.receiveBytes(2)
    console.log(buffer)
    const commandWriteEnd = new Uint8Array([CH341.CMD_SPI_STREAM, this.swapByte(0x04)]); // write end
    await this.device.transferOut(this.endpointOut, commandWriteEnd);
    this.ChipSelect(cs, false)
  }
}
