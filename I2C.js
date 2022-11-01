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
  static I2C_LOW = 0
  static I2C_STANDARD = 1
  static I2C_FAST = 2
  static I2C_HIGH = 4

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

  async setAddr(addr) {
    this.addr = addr
  }

  async I2CDetect(i2c_addr) {
    const command = new Uint8Array([I2C.I2C, I2C.STA, I2C.OUT, i2c_addr << 1, I2C.STO, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.requestFrom()
    return (result & I2C.OUT) == 0
  }

  async WriteByte(bb) {
    const command = new Uint8Array([I2C.I2C, I2C.OUT, bb, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.requestFrom()
    return (result & I2C.OUT) == 0
  }

  async I2CStart() {
    const command = new Uint8Array([I2C.I2C, I2C.STA, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    await I2C.wait(I2C.I2C_TIMEOUT)
  }

  async I2CStop() {
    const command = new Uint8Array([I2C.I2C, I2C.STO, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    await I2C.wait(I2C.I2C_TIMEOUT)
  }

  async requestFrom() {
    await I2C.wait(I2C.I2C_TIMEOUT)
    const result = await this.device.transferIn(this.endpointIn, I2C.MAX);
    return new Uint8Array(result.data.buffer)
  }

  async ReadByteACK() {
    const command = new Uint8Array([I2C.I2C, I2C.IN_ACK, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.requestFrom()
    return result[0];
  }

  async ReadByteNAK() {
    const command = new Uint8Array([I2C.I2C, I2C.IN_NAK, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.requestFrom()
    return result[0];
  }

  async ReadGPIO(number) {
    const command = new Uint8Array([I2C.UIO, I2C.UIO_DIR, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.requestFrom()
    return (result & (1 << number)) != 0;
  }

  async read8(addr) {
    await this.I2CStart(_i2caddr);
    await this.write(addr);
    await this.I2CStop();

    await this.requestFrom(_i2caddr, 1);
    return await this.read();
  }

  async write8(addr, d) {
    await this.I2CStart(_i2caddr);
    await this.write(addr);
    await this.write(d);
    await this.I2CStop();
  }

}