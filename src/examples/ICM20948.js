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

    // Offset and sensitivity - defined in electrical characteristics, and TEMP_OUT_H/L of datasheet
    static TEMPERATURE_DEGREES_OFFSET = 21
    static TEMPERATURE_SENSITIVITY = 333.87
    static ROOM_TEMP_OFFSET = 21

    static AK09916_I2C_ADDR = 0x0c
    static AK09916_CHIP_ID = 0x09
    static AK09916_WIA = 0x01
    static AK09916_ST1 = 0x10
    static AK09916_ST1_DOR = 0b00000010   // Data overflow bit
    static AK09916_ST1_DRDY = 0b00000001  // Data this.ready bit
    static AK09916_HXL = 0x11
    static AK09916_ST2 = 0x18
    static AK09916_ST2_HOFL = 0b00001000  // Magnetic sensor overflow bit
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
    }


    async bank(value) {
        //Switch register this.bank.
        if (!this._bank == value) {
            await this.dev.Write8Data(ICM20948.BANK_SEL, value << 4)
            this._bank = value
        }
    }

    async setAccelerometerSampleRate(rate = 125) {
        // Set the accelerometer sample rate in Hz.
        await this.bank(2)
        //  125Hz - 1.125 kHz / (1 + rate)
        rate = parseInt((1125.0 / rate) - 1)
        await this.dev.Write8Data(ICM20948.ACCEL_SMPLRT_DIV_1, (rate >> 8) & 0xff)
        await this.dev.Write8Data(ICM20948.ACCEL_SMPLRT_DIV_2, rate & 0xff)
    }

    async setAccelerometerFullScale(scale = 16) {
        //Set the accelerometer fulls cale range to +- the supplied value.
        await this.bank(2)
        let value = await this.dev.Read8Data(ICM20948.ACCEL_CONFIG) & 0b11111001
        value |= 0b11 << 1//{ 2: 0b00, 4: 0b01, 8: 0b10, 16: 0b11 }[scale] << 1
        await this.dev.Write8Data(ICM20948.ACCEL_CONFIG, value)
    }

    async setAccelerometerLowPass(enabled = true, mode = 5) {
        //Configure the accelerometer low pass filter.
        this.bank(2)
        let value = await this.dev.Read8Data(ICM20948.ACCEL_CONFIG) & 0b10001110
        if (enabled)
            value |= 0b1
        value |= (mode & 0x07) << 4
        await this.dev.Write8Data(ICM20948.ACCEL_CONFIG, value)
    }

    async setGyroSampleRate(rate = 125) {
        //Set the gyro sample rate in Hz.
        await this.bank(2)
        //# 125Hz sample rate - 1.125 kHz / (1 + rate)
        rate = ~~((1125.0 / rate) - 1)
        await this.dev.Write8Data(ICM20948.GYRO_SMPLRT_DIV, rate)
    }
    async setGyroFullScale(scale = 250) {
        //Set the gyro full scale range to +- supplied value.
        await this.bank(2)
        let value = (await this.dev.Read8Data(ICM20948.GYRO_CONFIG_1)) & 0b11111001
        //console.log(value)
        value |= 0b00 << 1//{ 250: 0b00, 500: 0b01, 1000: 0b10, 2000: 0b11 } << 1
        await this.dev.Write8Data(ICM20948.GYRO_CONFIG_1, value)
    }

    async setGyroLowPass(enabled = true, mode = 5) {
        //Configure the gyro low pass filter.
        await this.bank(2)
        let value = (await this.dev.Read8Data(ICM20948.GYRO_CONFIG_1)) & 0b10001110
        if (enabled) value |= 0b1
        value |= (mode & 0x07) << 4
        await this.dev.Write8Data(ICM20948.GYRO_CONFIG_1, value)
    }

    async magWrite(reg, value) {
        //Write a byte to the slave magnetometer.
        await this.bank(3)
        await this.dev.Write8Data(ICM20948.I2C_SLV0_ADDR, ICM20948.AK09916_I2C_ADDR)  // Write one byte
        await this.dev.Write8Data(ICM20948.I2C_SLV0_REG, reg)
        await this.dev.Write8Data(ICM20948.I2C_SLV0_DO, value)
        await this.bank(0)
        await this.triggerMagIO()
    }

    async magRead(reg) {
        //Read a byte from the slave magnetometer.
        this.bank(3)
        await await this.dev.Write8Data(ICM20948.I2C_SLV0_ADDR, ICM20948.AK09916_I2C_ADDR | 0x80)
        await this.dev.Write8Data(ICM20948.I2C_SLV0_REG, reg)
        await this.dev.Write8Data(ICM20948.I2C_SLV0_DO, 0xff)
        await this.dev.Write8Data(ICM20948.I2C_SLV0_CTRL, 0x80 | 1)  // Read 1 byte

        await this.bank(0)
        await this.triggerMagIO()
        return await this.dev.Read8Data(ICM20948.EXT_SLV_SENS_DATA_00)
    }

    async magnetometerReady() {
        //Check the magnetometer status this.ready bit.
        return await this.magRead(AK09916_ST1) & 0x01 > 0
    }

    async readMagnetometerData(timeout = 1.0) {
        await this.magWrite(ICM20948.AK09916_CNTL2, 0x01)  // Trigger single measurement
        //t_start = time.time()
        while (!await this.magnetometerReady()) {
            //if (time.time() - t_start > timeout)
            //    new Error("Timeout waiting for Magnetometer Ready")
            await this.dev.wait(5)
        }

        const data = await this.magRead_bytes(ICM20948.AK09916_HXL, 6)
        console.log(data)
        // Read ST2 to confirm this.dev.Read8Data finished,
        // needed for continuous modes
        // this.magRead(AK09916_ST2)

        /*let [x, y, z] = data

        // Scale for magnetic flux density "uT"
        // from section 3.3 of the datasheet
        // This value is constant
        x *= 0.15
        y *= 0.15
        z *= 0.15

        return x, y, z*/
    }

    async Init() {
        this._bank = -1

        await this.bank(0)
        console.log(await this.dev.Read8Data(ICM20948.WHO_AM_I))
        if (await this.dev.Read8Data(ICM20948.WHO_AM_I) != ICM20948.CHIP_ID)
            new Error("Unable to find ICM20948")

        await this.dev.Write8Data(ICM20948.PWR_MGMT_1, 0x80)
        await this.dev.wait(1)
        await this.dev.Write8Data(ICM20948.PWR_MGMT_1, 0x01)
        await this.dev.Write8Data(ICM20948.PWR_MGMT_2, 0x00)

        await this.bank(2)

        await this.setGyroSampleRate(100)
        await this.setGyroLowPass(true, 5)
        await this.setGyroFullScale(250)

        await this.setAccelerometerSampleRate(125)
        await this.setAccelerometerLowPass(true, 5)
        await this.setAccelerometerFullScale(16)

        /* await this.bank(0)
         await this.dev.Write8Data(ICM20948.INT_PIN_CFG, 0x30)
 
         await this.bank(3)
         await this.dev.Write8Data(ICM20948.I2C_MST_CTRL, 0x4D)
         await this.dev.Write8Data(ICM20948.I2C_MST_DELAY_CTRL, 0x01)*/

        /*if (!await this.magRead(ICM20948.AK09916_WIA) == ICM20948.AK09916_CHIP_ID)
            new Error("Unable to find AK09916")

        // Reset the magnetometer
        await this.magWrite(ICM20948.AK09916_CNTL3, 0x01)
        while (!await this.magRead(ICM20948.AK09916_CNTL3) == 0x01)
            await this.dev.wait(10)*/
    }
    async read_accelerometer_gyro_data() {
        await this.bank(0)
        const data = await this.dev.ReadData(ICM20948.ACCEL_XOUT_H, 12)
        console.log(data)
        let [ax, ay, az, gx, gy, gz] = new Int16Array(data)

        await this.bank(2)

        //Read accelerometer full scale range and
        // use it to compensate the this.reading to gs
        let scale = (await this.dev.Read8Data(ICM20948.ACCEL_CONFIG) & 0x06) >> 1

        // scale ranges from section 3.2 of the datasheet
        const gs = [16384.0, 8192.0, 4096.0, 2048.0]//.map(v => v * scale)

        ax /= gs[scale]
        ay /= gs[scale]
        az /= gs[scale]

        // Read back the degrees per second rate and
        // use it to compensate the this.reading to dps
        scale = (await this.dev.Read8Data(ICM20948.GYRO_CONFIG_1) & 0x06) >> 1

        // scale ranges from section 3.1 of the datasheet
        const dps = [131, 65.5, 32.8, 16.4]//.map(v => v * scale)

        gx /= dps[scale]
        gy /= dps[scale]
        gz /= dps[scale]

        return [ax, ay, az, gx, gy, gz]
    }

    async triggerMagIO() {
        const user = await this.dev.Read8Data(ICM20948.USER_CTRL)
        await this.dev.Write8Data(ICM20948.USER_CTRL, user | 0x20)
        await this.dev.wait(5)
        await this.dev.Write8Data(ICM20948.USER_CTRL, user)
    }
}