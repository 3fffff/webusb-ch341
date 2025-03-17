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

  async #chipSelect(cs, enable) {
    const csio = [0x36, 0x35, 0x33, 0x27];
    const command = new Uint8Array(enable ? [CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | csio[cs], CH341.CMD_UIO_STM_DIR | 0x3F, CH341.CMD_UIO_STM_END] : [CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_OUT | 0x37, CH341.CMD_UIO_STM_END])
    await this.device.transferOut(this.endpointOut, command);
  }

  async spiStream(cs, data, swap = false) {
    const result = []
    const packets = ~~(data.length / SPI.MAX_PACKETS)
    const rest = data.length - packets * SPI.MAX_PACKETS
    await this.#chipSelect(cs, true);
    for (let i = 0; i < packets; i++) {
      if (swap) {
        const swappedData = this.swapBytes(chunk)
        await this.device.transferOut(this.endpointOut, new Uint8Array([CH341.CMD_SPI_STREAM, ...swappedData]));
      } else
        await this.device.transferOut(this.endpointOut, new Uint8Array([CH341.CMD_SPI_STREAM, ...chunk]));
      const res = await this.receiveBytes(SPI.PACKET_LENGTH)
      result.push(...new Uint8Array(res))
    }
    if (rest != 0) {
      const chunk = data.subarray(packets * SPI.PACKET_LENGTH, rest)
      if (swap) {
        const swappedData = this.swapBytes(chunk)
        await this.device.transferOut(this.endpointOut, new Uint8Array([CH341.CMD_SPI_STREAM, ...swappedData]));
      } else
        await this.device.transferOut(this.endpointOut, new Uint8Array([CH341.CMD_SPI_STREAM, ...chunk]));
      const res = await this.receiveBytes(rest)
      result.push(...new Uint8Array(res))
    }
    await this.#chipSelect(cs, false);
    return result
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
}
