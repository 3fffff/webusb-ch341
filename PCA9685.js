class PCA9685 {

  // регистры для задания дополнительных адресов I2C
  static SUBADR1 = 0x02;
  static SUBADR2 = 0x03;
  static SUBADR3 = 0x04;

  static MODE1 = 0x00;//Mode register 1
  static PRESCALE = 0xFE;
  static LED0_ON_L = 0x06;// начальный регистр(адрес PWM#0)
  static LED0_ON_H = 0x07;
  static LED0_OFF_L = 0x08;
  static LED0_OFF_H = 0x09;
  static PWM_REG_BASE = 0x06; // начальный регистр(адрес PWM#0)
  static PWM_ALL_BASE = 0xFA; // регистр общего управления(только для записи)
  static PWM_REG_SIZE = 0x04; // размер одного регистра
  /**
      * Адрес для конкретного PWM можно рассчитать по формуле:
      * uint16_t pwm_addr = PWM_REG_BASE + PWM_REG_SIZE * PWM_NO;
      * Где PWM_NO - индекс в массиве(нумерация с нуля)
      *
      * Задать настройки сразу для всех PWM можно через регистр PWM_ALL
  **/
  static ALLLED_ON_L = 0xFA;// регистр общего управления(только для записи)
  static ALLLED_ON_H = 0xFB;
  static ALLLED_OFF_L = 0xFC;
  static ALLLED_OFF_H = 0xFD;
  static MODE1_RESTART = 1 << 7; // сброс PWM(см. документацию)
  static MODE1_EXTCLK = 1 << 6; // использовать внешнее тактирование
  static MODE1_AI = 1 << 5; // использовать режим автоинкремента регистра
  static MODE1_SLEEP = 1 << 4; // режим сна, отключает внутренний генератор
  static MODE1_SUB1 = 1 << 3; // разрешить отвечать по доп адресу №1
  static MODE1_SUB2 = 1 << 2; // разрешить отвечать по доп адресу №2
  static MODE1_SUB3 = 1 << 1; // разрешить отвечать по доп адресу №3
  static MODE1_ALLCALL = 1 << 0; // разрешить отвечать по общему адресу
  // смещение подрегистров
  static PWM_ON_L = 0x00;
  static PWM_ON_H = 0x0;
  static PWM_OFF_L = 0x02;
  static PWM_OFF_H = 0x03;
  constructor(dev) {
    this.dev = dev
    this.pre_right = -1000
    this.pre_left = -1000
  }

  async setPWMFreq(freq) {
    let prescaleval = 25000000.0;  // 25MHz
    prescaleval /= 4096.0;  // 12-bit
    prescaleval /= freq;
    prescaleval -= 1.0;
    console.log(`Setting PWM frequency to ${freq} Hz`);
    console.log(`Estimated pre-scale: ${prescaleval}`);
    const prescale = Math.floor(prescaleval + 0.5);
    console.log(`Final pre-scale: ${prescale}`);
    /*
    The write byte protocol is as follows:

    The master sends a start command (S).
    The master sends the 7-bit slave address followed by a write bit (R/W = 0).
    The addressed slave asserts an acknowledge (A) by pulling SDA low.
    The master sends an 8-bit register pointer.
    The slave acknowledges the register pointer.
    The master sends a data byte.
    The slave updates with the new data
    The slave acknowledges or not acknowledges the data byte. The next rising edge on SDA loads the data byte into its target register and the data becomes active.
    The master sends a stop condition (P) or a repeated start condition (Sr). 
    Issuing a P ensures that the bus input filters are set for 1MHz or slower operation.
    Issuing an Sr leaves the bus input filters in their current state.
     */

    const oldmode = await this.dev.ReadData(PCA9685.MODE1);
    const newmode = ((oldmode & 0x7F) | 0x10); //# sleep
    const r = await this.dev.WriteData(PCA9685.MODE1, newmode);  //# go to sleep
    const r1 = await this.dev.WriteData(PCA9685.PRESCALE, Math.floor(prescale));
    const r2 = await this.dev.WriteData(PCA9685.MODE1, oldmode);
    await dev.wait(5)
    const r3 = await this.dev.WriteData(PCA9685.MODE1, oldmode | 0x80);
  }

  async setPWM(channel, on, off) {
    console.log(`channel: ${channel}  LED_ON: ${on} LED_OFF: ${off}`);
    const r0 = await this.dev.WriteData(PCA9685.LED0_ON_L + 4 * channel, on & 0xFF);
    const r1 = await this.dev.WriteData(PCA9685.LED0_ON_H + 4 * channel, on >> 8);
    const r2 = await this.dev.WriteData(PCA9685.LED0_OFF_L + 4 * channel, off & 0xFF);
    const r3 = await this.dev.WriteData(PCA9685.LED0_OFF_H + 4 * channel, off >> 8);
  }
  async setServoPulse(channel, pulse) {
    pulse = (pulse * 4096 / 20000);  // PWM frequency is 50HZ,the period is 20000us
    await await this.setPWM(channel, 0, pulse);
  }

  _map(x, in_min = 0, in_max = 180, out_min = 500, out_max = 2500) {
    return ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
  }

  async setMotoPulse(channel, pulse) {
    if (pulse > 4095) await this.setPWM(channel, 0, 4095);
    else await this.setPWM(channel, 0, pulse);
  }

  async setServoAngle(channel, angle) {
    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;
    await this.setServoPulse(channel, this._map(angle));
  }

  async driveMotor(left, right) {
    if (Math.abs(left - this.pre_left) >= 2) {
      if (left >= 0) this.setMotoPulse(0, 0)
      else await this.setMotoPulse(0, 4095)
      await this.setMotoPulse(1, Math.floor(Math.abs(left) * 4095 / 255))
      this.pre_left = left
    }

    if (Math.abs(right - this.pre_right) >= 2) {
      if (right >= 0) this.setMotoPulse(2, 0)
      else await this.setMotoPulse(2, 4095)
      await this.setMotoPulse(3, Math.floor(Math.abs(right) * 4095 / 255))
      this.pre_right = right
    }
  }

  async analogWrite(channel, value) {
    if (value < 0) value = 0
    if (value > 255) value = 255
    await this.setMotoPulse(channel, Math.floor(Math.abs(value) * 4095 / 255))
  }
}