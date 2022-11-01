class CH341 {
  static REQUEST_READ_VERSION = 0x5F
  static USB_CONFIG_STANDARD = 1
  static INTERFACE = 0

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

  async exit() {
    console.log('exit');
    await this.device.close();
  }

  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}