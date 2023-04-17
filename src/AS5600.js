export class AS5600 {
  static I2C_ADDR = 0x36

  // CONGIG REGISTERS
  static REG_ZMCO = 0x00
  static REG_ZPOS = 0x01
  static REG_MPOS = 0x03
  static REG_MANG = 0x05
  static REG_CONF = 0x07
  // OUTPUT REGISTERS
  static REG_RAW_ANGLE = 0x0C
  static REG_ANGLE = 0x0E
  // STATUS REGISTERS
  static REG_STATUS = 0x0B
  static REG_AGC = 0x1A
  static REG_MAGNITUDE = 0x1B
  // BURN COMMANDS
  static REG_BURN = 0xFF

  static BURN_ANGLE = 0x80
  static BURN_SETTINGS = 0x40

  constructor(dev){
    this.dev = dev;
  }

  async getBurnCount() {
    return await this.dev.Read8Data(AS5600.REG_ZMCO);
  }

  async getAngle() {
    return await this.dev.Read16Data(AS5600.REG_ANGLE);
  }

  async getRawAngle() {
    return await this.dev.Read16Data(AS5600.REG_RAW_ANGLE);
  }

  async getStartPos() {
    return await this.dev.Read16Data(AS5600.REG_ZPOS);
  }

  async setStartPos(value) {
    await this.dev.Write16Data(AS5600.REG_ZPOS, value);
  }

  async getEndPos() {
    return await this.dev.Read16Data(AS5600.REG_MPOS);
  }

  async setEndPos(value) {
    await this.dev.Write16Data(AS5600.REG_MPOS, value);
  }

  async getMaxAngle() {
    return await this.dev.Read16Data(AS5600.REG_MANG);
  }

  async setMaxAngle(value) {
    await this.dev.Write16Data(AS5600.REG_MANG, value);
  }

  async getConfig() {
    const value = await this.dev.Read16Data(AS5600.REG_CONF);

    const low = value & 0x00FF;
    const high = value >> 8;

    return new Uint8Array([
      // low 8 bits
      (low & 0b00000011),      // powerMode 2 bits
      ((low & 0b00001100) >> 2), // hysteresis 2 bits
      ((low & 0b00110000) >> 4), // outputStage 4 bits
      ((low & 0b11000000) >> 6), // pwmFrequency 2 bits
      // high 6bits
      (high & 0b00000011),     // slowFilter 2 bits 
      ((high & 0b00011100) >> 2),// fast filter threshold 3 bits
      ((high & 0b00100000) >> 5)// watchdog 1 bit
    ]);
  }

  async setConfig(config) {
    const low = config.powerMode |
      config.hysteresis << 2 |
      config.outputStage << 4 |
      config.pwmFrequency << 6;

    const high = config.slowFilter |
      config.fastFilterThreshold << 2 |
      config.watchdog << 5;

    const value = high << 8 | low;
    await this.dev.Write16Data(AS5600.REG_CONF, value);
  }

  async getStatus() {
    const value = await this.dev.Read8Data(AS5600.REG_STATUS);
    console.log((value >> 3));
    const status_bool = new Uint8Array([
      value & (1 << 3), // bit3 is magnet high (too strong)
      value & (1 << 4), // bit4 bit is magnet low (too weak)
      value & (1 << 5)  // bit5 is magnet detected
    ]);
    return status_bool;
  }

  async getAutomaticGainControl() {
    return await this.dev.Read8Data(AS5600.REG_AGC);
  }

  async getMagnitude() {
    return await this.dev.Read16Data(AS5600.REG_MAGNITUDE);
  }

  /* HERE BE DRAGONS! */
  async burnAngle() {
    await this.dev.Write8Data(AS5600.REG_BURN, AS5600.BURN_ANGLE);
  }

  /* HERE BE DRAGONS! */
  async burnSettings() {
    await this.dev.Write8Data(AS5600.REG_BURN, AS5600.BURN_SETTINGS);
  }

}