import { CH341 } from "./CH341.js"

export class UART extends CH341 {
  static DEFAULT_BAUD_RATE = 115200

  static REQUEST_READ_REGISTRY = 0x95
  static REQUEST_WRITE_REGISTRY = 0x9A
  static REQUEST_SERIAL_INITIATION = 0xA1
  static REG_SERIAL = 0xC29C
  static REG_MODEM_OUT = 0xA4
  static REG_MODEM_VALUE_OFF = 0xFF
  static REG_MODEM_VALUE_ON = 0xDF
  static REG_MODEM_VALUE_CALL = 0x9F
  static REG_BAUD_FACTOR = 0x1312
  static REG_BAUD_OFFSET = 0x0F2C
  static REG_BAUD_LOW = 0x2518
  static REG_CONTROL_STATUS = 0x2727
  static BUFFER_SIZE = 1024
  static BAUD_RATE = {
    600: { "FACTOR": 0x6481, "OFFSET": 0x76 },
    1200: { "FACTOR": 0xB281, "OFFSET": 0x3B },
    2400: { "FACTOR": 0xD981, "OFFSET": 0x1E },
    4800: { "FACTOR": 0x6482, "OFFSET": 0x0F },
    9600: { "FACTOR": 0xB282, "OFFSET": 0x08 },
    14400: { "FACTOR": 0xd980, "OFFSET": 0xEB },
    19200: { "FACTOR": 0xD982, "OFFSET": 0x07 },
    38400: { "FACTOR": 0x6483, "OFFSET": null },
    57600: { "FACTOR": 0x9883, "OFFSET": null },
    115200: { "FACTOR": 0xCC83, "OFFSET": null },
    230500: { "FACTOR": 0xE683, "OFFSET": null },
  }

  //for CMD 0xA4
  static UART_CTS = 0x01
  static UART_DSR = 0x02
  static UART_RING = 0x04
  static UART_DCD = 0x08
  static CONTROL_OUT = 0x10
  static CONTROL_DTR = 0x20
  static CONTROL_RTS = 0x40

  static UART_STATE = 0x00
  static UART_OVERRUN_ERROR = 0x01
  static UART_PARITY_ERROR = 0x02
  static UART_FRAME_ERROR = 0x06
  static UART_RECV_ERROR = 0x02
  static UART_STATE_TRANSIENT_ERROR = 0x07

  async setBaudRate(baudRate) {
    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_BAUD_FACTOR, UART.BAUD_RATE[baudRate].FACTOR);
    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_BAUD_OFFSET, UART.BAUD_RATE[baudRate].OFFSET);
    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_CONTROL_STATUS);
  }

  async TxRequest(request, mode, interface_ = 0) {
    console.log('transferRequest', mode);
    const result = await this.device.controlTransferOut({
      requestType: "vendor",
      recipient: "device",
      request: request,
      value: mode,
      index: interface_
    })
    if (result.status !== 'ok') throw 'failed to setTransceiverMode';
  }

  async RxRequest(request, mode, interface_ = 0) {
    console.log('transferRequest', mode);
    let data = new DataView(new ArrayBuffer(UART.BUFFER_SIZE))
    const result = await this.device.controlTransferIn({
      requestType: "vendor",
      recipient: "device",
      request: request,
      value: mode,
      index: interface_
    }, data)
    if (result.status !== 'ok') throw 'failed to setTransceiverMode';
    return result
  }

  async startRx(callback) {
    if (this.rxRunning) throw "already started";
    const transfer = async (resolve) => {
      const result = await this.device.transferIn(this.endpointIn, UART.BUFFER_SIZE);
      if (this.rxRunning) transfer(resolve);
      else resolve();
      if (result) {
        if (result.status !== 'ok') throw 'failed to get transfer';
        callback(new Uint8Array(result.data.buffer));
      }
    }
    this.rxRunning = [
      new Promise(resolve => transfer(resolve)),
      new Promise(resolve => transfer(resolve))
    ];
  }

  async sendCommandTx(str) {
    const data = new TextEncoder('utf-8').encode(str);
    const result = await this.device.transferOut(this.endpointOut, data);
    console.log(result)
  }

  async stopRx() {
    if (this.rxRunning) {
      console.log('stopRx waiting');
      const promises = this.rxRunning;
      console.log(promises);
      this.rxRunning = null;
      await Promise.all(promises);
    }
    console.log('stopRx');
    await this.RxRequest(UART.REG_MODEM_OUT, UART.REG_MODEM_VALUE_OFF);
  }

  async initUART(baudRate) {
    await this.TxRequest(UART.REQUEST_SERIAL_INITIATION, UART.REG_SERIAL, 0xB2B9)  // first request...
    await this.TxRequest(UART.REG_MODEM_OUT, UART.REG_MODEM_VALUE_ON);
    await this.TxRequest(UART.REG_MODEM_OUT, UART.REG_MODEM_VALUE_CALL);
    await this.RxRequest(UART.REQUEST_READ_REGISTRY, 0x0706);

    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_CONTROL_STATUS);
    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_BAUD_FACTOR, 0xB282);
    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_BAUD_OFFSET, 0x0008);
    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_BAUD_LOW, 0x00C3);
    await this.RxRequest(UART.REQUEST_READ_REGISTRY, 0x0706, 2);

    await this.TxRequest(UART.REQUEST_WRITE_REGISTRY, UART.REG_CONTROL_STATUS);
    await this.setBaudRate(baudRate);
  }
}
