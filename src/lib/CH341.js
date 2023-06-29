export class CH341 {
  static REQUEST_READ_VERSION = 0x5F
  static USB_CONFIG_STANDARD = 1
  static INTERFACE = 0
  //pins 
  static ERR = 0x100
  static PEMP = 0x200
  static INT = 0x400
  static SLCT = 0x800
  static WAIT = 0x2000
  static DATAS = 0x4000
  static ADDRS = 0x8000
  static RESET = 0x10000
  static DXX = 0xff000000
  static MAX_PIN_READ = 7
  static MAX_PIN_WRITE = 5

  static CMD_SPI_STREAM = 0xA8
  static CMD_SIO_STREAM = 0xA9
  static CMD_I2C_STREAM = 0xAA
  static CMD_UIO_STREAM = 0xAB
  static STM_SPI_DBL = 0x04
  static USB_TIMEOUT = 10

  static DEV_CONTROL_CFG = 0xC0
  static DEV_CONTROL_BUF_LEN = 8

  //CH341 pin
  static D0 = 0x01
  static D1 = 0x02
  static D2 = 0x04
  static D3 = 0x08
  static D4 = 0x10
  static D5 = 0x20
  static GPIO_NUM_PINS = 16    /* Number of GPIO pins */
  static ActivePins = 0

  static PARA_CMD_STS = 0xA0  /* Get pins status */

  static CMD_UIO_STM_IN = 0x00  /* UIO interface IN command (D0~D7) */
  static CMD_UIO_STM_OUT = 0x80  /* UIO interface OUT command (D0~D5) */
  static CMD_UIO_STM_DIR = 0x40  /* UIO interface DIR command (D0~D5) */
  static CMD_UIO_STM_END = 0x20  /* UIO interface END command */
  static US_MASK = 0x1F  //Up to 32 (approx) us delay
  static CMD_UIO_STM_US = 0xC0
  static DELAY_US = CH341.CMD_UIO_STM_US | 1
  static DELAY_31US = CH341.CMD_UIO_STM_US | CH341.US_MASK
  static DELAY_10US = CH341.CMD_UIO_STM_US | 10
  static async requestDevice(filters) {
    const device = await navigator.usb.requestDevice({
      filters: filters || [
        { vendorId: 0x1a86, productId: 0x5512 },
        { vendorId: 0x1a86, productId: 0x5523 },
        { vendorId: 0x1a86, productId: 0xcc15 },
      ]
    }).catch(e => null);
    if (!device) {
      console.log('no device matched');
      return;
    }
    return device;
  }

  async readVersionString() {
    console.log('readVersionString');
    const result = await this.device.controlTransferIn({
      requestType: "vendor",
      recipient: "device",
      request: CH341.REQUEST_READ_VERSION,
      value: 0,
      index: 0,
    }, 255);
    console.log(result);
    if (result.status !== 'ok') {
      throw 'failed to readVersionString';
    }
    return String.fromCharCode(...new Uint8Array(result.data.buffer));
  }

  async open(device) {
    if (this.device) {
      await this.exit();
    }

    console.log(device);
    console.log('open device', device);
    await device.open();
    console.log('selectConfiguration', CH341.USB_CONFIG_STANDARD);
    await device.selectConfiguration(CH341.USB_CONFIG_STANDARD);
    console.log('claimInterface');
    await device.claimInterface(CH341.INTERFACE);
    console.log('device was opened');

    this.device = device;

    const configInterfaces = this.device.configuration.interfaces;
    configInterfaces.forEach(element => {
      element.alternates.forEach(elementalt => {
        if (elementalt.interfaceClass === 0xff) {
          this.interfaceNumber = element.interfaceNumber;
          elementalt.endpoints.forEach(elementendpoint => {
            //This part here get the bulk in and out endpoints programmatically
            if (elementendpoint.direction === "out" && elementendpoint.type === "bulk") {
              this.endpointOut = elementendpoint.endpointNumber;
              this.endpointOutPacketSize = elementendpoint.packetSize;
            }
            if (elementendpoint.direction === "in" && elementendpoint.type === "bulk") {
              this.endpointIn = elementendpoint.endpointNumber;
              this.endpointInPacketSize = elementendpoint.packetSize;
            }
          })
        }
      })
    })
  }

  async SetupPin(pin) {
    const command = new Uint8Array([CH341.CMD_UIO_STREAM, CH341.CMD_UIO_STM_DIR | 0x3F,// mask for D0-D5
     CH341.CMD_UIO_STM_OUT | pin, CH341.CMD_UIO_STM_END]);
    await this.device.transferOut(this.endpointOut, command);
  }

  async clearPins() {
    this.ActivePins = 0
    await this.SetupPin(0x3F, false)
  }

  /* The status command returns 6 bytes of data. Byte 0 has
   * status for lines 0 to 7, and byte 1 is lines 8 to 15. The
   * 3rd has the status for the SCL/SDA/SCK pins. The 4th byte
   * might have some remaining pin status. Byte 5 and 6 content
   * is unknown.
   */
  async GetPinsStatus() {
    let res = ""
    const command = new Uint8Array([CH341.PARA_CMD_STS])
    await this.device.transferOut(this.endpointOut, command);
    const request = await this.receiveBytes(6)
    const result = new Uint8Array(request)
    for (let i = 0; i < result.length; i++)
      res += (result[i] >>> 0).toString(2) + "|"
    return res;
  }

  async ReadPin(number) {
    const command = new Uint8Array([I2C.UIO, I2C.UIO_DIR, I2C.END])
    await this.device.transferOut(this.endpointOut, command);
    const result = await this.receiveBytes()
    return (result[0] & (1 << number));
  }

  async receiveBytes(bits = 32) {
    await this.wait(CH341.USB_TIMEOUT)
    const result = await this.device.transferIn(this.endpointIn, bits);
    return result.data.buffer
  }

  async exit() {
    console.log('exit');
    await this.device.close();
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}