import { CH341 } from "./CH341.js"

export class I2C extends CH341 {
  //I2C commands
  static STA = 0x74
  static STO = 0x75
  static OUT = 0x80
  static IN = 0xC0
  static IN_ACK = I2C.IN | 1
  static IN_NAK = I2C.IN | 0
  static MAX = 32 // min (0x3f, 32) ?! (wrong place for this)
  static SET = 0x60 // bit 7 apparently SPI bit order, bit 2 spi single vs spi double
  static US = 0x40 // vendor code uses a few of these in 20khz mode?
  static MS = 0x50
  static DLY = 0x0F
  static UIO = 0xAB
  static UIO_DIR = 0x40
  static END = 0x00 // Finish commands with this. is this really necessary?
  static MAX_CHUNK = 32
  static MAX_WRITE_CHUNK = 29

  //I2C speed
  static I2CSpeed = {
    20: 0,
    100: 1,
    400: 2,
    750: 3
  }

  static MEMW = 0xA6 // aka mCH341_PARA_CMD_W0
  static MEMR = 0xAC // aka mCH341_PARA_CMD_R0
  static SPI = 0xA8
  static SIO = 0xA9
  static I2C = 0xAA
  static I2C_STATUS = 0x52
  static I2C_COMMAND = 0x53
  static I2C_AddressMin = 0;
  static I2C_AddressMax = 0x7F;
  static I2C_TIMEOUT = 10

  setAddr(addr) {
    this.addr = addr
  }

