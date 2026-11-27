export class ICM20948 {
    static CHIP_ID = 0xEA
    static I2C_ADDR = 0x68
    static I2C_ADDR_ALT = 0x69
    static BANK_SEL = 0x7F

    static I2C_MST_ODR_CONFIG = 0x00
    static I2C_MST_CTRL = 0x01
    static I2C_MST_DELAY_CTRL = 0x02
    static I2C_SLV0_ADDR = 0x03
    static I2C_SLV0_REG = 0x04
    static I2C_SLV0_CTRL = 0x05
    static I2C_SLV0_DO = 0x06
    static EXT_SLV_SENS_DATA_00 = 0x3B

    static GYRO_SMPLRT_DIV = 0x00
    static GYRO_CONFIG_1 = 0x01
    static GYRO_CONFIG_2 = 0x02

    // Bank 0
    static WHO_AM_I = 0x00
    static USER_CTRL = 0x03
    static PWR_MGMT_1 = 0x06
    static PWR_MGMT_2 = 0x07
    static INT_PIN_CFG = 0x0F

    static ACCEL_SMPLRT_DIV_1 = 0x10
    static ACCEL_SMPLRT_DIV_2 = 0x11
    static ACCEL_INTEL_CTRL = 0x12
    static ACCEL_WOM_THR = 0x13
    static ACCEL_CONFIG = 0x14
    static ACCEL_XOUT_H = 0x2D
    static GRYO_XOUT_H = 0x33

    static TEMP_OUT_H = 0x39
    static TEMP_OUT_L = 0x3A

    static TEMPERATURE_DEGREES_OFFSET = 21
    static TEMPERATURE_SENSITIVITY = 333.87
    static ROOM_TEMP_OFFSET = 21

    static AK09916_I2C_ADDR = 0x0c
    static AK09916_CHIP_ID = 0x09
    static AK09916_WIA = 0x01
    static AK09916_ST1 = 0x10
    static AK09916_ST1_DOR = 0b00000010
    static AK09916_ST1_DRDY = 0b00000001
    static AK09916_HXL = 0x11
    static AK09916_ST2 = 0x18
    static AK09916_ST2_HOFL = 0b00001000
    static AK09916_CNTL2 = 0x31
    static AK09916_CNTL2_MODE = 0b00001111
    static AK09916_CNTL2_MODE_OFF = 0
    static AK09916_CNTL2_MODE_SINGLE = 1
    static AK09916_CNTL2_MODE_CONT1 = 2
    static AK09916_CNTL2_MODE_CONT2 = 4
    static AK09916_CNTL2_MODE_CONT3 = 6
    static AK09916_CNTL2_MODE_CONT4 = 8
    static AK09916_CNTL2_MODE_TEST = 16
    static AK09916_CNTL3 = 0x32

    constructor(dev) {
        this.dev = dev;
        this._bank = -1;
    }

    async bank(value) {
        if (this._bank !== value) {
            await this.dev.Write8Data(ICM20948.BANK_SEL, value << 4);
            this._bank = value;
        }
    }

    async setAccelerometerSampleRate(rate = 125) {
        await this.bank(2);
        rate = Math.floor((1125.0 / rate) - 1);
        await this.dev.Write8Data(ICM20948.ACCEL_SMPLRT_DIV_1, (rate >> 8) & 0xff);
        await this.dev.Write8Data(ICM20948.ACCEL_SMPLRT_DIV_2, rate & 0xff);
    }

    async setAccelerometerFullScale(scale = 16) {
        await this.bank(2);
        let value = (await this.dev.Read8Data(ICM20948.ACCEL_CONFIG)) & 0b11111001;
        value |= ({ 2: 0b00, 4: 0b01, 8: 0b10, 16: 0b11 }[scale] ?? 0b11) << 1;
        await this.dev.Write8Data(ICM20948.ACCEL_CONFIG, value);
    }

    async setAccelerometerLowPass(enabled = true, mode = 5) {
        await this.bank(2);
        let value = (await this.dev.Read8Data(ICM20948.ACCEL_CONFIG)) & 0b10001110;
        if (enabled) value |= 0b1;
        value |= (mode & 0x07) << 4;
        await this.dev.Write8Data(ICM20948.ACCEL_CONFIG, value);
    }

    async setGyroSampleRate(rate = 125) {
        await this.bank(2);
        rate = Math.floor((1125.0 / rate) - 1);
        await this.dev.Write8Data(ICM20948.GYRO_SMPLRT_DIV, rate);
    }

    async setGyroFullScale(scale = 250) {
        await this.bank(2);
        let value = (await this.dev.Read8Data(ICM20948.GYRO_CONFIG_1)) & 0b11111001;
        value |= ({ 250: 0b00, 500: 0b01, 1000: 0b10, 2000: 0b11 }[scale] ?? 0b00) << 1;
        await this.dev.Write8Data(ICM20948.GYRO_CONFIG_1, value);
    }

    async setGyroLowPass(enabled = true, mode = 5) {
        await this.bank(2);
        let value = (await this.dev.Read8Data(ICM20948.GYRO_CONFIG_1)) & 0b10001110;
        if (enabled) value |= 0b1;
        value |= (mode & 0x07) << 4;
        await this.dev.Write8Data(ICM20948.GYRO_CONFIG_1, value);
    }

    async magWrite(reg, value) {
        await this.bank(3);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_ADDR, ICM20948.AK09916_I2C_ADDR);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_REG, reg);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_DO, value);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_CTRL, 0x80 | 1);
        await this.bank(0);
        await this.triggerMagIO();
    }

    async magReadBytes(reg, len = 1) {
        await this.bank(3);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_ADDR, ICM20948.AK09916_I2C_ADDR | 0x80);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_REG, reg);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_CTRL, 0x80 | len);
        await this.bank(0);
        await this.triggerMagIO();
        return await this.dev.ReadData(ICM20948.EXT_SLV_SENS_DATA_00, len);
    }

    async magRead(reg) {
        await this.bank(3);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_ADDR, ICM20948.AK09916_I2C_ADDR | 0x80);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_REG, reg);
        await this.dev.Write8Data(ICM20948.I2C_SLV0_CTRL, 0x80 | 1);
        await this.bank(0);
        await this.triggerMagIO();
        return await this.dev.Read8Data(ICM20948.EXT_SLV_SENS_DATA_00);
    }

    async magnetometerReady() {
        return ((await this.magRead(ICM20948.AK09916_ST1)) & 0x01) > 0;
    }

    async readMagnetometerData(timeout = 1000) {
        await this.magWrite(ICM20948.AK09916_CNTL2, ICM20948.AK09916_CNTL2_MODE_SINGLE);
        const start = performance.now();
        while (!(await this.magnetometerReady())) {
            if (performance.now() - start > timeout) {
                throw new Error("Timeout waiting for Magnetometer Ready");
            }
            await this.dev.wait(5);
        }

        // Читаем 8 байт: HXL..HZH (6 байт) + dummy (1 байт) + ST2 (1 байт для разблокировки)
        const data = await this.magReadBytes(ICM20948.AK09916_HXL, 8);
        const view = new DataView(data);

        // В AK09916 данные хранятся в Little-Endian
        const x = view.getInt16(0, true) * 0.15;
        const y = view.getInt16(2, true) * 0.15;
        const z = view.getInt16(4, true) * 0.15;

        return [x, y, z];
    }

    async Init() {
        this._bank = -1;

        await this.bank(0);
        const whoAmI = await this.dev.Read8Data(ICM20948.WHO_AM_I);
        if (whoAmI !== ICM20948.CHIP_ID) {
            throw new Error(`Unable to find ICM20948, got 0x${whoAmI.toString(16)}`);
        }

        await this.dev.Write8Data(ICM20948.PWR_MGMT_1, 0x80);
        await this.dev.wait(10);
        await this.dev.Write8Data(ICM20948.PWR_MGMT_1, 0x01);
        await this.dev.Write8Data(ICM20948.PWR_MGMT_2, 0x00);

        await this.setGyroSampleRate(100);
        await this.setGyroLowPass(true, 5);
        await this.setGyroFullScale(250);

        await this.setAccelerometerSampleRate(125);
        await this.setAccelerometerLowPass(true, 5);
        await this.setAccelerometerFullScale(16);

        await this.bank(2);
        const accelScaleIdx = ((await this.dev.Read8Data(ICM20948.ACCEL_CONFIG)) & 0x06) >> 1;
        const gyroScaleIdx = ((await this.dev.Read8Data(ICM20948.GYRO_CONFIG_1)) & 0x06) >> 1;
        this.accelDiv = [16384.0, 8192.0, 4096.0, 2048.0][accelScaleIdx];
        this.gyroDiv = [131.0, 65.5, 32.8, 16.4][gyroScaleIdx];
        await this.bank(0);

        await this.dev.Write8Data(ICM20948.INT_PIN_CFG, 0x00);

        await this.bank(3);
        await this.dev.Write8Data(ICM20948.I2C_MST_CTRL, 0x07); // 400 кГц для внутреннего I2C мастера
        await this.dev.Write8Data(ICM20948.I2C_MST_DELAY_CTRL, 0x01);

        const magWhoAmI = await this.magRead(ICM20948.AK09916_WIA);
        if (magWhoAmI !== ICM20948.AK09916_CHIP_ID) {
            throw new Error(`Unable to find AK09916, got 0x${magWhoAmI.toString(16)}`);
        }

        // Reset the magnetometer
        await this.magWrite(ICM20948.AK09916_CNTL3, 0x01);
        while (((await this.magRead(ICM20948.AK09916_CNTL3)) & 0x01) !== 0) {
            await this.dev.wait(10);
        }
    }

    async readAccelerometerGyroData() {
        await this.bank(0);
        const data = await this.dev.ReadData(ICM20948.ACCEL_XOUT_H, 12);
        const view = new DataView(data);
        let ax = view.getInt16(0, false) / this.accelDiv;
        let ay = view.getInt16(2, false) / this.accelDiv;
        let az = view.getInt16(4, false) / this.accelDiv;
        let gx = view.getInt16(6, false) / this.gyroDiv;
        let gy = view.getInt16(8, false) / this.gyroDiv;
        let gz = view.getInt16(10, false) / this.gyroDiv;

        return [ax, ay, az, gx, gy, gz];
    }

    async triggerMagIO() {
        await this.bank(0);
        const user = await this.dev.Read8Data(ICM20948.USER_CTRL);
        await this.dev.Write8Data(ICM20948.USER_CTRL, user | 0x20);
        await this.dev.wait(5);
        await this.dev.Write8Data(ICM20948.USER_CTRL, user);
    }
}