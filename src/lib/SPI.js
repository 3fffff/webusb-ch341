import { CH341 } from "./CH341.js"

export class SPI extends CH341 {
  static MODE0 = 0x00
  static MODE1 = 0x04
  static MIN_FREQ = 400
  static MAX_FREQ = 1500000
  static CMD_SPI_STREAM = 0xA8
  static MAC_NUM_DEVICES = 4
  static LSB_FIRST = 1

  static PACKET_LENGTH = 0x20
  static MAX_PACKETS = 256
  static MAX_PACKET_LEN = (SPI.PACKET_LENGTH * SPI.MAX_PACKETS)

  swapByte(bytes) {
    let swap = 0;
    for (let i = 0; i < 8; ++i) {
      const bit = (bytes >> i) & 1;
      swap |= (bit << (8 - i))
    }
    return swap;
  }

  async ChipSelect(cs, enable) {
    const csio = [0x36, 0x35, 0x33, 0x27];
    const command = new Uint8Array([CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | enable ? csio[cs] : 0x37, CH341.CMD_UIO_STM_DIR | 0x3F, CH341.CMD_UIO_STM_END])
    await this.device.transferOut(this.endpointOut, command);
  }

  async SpiStream(cs, data) {
    const result = new Uint8Array(SPI.PACKET_LENGTH)
    await this.ChipSelect(cs, true);
    for (let i = 0; i < Math.ceil(data.length / (SPI.PACKET_LENGTH - 1)); i += (SPI.PACKET_LENGTH - 1)) {
      const outbuf = new Uint8Array([CH341.CMD_UIO_STREAM, ...data.subarray(i, i + SPI.PACKET_LENGTH - 1)])
      for (let j = 0; j < outbuf.length; j++)
        outbuf[j] = this.swapByte(outbuf[j])
      const r = await this.device.transferOut(this.endpointOut, outbuf);
      console.log(r)
      const res = await this.receiveBytes(SPI.PACKET_LENGTH)
      console.log(res)
    }
    await this.ChipSelect(cs, false);
    return result
  }

  async ReadStatus(cs) {
    await this.ChipSelect(cs, true)
    const command = new Uint8Array([this.swapByte(CH341.CMD_UIO_STREAM), this.swapByte(0x05)]); // Read status
    const result = await this.device.transferOut(this.endpointOut, command);
    console.log(result)
    const buffer = await this.receiveBytes(SPI.PACKET_LENGTH)
    console.log(buffer)
    this.ChipSelect(cs, false)
  }

  async WriteStatus(cs) {
    await this.ChipSelect(cs, true)
    const commandWrite = new Uint8Array([this.swapByte(CH341.CMD_UIO_STREAM), this.swapByte(0x06)]); // write status
    const result = await this.device.transferOut(this.endpointOut, commandWrite);
    console.log(result)
    const buffer = await this.receiveBytes(2)
    console.log(buffer)
    const commandWriteEnd = new Uint8Array([this.swapByte(CH341.CMD_UIO_STREAM), this.swapByte(0x04)]); // write end
    await this.device.transferOut(this.endpointOut, commandWriteEnd);
    this.ChipSelect(cs, false)
  }
}
