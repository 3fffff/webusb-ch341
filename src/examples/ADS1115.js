export class ADS1115 {
  static IIC_ADDRESS0 = 0x48
  static IIC_ADDRESS1 = 0x49

  // ADS1115 Register Map
  static REG_POINTER_CONVERT = 0x00 // Conversion register
  static REG_POINTER_CONFIG = 0x01 // Configuration register
  static REG_POINTER_LOWTHRESH = 0x02 // Lo_thresh register
  static REG_POINTER_HITHRESH = 0x03 // Hi_thresh register

  // ADS1115 Configuration Register
  static REG_CONFIG_OS_NOEFFECT = 0x00 // No effect
  static REG_CONFIG_OS_SINGLE = 0x80 // Begin a single conversion
  static REG_CONFIG_MUX_DIFF_0_1 = 0x00 // Differential P = AIN0, N = AIN1 (default)
  static REG_CONFIG_MUX_DIFF_0_3 = 0x10 // Differential P = AIN0, N = AIN3
  static REG_CONFIG_MUX_DIFF_1_3 = 0x20 // Differential P = AIN1, N = AIN3
  static REG_CONFIG_MUX_DIFF_2_3 = 0x30 // Differential P = AIN2, N = AIN3
  static REG_CONFIG_MUX_SINGLE_0 = 0x40 // Single-ended P = AIN0, N = GND
  static REG_CONFIG_MUX_SINGLE_1 = 0x50 // Single-ended P = AIN1, N = GND
  static REG_CONFIG_MUX_SINGLE_2 = 0x60 // Single-ended P = AIN2, N = GND
  static REG_CONFIG_MUX_SINGLE_3 = 0x70 // Single-ended P = AIN3, N = GND
  static REG_CONFIG_PGA_6_144V = 0x00 // +/-6.144V range = Gain 2/3
  static REG_CONFIG_PGA_4_096V = 0x02 // +/-4.096V range = Gain 1
  static REG_CONFIG_PGA_2_048V = 0x04 // +/-2.048V range = Gain 2 (default)
  static REG_CONFIG_PGA_1_024V = 0x06 // +/-1.024V range = Gain 4
  static REG_CONFIG_PGA_0_512V = 0x08 // +/-0.512V range = Gain 8
  static REG_CONFIG_PGA_0_256V = 0x0A // +/-0.256V range = Gain 16
  static REG_CONFIG_MODE_CONTIN = 0x00 // Continuous conversion mode
  static REG_CONFIG_MODE_SINGLE = 0x01 // Power-down single-shot mode (default)
  static REG_CONFIG_DR_8SPS = 0x00 // 8 samples per second
  static REG_CONFIG_DR_16SPS = 0x20 // 16 samples per second
  static REG_CONFIG_DR_32SPS = 0x40 // 32 samples per second
  static REG_CONFIG_DR_64SPS = 0x60 // 64 samples per second
  static REG_CONFIG_DR_128SPS = 0x80 // 128 samples per second (default)
  static REG_CONFIG_DR_250SPS = 0xA0 // 250 samples per second
  static REG_CONFIG_DR_475SPS = 0xC0 // 475 samples per second
  static REG_CONFIG_DR_860SPS = 0xE0 // 860 samples per second
  static REG_CONFIG_CMODE_TRAD = 0x00 // Traditional comparator with hysteresis (default)
  static REG_CONFIG_CMODE_WINDOW = 0x10 // Window comparator
  static REG_CONFIG_CPOL_ACTVLOW = 0x00 // ALERT/RDY pin is low when active (default)
  static REG_CONFIG_CPOL_ACTVHI = 0x08 // ALERT/RDY pin is high when active
  static REG_CONFIG_CLAT_NONLAT = 0x00 // Non-latching comparator (default)
  static REG_CONFIG_CLAT_LATCH = 0x04 // Latching comparator
  static REG_CONFIG_CQUE_1CONV = 0x00 // Assert ALERT/RDY after one conversions
  static REG_CONFIG_CQUE_2CONV = 0x01 // Assert ALERT/RDY after two conversions
  static REG_CONFIG_CQUE_4CONV = 0x02 // Assert ALERT/RDY after four conversions
  static REG_CONFIG_CQUE_NONE = 0x03 // Disable the comparator and put ALERT/RDY in high state (default)

  constructor(dev) {
    this.dev = dev;
  }

  setGain(gain) {
    this.gain = gain;
    if (gain == ADS1115.REG_CONFIG_PGA_6_144V)
      this.coefficient = 0.1875
    else if (gain == ADS1115.REG_CONFIG_PGA_4_096V)
      this.coefficient = 0.125
    else if (gain == ADS1115.REG_CONFIG_PGA_2_048V)
      this.coefficient = 0.0625
    else if (gain == ADS1115.REG_CONFIG_PGA_1_024V)
      this.coefficient = 0.03125
    else if (gain == ADS1115.REG_CONFIG_PGA_0_512V)
      this.coefficient = 0.015625
    else if (gain == ADS1115.REG_CONFIG_PGA_0_256V)
      this.coefficient = 0.0078125
    else this.coefficient = 0.125
  }

  async configSingle() {
    const CONFIG_REG = new Uint16Array([((ADS1115.REG_CONFIG_OS_SINGLE | ADS1115.REG_CONFIG_MUX_SINGLE_0 | this.gain | ADS1115.REG_CONFIG_MODE_CONTIN) << 8) | (ADS1115.REG_CONFIG_DR_128SPS | ADS1115.REG_CONFIG_CQUE_NONE)])
    await this.dev.Write16Data(ADS1115.REG_POINTER_CONFIG, CONFIG_REG[0])
  }

  async configDifferential() {
    const CONFIG_REG = new Uint16Array([((ADS1115.REG_CONFIG_OS_SINGLE | ADS1115.REG_CONFIG_MUX_DIFF_0_1 | this.gain | ADS1115.REG_CONFIG_MODE_CONTIN) << 8) | (ADS1115.REG_CONFIG_DR_128SPS | ADS1115.REG_CONFIG_CQUE_NONE)])
    await this.dev.Write16Data(ADS1115.REG_POINTER_CONFIG, CONFIG_REG[0])
  }

  async readData() {
    let data = await this.dev.Read16Data(ADS1115.REG_POINTER_CONVERT)
    //uint16 to int16
    if (data > 32767)
      data -= 65535
    da *= this.coefficient
    return data
  }
}