class I2C extends CH341 {
  //I2C commands
  static STA = 0x74
  static STO = 0x75
  static OUT = 0x80
  static IN = 0xc0
  static IN_ACK = I2C.IN | 1
  static IN_NAK = I2C.IN | 0
  static MAX = 32 // min (0x3f, 32) ?! (wrong place for this)
  static SET = 0x60 // bit 7 apparently SPI bit order, bit 2 spi single vs spi double
  static US = 0x40 // vendor code uses a few of these in 20khz mode?
  static MS = 0x50
  static DLY = 0x0f
  static END = 0x00 // Finish commands with this. is this really necessary?

  //I2C speed
  static I2CSpeed = {
    100: 0,
    400: 1,
    750: 2,
    1000: 3
  }

  static UIO_IN = 0x00
  static UIO_OUT = 0x80
  static UIO_DIR = 0x40
  static UIO_END = 0x20

  static MEMW = 0xA6 // aka mCH341_PARA_CMD_W0
  static MEMR = 0xAC // aka mCH341_PARA_CMD_R0
  static SPI = 0xA8
  static SIO = 0xA9
  static I2C = 0xAA
  static UIO = 0xAB
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
    const buffer = await this.receiveByte()
    const result = new Uint8Array(buffer)
    return (result[0] & I2C.OUT) == 0
  }

  async I2CStart() {
    const command = new Uint8Array([I2C.I2C, I2C.STA, I2C.END])
    const result = await this.device.transferOut(this.endpointOut, command);
    await I2C.wait(I2C.I2C_TIMEOUT)
    return result
  }

  async I2CStop() {
    const command = new Uint8Array([I2C.I2C, I2C.STO, I2C.END])
    const result = await this.device.transferOut(this.endpointOut, command);
    await I2C.wait(I2C.I2C_TIMEOUT)
    return result
  }

  async setSpeed(speed) {
    const command = new Uint8Array([I2C.I2C, I2C.SET | I2CSpeed[speed], I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.receiveByte()
    return (result[0] & I2C.OUT) == 0
  }

  async WriteByte(bb) {
    const command = new Uint8Array([I2C.I2C, I2C.OUT, bb, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveByte()
    const result = new Int8Array(request)
    return (result[0] & I2C.OUT) == 0
  }

  async Write8Data(reg, bb, reg16bit) {
    const b = new Uint16Array([bb])
    await this.WriteData(reg, b, reg16bit)
  }
  async Write16Data(reg, bb, reg16bit) {
    const b = new Uint8Array([(bb >> 8) & 0xFF, bb & 0xFF])
    await this.WriteData(reg, b, reg16bit)
  }

  async Write32Data(reg, bb, reg16bit) {
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
  async receiveByte() {
    await I2C.wait(I2C.I2C_TIMEOUT)
    const result = await this.device.transferIn(this.endpointIn, I2C.MAX);
    //console.log(result.data.buffer.byteLength)
    return result.data.buffer
  }

  async ReadByteAck() {
    const command = new Uint8Array([I2C.I2C, I2C.IN_ACK, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveByte()
    const result = new Uint8Array(request)
    return result[0];
  }

  async ReadByteNak() {
    const command = new Uint8Array([I2C.I2C, I2C.IN_NAK, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveByte()
    const result = new Uint8Array(request)
    return result[0];
  }

  async ReadByte(number) {
    const command = new Uint8Array([I2C.UIO, I2C.UIO_DIR, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveByte()
    const result = new Uint8Array(request)
    return (result[0] & (1 << number));
  }

  async Read8Data(reg, reg16bit) {
    return await ReadData(reg, len = 1, reg16bit)
  }
  async Read16Data(reg, reg16bit) {
    return await ReadData(reg, len = 2, reg16bit)
  }
  async Read32Data(reg, reg16bit) {
    return await ReadData(reg, len = 4, reg16bit)
  }

  async ReadData(reg, len = 1, reg16bit = false) {
    const data = new Uint8Array(len)
    await this.I2CStart();
    await this.WriteByte(this.addr << 1);
    await this.WriteRegAddr(reg, reg16bit)
    await this.I2CStop();
    await this.I2CStart();
    await this.WriteByte(this.addr << 1 | 1);
    await this.ReadByteAck();
    for (let i = 0; i < data.length; i++){
      data[i] = await this.ReadByte(reg);
      await this.ReadByteNak();
    }
    await this.I2CStop();
    return data;
  }

  async WriteData(reg, data, reg16bit = false) {
    const result = new Uint8Array(data.length)
    await this.I2CStart();
    await this.WriteByte(this.addr << 1);
    await this.WriteRegAddr(reg, reg16bit)
    for (let i = 0; i < data.length; i++)
      result[i] = await this.WriteByte(data[i]);
    await this.I2CStop();
    return result;
  }
  async WriteRegAddr(reg, reg16bit) {
    if (!reg16bit)
      await this.WriteByte(reg);
    else {
      await this.WriteByte(reg >> 8);//MSB
      await this.WriteByte(reg & 0xFF);//LSB
    }
  }
}
