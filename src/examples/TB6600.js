export class TB6600 {
  constructor(dev) {
    this.dev = dev
  }

  async MotorMove(duration, reverse = false) {
    await this.dev.SetupPin(0x00)
    console.log(`DIR set to LOW - Moving Forward`)
    reverse ? await this.dev.SetupPin(0x01) : await this.dev.SetupPin(0x03)
    console.log('Controller PUL being driven.')
    for (let i = 0; i < duration; i++) {
      reverse ? await this.dev.SetupPin(0x07) : await this.dev.SetupPin(0x05)
      await this.dev.wait(1)
      const resen1 = await this.dev.GetPinsStatus()
      console.log(resen1)
      reverse ? await this.dev.SetupPin(0x03) :await this.dev.SetupPin(0x01)
      await this.dev.wait(1)
      const resen2 = await this.dev.GetPinsStatus()
      console.log(resen2)
    }
    await this.dev.SetupPin(0x00)//set D0-D6 to 0 0x3F to 1
    console.log('ENA set to LOW')
    await this.dev.wait(5) // pause for possible change direction
    const resen3 = await this.dev.GetPinsStatus()
    console.log(resen3)
  }
}