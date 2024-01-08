import { CH341 } from "./CH341.js"

export class SPI extends CH341 {
  static PACKET_LENGTH = 0x20
  static MAX_PACKETS = 256
  static MAX_PACKET_LEN = (SPI.PACKET_LENGTH * SPI.MAX_PACKETS)
  static lsb = true
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

  async setSpeed(dspeed = false) {
    const command = dspeed ? new Uint8Array([CH341.CMD_I2C_STREAM, CH341.CMD_I2C_STM_SET, CH341.STM_SPI_DBL, CH341.CMD_I2C_STM_END]) :
      new Uint8Array([CH341.CMD_I2C_STREAM, CH341.CMD_I2C_STM_SET, CH341.CMD_I2C_STM_END]);
    await this.device.transferOut(this.endpointOut, command);
  }

  async ChipSelect(cs, enable) {
    const csio = [0x36, 0x35, 0x33, 0x27];
    const command = new Uint8Array(enable ? [CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | csio[cs], CH341.CMD_UIO_STM_DIR | 0x3F, CH341.CMD_UIO_STM_END] : [CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | 0x37, CH341.CMD_UIO_STM_END])
    await this.device.transferOut(this.endpointOut, command);
  }

  async SpiStream(cs, data) {
    const result = new Uint8Array(data.length)
    const packets = Math.ceil(data.length / (SPI.PACKET_LENGTH - 1))
    await this.ChipSelect(cs, true);
    const sendStream = new Uint8Array([CH341.CMD_SPI_STREAM])
    await this.device.transferOut(this.endpointOut, sendStream);
    await this.receiveBytes()
    for (let i = 0; i < packets; i++) {
      const swappedData = this.swapBytes(data.subarray(i * SPI.PACKET_LENGTH, i * SPI.PACKET_LENGTH + SPI.PACKET_LENGTH))
      const outbuf = new Uint8Array([...swappedData])
      await this.device.transferOut(this.endpointOut, outbuf);
      const result = await this.receiveBytes(SPI.PACKET_LENGTH)
      console.log(result)
      for (let j = 0; j < SPI.PACKET_LENGTH; j++)result[SPI.PACKET_LENGTH * i + j] = this.swapByte(res[j])
    }
    await this.ChipSelect(cs, false);
    return result
  }

  async ReadByte(cs, byte) {
    await this.ChipSelect(cs, true)
    const command = new Uint8Array([CH341.CMD_SPI_STREAM, byte, 0x00, 0x00, 0x00, 0x00, 0x00]); // Read status
    const result = await this.device.transferOut(this.endpointOut, command);
    console.log(result)
    const buffer = await this.receiveBytes()
    console.log(buffer)
    this.ChipSelect(cs, false)
  }

  async WriteByte(cs, byte) {
    await this.ChipSelect(cs, true)
    const commandWrite = new Uint8Array([CH341.CMD_SPI_STREAM, this.swapByte(byte)]); // write status
    const result = await this.device.transferOut(this.endpointOut, commandWrite);
    console.log(result)
    const buffer = await this.receiveBytes()
    console.log(buffer)
    const commandWriteEnd = new Uint8Array([CH341.CMD_SPI_STREAM, this.swapByte(byte)]); // write end
    await this.device.transferOut(this.endpointOut, commandWriteEnd);
    this.ChipSelect(cs, false)
  }
}