  async I2CDetect(i2c_addr) {
    const command = new Uint8Array([I2C.I2C, I2C.STA, I2C.OUT, i2c_addr << 1, I2C.STO, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const buffer = await this.receiveBytes()
    const result = new Uint8Array(buffer)
    return (result[0] & I2C.OUT) == 0
  }

  async I2CStart() {
    const command = new Uint8Array([I2C.I2C, I2C.STA, I2C.END])
    const result = await this.device.transferOut(this.endpointOut, command);
    return result
  }

  async I2CStop() {
    const command = new Uint8Array([I2C.I2C, I2C.STO, I2C.END])
    const result = await this.device.transferOut(this.endpointOut, command);
    return result
  }

  async setSpeed(speed) {
    const command = new Uint8Array([I2C.I2C, I2C.SET | I2C.I2CSpeed[speed], I2C.END])
    await this.device.transferOut(this.endpointOut, command);
  }

  async WriteByte(bb) {
    const command = new Uint8Array([I2C.I2C, I2C.OUT, bb, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveBytes()
    const result = new Uint8Array(request)
    return (result[0] & I2C.OUT) == 0
  }

  async Write8Data(reg, bb, reg16bit = false) {
    const b = new Uint8Array([bb])
    await this.WriteData(reg, b, reg16bit)
  }
  async Write16Data(reg, bb, reg16bit = false) {
    const b = new Uint8Array([(bb >> 8) & 0xFF, bb & 0xFF])
    await this.WriteData(reg, b, reg16bit)
  }

  async Write32Data(reg, bb, reg16bit = false) {
    const b = new Uint8Array([(bb >> 24) & 0xFF, (bb >> 16) & 0xFF, (bb >> 8) & 0xFF, bb & 0xFF])
    await this.WriteData(reg, b, reg16bit)
  }
  /*
   * TRANSMISSION TIMEOUT RETURN VALUES
   *
   * Return values for new functions that use the timeOut feature
   * will now return at what point in the transmission the timeout
   * occurred. Looking at a full communication sequence between a
   * master and slave (transmit data and then readback data) there
   * a total of 7 points in the sequence where a timeout can occur.
   * These are listed below and correspond to the returned value:
   * 1 - Waiting for successful completion of a Start bit
   * 2 - Waiting for ACK/NACK while addressing slave in transmit mode (MT)
   * 3 - Waiting for ACK/NACK while sending data to the slave
   * 4 - Waiting for successful completion of a Repeated Start
   * 5 - Waiting for ACK/NACK while addressing slave in receiver mode (MR)
   * 6 - Waiting for ACK/NACK while receiving data from the slave
   * 7 - Waiting for successful completion of the Stop bit
   *
   * All possible return values:
   * 0           Function executed with no errors
   * 1 - 7       Timeout occurred, see above list
   * 8 - 0xFF    See datasheet for exact meaning
   */

  async ReadByteAck(Nak = false) {
    const command = new Uint8Array([I2C.I2C, !Nak ? I2C.IN_ACK : I2C.IN_NAK, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveBytes()
    const result = new Uint8Array(request)
    return result[0];
  }

  async ReadBytes(len = 1) {
    const output = [];
    for (let offset = 0; offset < len; offset += I2C.MAX_CHUNK) {
      const chunkLen = Math.min(len - offset, I2C.MAX_CHUNK);
      const isLast = (offset + chunkLen) >= len;
      const lastCmd = isLast ? I2C.IN : I2C.IN_ACK;

      const readCmd = chunkLen === 1
        ? [lastCmd]
        : [I2C.IN | (chunkLen - 1), lastCmd];

      const command = new Uint8Array([I2C.I2C, ...readCmd, I2C.END]);
      await this.device.transferOut(this.endpointOut, command);

      const result = await this.receiveBytes(chunkLen);
      output.push(...new Uint8Array(result));
    }
    return output;
  }

  async Read8Data(reg, reg16bit) {
    const request = await this.ReadData(reg, 1, reg16bit)
    return new Uint8Array(request)[0]
  }
  async Read16Data(reg, reg16bit) {
    const request = await this.ReadData(reg, 2, reg16bit)
    return new Uint16Array(request)[0]
  }
  async Read32Data(reg, reg16bit) {
    const request = await this.ReadData(reg, 4, reg16bit)
    return new Uint32Array(request)[0]
  }
  /*
  Master Reads from a Slave
  1 Send a START
  2 Send I²C address of the SLAVE with the R/W bit low: Addresses the chip. 
  The slave 7-bit address is ‘1101000’., so we will send: 11010000
  3 Send device register you want to read
  4 Send a START sequence again
  5 Send I²C address of the SLAVE with the R/W bit high
  6 Read data byte from SLAVE
  7 Stop bit
  */
  async ReadData(reg, len = 1, reg16bit = false, autoIncReg = true) {
    const ackCount = reg16bit ? 4 : 3;
    const maxPayload = I2C.MAX_CHUNK - ackCount;
    const output = new Uint8Array(len);

    let offset = 0;
    let currentReg = reg;

    while (offset < len) {
      const chunkLen = Math.min(len - offset, maxPayload);
      const readCmd = chunkLen === 1
        ? [I2C.IN]
        : [I2C.IN | (chunkLen - 1), I2C.IN];

      const header = reg16bit
        ? [
          I2C.I2C, I2C.STA,
          I2C.OUT, this.addr << 1,
          I2C.OUT, (currentReg >> 8) & 0xFF,
          I2C.OUT, currentReg & 0xFF,
          I2C.STA,
          I2C.OUT, (this.addr << 1) | 1
        ]
        : [
          I2C.I2C, I2C.STA,
          I2C.OUT, this.addr << 1,
          I2C.OUT, currentReg & 0xFF,
          I2C.STA,
          I2C.OUT, (this.addr << 1) | 1
        ];

      const command = new Uint8Array([...header, ...readCmd, I2C.STO, I2C.END]);

      await this.device.transferOut(this.endpointOut, command);
      const buffer = await this.receiveBytes(ackCount + chunkLen);

      output.set(new Uint8Array(buffer, ackCount, chunkLen), offset);

      offset += chunkLen;
      if (autoIncReg) currentReg += chunkLen;
    }

    return output.buffer;
  }

  async WriteData(reg, data, reg16bit = false, autoIncReg = false) {
    const addrBytes = reg16bit
      ? [this.addr << 1, (reg >> 8) & 0xFF, reg & 0xFF]
      : [this.addr << 1, reg & 0xFF];

    // (32 - 5 service byte [I2C, STA, OUT|N, STO, END] = 27 bytes for address + data)
    const maxSinglePayload = 27 - addrBytes.length; // 25 bytes for 8-bits reg, 24 bytes for 16-bits reg
    for (let offset = 0; offset < data.length; offset += maxSinglePayload) {
      const chunk = data.subarray(offset, offset + maxSinglePayload);
      const totalLen = addrBytes.length + chunk.length;
      const command = new Uint8Array([
        I2C.I2C,
        I2C.STA,
        I2C.OUT | totalLen,
        ...addrBytes,
        ...chunk,
        I2C.STO,
        I2C.END
      ]);
      if (autoIncReg) {
        if (reg16bit) {
          addrBytes[1] = ((reg + offset) >> 8) & 0xFF
          addrBytes[2] = (reg + offset) & 0xFF
        } else {
          addrBytes[1] = (reg + offset) & 0xFF
        }
      }
      await this.device.transferOut(this.endpointOut, command);
    }
  }

  async WriteRegAddr(reg, reg16bit) {
    if (!reg16bit)
      await this.WriteByte(reg);
    else {
      await this.WriteByte((reg >> 8) & 0xFF);//MSB
      await this.WriteByte(reg & 0xFF);//LSB
    }
  }
}
