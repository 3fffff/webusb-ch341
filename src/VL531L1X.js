export class VL531L1X {
	static I2C_SLAVE_DEVICE_ADDRESS = 0x01
	static VHV_CONFIG_TIMEOUT_MACROP_LOOP_BOUND = 0x08
	static ALGO_CROSSTALK_COMPENSATION_PLANE_OFFSET_KCPS = 0x16
	static ALGO_CROSSTALK_COMPENSATION_X_PLANE_GRADIENT_KCPS = 0x18
	static ALGO_CROSSTALK_COMPENSATION_Y_PLANE_GRADIENT_KCPS = 0x1A
	static ALGO_PART_TO_PART_RANGE_OFFSET_MM = 0x1E
	static MM_CONFIG_INNER_OFFSET_MM = 0x20
	static MM_CONFIG_OUTER_OFFSET_MM = 0x22
	static GPIO_HV_MUX_CTRL = 0x30
	static GPIO_TIO_HV_STATUS = 0x31
	static SYSTEM_INTERRUPT_CONFIG_GPIO = 0x46
	static PHASECAL_CONFIG_TIMEOUT_MACROP = 0x4B
	static RANGE_CONFIG_TIMEOUT_MACROP_A_HI = 0x5E
	static RANGE_CONFIG_VCSEL_PERIOD_A = 0x60
	static RANGE_CONFIG_VCSEL_PERIOD_B = 0x63
	static RANGE_CONFIG_TIMEOUT_MACROP_B_HI = 0x61
	//  RANGE_CONFIG_TIMEOUT_MACROP_B_LO                                  = 0x62 //not used
	static RANGE_CONFIG_SIGMA_THRESH = 0x64
	static RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT_MCPS = 0x66
	static RANGE_CONFIG_VALID_PHASE_HIGH = 0x69
	static SYSTEM_INTERMEASUREMENT_PERIOD = 0x6C
	static SYSTEM_THRESH_HIGH = 0x72
	static SYSTEM_THRESH_LOW = 0x74
	static SD_CONFIG_WOI_SD0 = 0x78
	static SD_CONFIG_INITIAL_PHASE_SD0 = 0x7A
	static ROI_CONFIG_USER_ROI_CENTRE_SPAD = 0x7F
	static ROI_CONFIG_USER_ROI_REQUESTED_GLOBAL_XY_SIZE = 0x80
	//  SYSTEM_SEQUENCE_CONFIG                                            = 0x81 //not used
	//  SYSTEM_GROUPED_PARAMETER_HOLD                                     = 0x82 //not used
	static SYSTEM_INTERRUPT_CLEAR = 0x86
	static SYSTEM_MODE_START = 0x87
	static RESULT_RANGE_STATUS = 0x89
	static RESULT_DSS_ACTUAL_EFFECTIVE_SPADS_SD0 = 0x8C
	static RESULT_AMBIENT_COUNT_RATE_MCPS_SD = 0x90
	static RESULT_FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0 = 0x96
	static RESULT_PEAK_SIGNAL_COUNT_RATE_CROSSTALK_CORRECTED_MCPS_SD0 = 0x98
	static RESULT_OSC_CALIBRATE_VAL = 0xDE
	static FIRMWARE_SYSTEM_STATUS = 0xE5
	static IDENTIFICATION_MODEL_ID = 0x010F
	static VL51L1X_DEFAULT_CONFIGURATION = new Uint8Array([
		0x00, /* 0x2d : set bit 2 and 5 to 1 for fast plus mode (1MHz I2C), else don't touch */
		0x01, /* 0x2e : bit 0 if I2C pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
		0x00, /* 0x2f : bit 0 if GPIO pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
		0x01, /* 0x30 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity() */
		0x02, /* 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() */
		0x00, /* 0x32 : not user-modifiable */
		0x02, /* 0x33 : not user-modifiable */
		0x08, /* 0x34 : not user-modifiable */
		0x00, /* 0x35 : not user-modifiable */
		0x08, /* 0x36 : not user-modifiable */
		0x10, /* 0x37 : not user-modifiable */
		0x01, /* 0x38 : not user-modifiable */
		0x01, /* 0x39 : not user-modifiable */
		0x00, /* 0x3a : not user-modifiable */
		0x00, /* 0x3b : not user-modifiable */
		0x00, /* 0x3c : not user-modifiable */
		0x00, /* 0x3d : not user-modifiable */
		0xff, /* 0x3e : not user-modifiable */
		0x00, /* 0x3f : not user-modifiable */
		0x0F, /* 0x40 : not user-modifiable */
		0x00, /* 0x41 : not user-modifiable */
		0x00, /* 0x42 : not user-modifiable */
		0x00, /* 0x43 : not user-modifiable */
		0x00, /* 0x44 : not user-modifiable */
		0x00, /* 0x45 : not user-modifiable */
		0x20, /* 0x46 : interrupt configuration 0->level low detection, 1-> level high, 2-> Out of window, 3->In window, 0x20-> New sample ready , TBC */
		0x0b, /* 0x47 : not user-modifiable */
		0x00, /* 0x48 : not user-modifiable */
		0x00, /* 0x49 : not user-modifiable */
		0x02, /* 0x4a : not user-modifiable */
		0x0a, /* 0x4b : not user-modifiable */
		0x21, /* 0x4c : not user-modifiable */
		0x00, /* 0x4d : not user-modifiable */
		0x00, /* 0x4e : not user-modifiable */
		0x05, /* 0x4f : not user-modifiable */
		0x00, /* 0x50 : not user-modifiable */
		0x00, /* 0x51 : not user-modifiable */
		0x00, /* 0x52 : not user-modifiable */
		0x00, /* 0x53 : not user-modifiable */
		0xc8, /* 0x54 : not user-modifiable */
		0x00, /* 0x55 : not user-modifiable */
		0x00, /* 0x56 : not user-modifiable */
		0x38, /* 0x57 : not user-modifiable */
		0xff, /* 0x58 : not user-modifiable */
		0x01, /* 0x59 : not user-modifiable */
		0x00, /* 0x5a : not user-modifiable */
		0x08, /* 0x5b : not user-modifiable */
		0x00, /* 0x5c : not user-modifiable */
		0x00, /* 0x5d : not user-modifiable */
		0x01, /* 0x5e : not user-modifiable */
		0xcc, /* 0x5f : not user-modifiable */
		0x0f, /* 0x60 : not user-modifiable */
		0x01, /* 0x61 : not user-modifiable */
		0xf1, /* 0x62 : not user-modifiable */
		0x0d, /* 0x63 : not user-modifiable */
		0x01, /* 0x64 : Sigma threshold MSB (mm in 14.2 format for MSB+LSB), use SetSigmaThreshold(), default value 90 mm  */
		0x68, /* 0x65 : Sigma threshold LSB */
		0x00, /* 0x66 : Min count Rate MSB (MCPS in 9.7 format for MSB+LSB), use SetSignalThreshold() */
		0x80, /* 0x67 : Min count Rate LSB */
		0x08, /* 0x68 : not user-modifiable */
		0xb8, /* 0x69 : not user-modifiable */
		0x00, /* 0x6a : not user-modifiable */
		0x00, /* 0x6b : not user-modifiable */
		0x00, /* 0x6c : Intermeasurement period MSB, 32 bits register, use SetIntermeasurementInMs() */
		0x00, /* 0x6d : Intermeasurement period */
		0x0f, /* 0x6e : Intermeasurement period */
		0x89, /* 0x6f : Intermeasurement period LSB */
		0x00, /* 0x70 : not user-modifiable */
		0x00, /* 0x71 : not user-modifiable */
		0x00, /* 0x72 : distance threshold high MSB (in mm, MSB+LSB), use SetD:tanceThreshold() */
		0x00, /* 0x73 : distance threshold high LSB */
		0x00, /* 0x74 : distance threshold low MSB ( in mm, MSB+LSB), use SetD:tanceThreshold() */
		0x00, /* 0x75 : distance threshold low LSB */
		0x00, /* 0x76 : not user-modifiable */
		0x01, /* 0x77 : not user-modifiable */
		0x0f, /* 0x78 : not user-modifiable */
		0x0d, /* 0x79 : not user-modifiable */
		0x0e, /* 0x7a : not user-modifiable */
		0x0e, /* 0x7b : not user-modifiable */
		0x00, /* 0x7c : not user-modifiable */
		0x00, /* 0x7d : not user-modifiable */
		0x02, /* 0x7e : not user-modifiable */
		0xc7, /* 0x7f : ROI center, use SetROI() */
		0xff, /* 0x80 : XY ROI (X=Width, Y=Height), use SetROI() */
		0x9B, /* 0x81 : not user-modifiable */
		0x00, /* 0x82 : not user-modifiable */
		0x00, /* 0x83 : not user-modifiable */
		0x00, /* 0x84 : not user-modifiable */
		0x01, /* 0x85 : not user-modifiable */
		0x01, /* 0x86 : clear interrupt, use ClearInterrupt() */
		0x40  /* 0x87 : start ranging, use StartRanging() or StopRanging(), If you want an automatic start after this.init() call, put 0x40 in location 0x87 */
	])

	static status_rtn = [255, 255, 255, 5, 2, 4, 1, 7, 3, 0, 255, 255, 9, 13, 255, 255, 255, 255, 10, 6, 255, 255, 11, 12]

	constructor(dev) {
		this.dev = dev
	}

	async SensorInit(configuration = VL531L1X.VL51L1X_DEFAULT_CONFIGURATION) {
		await this.dev.WriteData(0x2D, configuration)
		await this.StartRanging()

		const polarity = await this.GetInterruptPolarity()
		console.log(polarity)
		while (!(await this.CheckForDataReady(polarity))) { }

		await this.StopRanging()
		await this.ClearInterrupt()
		await this.dev.Write8Data(VL531L1X.VHV_CONFIG_TIMEOUT_MACROP_LOOP_BOUND, 0x09) /* two bounds VHV */
		await this.dev.Write8Data(0x0B, 0) /* start VHV from the previous temperature */
	}

	async ClearInterrupt() {
		return await this.dev.Write8Data(VL531L1X.SYSTEM_INTERRUPT_CLEAR, 0x01)
	}
	async SetInterruptPolarity(new_polarity) {
		new_polarity = (~(new_polarity & 1)) & 1
		const temp = await this.dev.Read8Data(VL531L1X.GPIO_HV_MUX_CTRL) & 0xEF;
		return this.dev.Write8Data(VL531L1X.GPIO_HV_MUX_CTRL, temp | (new_polarity) << 4);
	}
	async GetInterruptPolarity() {
		const polarity = await this.dev.Read8Data(VL531L1X.GPIO_HV_MUX_CTRL)
		return ((polarity & 0x10) === 0x10) ? 0 : 1
	}

	async StartRanging() {
		return await this.dev.Write8Data(VL531L1X.SYSTEM_MODE_START, 0x40)	/* Enable VL53L1X */
	}

	async StopRanging() {
		return await this.dev.Write8Data(VL531L1X.SYSTEM_MODE_START, 0x00)	/* Disable VL53L1X */
	}

	async CheckForDataReady(polarity) {
		const temp = await this.dev.Read8Data(VL531L1X.GPIO_TIO_HV_STATUS)
		return (temp & 1) === polarity
	}

	async SetTimingBudgetInMs(TimingBudgetInMs) {
		const DM = await this.GetDistanceMode()
		if (DM === 0) {
			return 1
		}

		if (DM === 1) {	/* Short DistanceMode */
			switch (TimingBudgetInMs) {
				case 15: /* only available in short distance mode */
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x01D);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x0027);
					return
				case 20:
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x0051);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x006E);
					return
				case 33:
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x00D6);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x006E);
					return
				case 50:
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x1AE);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x01E8);
					return
				case 100:
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x02E1);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x0388);
					return
				case 200:
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x03E1);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x0496);
					return
				case 500:
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x0591);
					await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x05C1);
					return
				default:
					return
			}
		}

		switch (TimingBudgetInMs) {
			case 20:
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x001E);
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x0022);
				return
			case 33:
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x0060);
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x006E);
				return
			case 50:
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x00AD);
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x00C6);
				return
			case 100:
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x01CC);
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x01EA);
				return
			case 200:
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x02D9);
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x02F8);
				return
			case 500:
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI, 0x048F);
				await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_B_HI, 0x04A4);
				return
		}
	}

	async GetTimingBudgetInMs() {
		switch (await this.dev.Read16Data(VL531L1X.RANGE_CONFIG_TIMEOUT_MACROP_A_HI)) {
			case 0x001D:
				return 15
			case 0x0051:
			case 0x001E:
				return 20
			case 0x00D6:
			case 0x0060:
				return 33
			case 0x01AE:
			case 0x00AD:
				return 50
			case 0x02E1:
			case 0x01CC:
				return 100
			case 0x03E1:
			case 0x02D9:
				return 200
			case 0x0591:
			case 0x048F:
				return 500
		}
		return 0
	}

	async SetDistanceMode(DM) {
		const TB = await this.GetTimingBudgetInMs()

		switch (DM) {
			case 1:
				await this.dev.Write8Data(VL531L1X.PHASECAL_CONFIG_TIMEOUT_MACROP, 0x14)
				await this.dev.Write8Data(VL531L1X.RANGE_CONFIG_VCSEL_PERIOD_A, 0x07)
				await this.dev.Write8Data(VL531L1X.RANGE_CONFIG_VCSEL_PERIOD_B, 0x05)
				await this.dev.Write8Data(VL531L1X.RANGE_CONFIG_VALID_PHASE_HIGH, 0x38)
				await this.dev.Write16Data(VL531L1X.SD_CONFIG_WOI_SD0, 0x0705)
				await this.dev.Write16Data(VL531L1X.SD_CONFIG_INITIAL_PHASE_SD0, 0x0606)
				break;
			case 2:
				await this.dev.Write8Data(VL531L1X.PHASECAL_CONFIG_TIMEOUT_MACROP, 0x0A)
				await this.dev.Write8Data(VL531L1X.RANGE_CONFIG_VCSEL_PERIOD_A, 0x0F)
				await this.dev.Write8Data(VL531L1X.RANGE_CONFIG_VCSEL_PERIOD_B, 0x0D)
				await this.dev.Write8Data(VL531L1X.RANGE_CONFIG_VALID_PHASE_HIGH, 0xB8)
				await this.dev.Write16Data(VL531L1X.SD_CONFIG_WOI_SD0, 0x0F0D)
				await this.dev.Write16Data(VL531L1X.SD_CONFIG_INITIAL_PHASE_SD0, 0x0E0E)
				break;
		}

		return await this.SetTimingBudgetInMs(TB)
	}

	async GetDistanceMode() {
		const temp = await this.dev.Read8Data(VL531L1X.PHASECAL_CONFIG_TIMEOUT_MACROP)
		return temp === 0x14 ? 1 : temp === 0x0A ? 2 : 0
	}

	async SetInterMeasurementInMs(InterMeasMs) {
		const ClockPLL = (await this.dev.Read16Data(VL531L1X.RESULT_OSC_CALIBRATE_VAL)) & 0x3FF
		return VL53L1_WrDWord(VL531L1X.SYSTEM_INTERMEASUREMENT_PERIOD, ClockPLL * InterMeasMs * 1.075);
	}

	async GetInterMeasurementInMs() {
		const pIM = await VL53L1_RdDWord(VL531L1X.SYSTEM_INTERMEASUREMENT_PERIOD)
		const ClockPLL = (await this.dev.Read16Data(VL531L1X.RESULT_OSC_CALIBRATE_VAL)) & 0x3FF
		return pIM / (ClockPLL * 1.075) // ST code had 1.065?
	}

	async BootState() {
		return await this.dev.Read8Data(VL531L1X.FIRMWARE_SYSTEM_STATUS)
	}

	async GetSensorId() {
		return await this.dev.Read8Data(VL531L1X.IDENTIFICATION_MODEL_ID, 1, true)
	}

	async GetDistance() {
		return await this.dev.Read16Data(VL531L1X.RESULT_FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0)
	}

	async GetSignalPerSpad() {
		let signal = await this.dev.Read16Data(VL531L1X.RESULT_PEAK_SIGNAL_COUNT_RATE_CROSSTALK_CORRECTED_MCPS_SD0)
		let SpNb = await this.dev.Read16Data(VL531L1X.RESULT_DSS_ACTUAL_EFFECTIVE_SPADS_SD0)
		return 2000.0 * signal / SpNb
	}

	async GetAmbientPerSpad() {
		let AmbientRate = await this.dev.Read16Data(VL531L1X.RESULT_AMBIENT_COUNT_RATE_MCPS_SD)
		let SpNb = await this.dev.Read16Data(VL531L1X.RESULT_DSS_ACTUAL_EFFECTIVE_SPADS_SD0)
		return 2000.0 * AmbientRate / SpNb
	}

	async GetSignalRate() {
		return (await this.dev.Read16Data(VL531L1X.RESULT_PEAK_SIGNAL_COUNT_RATE_CROSSTALK_CORRECTED_MCPS_SD0)) * 8
	}

	async GetSpadNb() {
		return (await this.dev.Read16Data(VL531L1X.RESULT_DSS_ACTUAL_EFFECTIVE_SPADS_SD0)) >> 8
	}

	async GetAmbientRate() {
		return (await this.dev.Read16Data(VL531L1X.RESULT_AMBIENT_COUNT_RATE_MCPS_SD)) * 8
	}

	async GetRangeStatus() {
		let RgSt = (await this.dev.Read8Data(VL531L1X.RESULT_RANGE_STATUS)) & 0x1F
		return (RgSt < 24) ? status_rtn[RgSt] : 255
	}

	async GetResult() {
		const Temp = await VL53L1_ReadMulti(VL531L1X.RESULT_RANGE_STATUS, 17);
		let RgSt = Temp[0] & 0x1F;

		if (RgSt < 24) {
			RgSt = status_rtn[RgSt];
		}

		return {
			status: RgSt,
			ambient: Temp.readUInt16BE(7) * 8,
			numSPADs: Temp[3],
			sigPerSPAD: Temp.readUInt16BE(15) * 8,
			distance: Temp.readUInt16BE(13),
		}
	}

	async SetOffset(OffsetValue) {
		await this.dev.Write16Data(VL531L1X.ALGO_PART_TO_PART_RANGE_OFFSET_MM, OffsetValue * 4)
		await this.dev.Write16Data(VL531L1X.MM_CONFIG_INNER_OFFSET_MM, 0x0)
		await this.dev.Write16Data(VL531L1X.MM_CONFIG_OUTER_OFFSET_MM, 0x0)
	}

	async GetOffset() {
		let Temp = await this.dev.Read16Data(VL531L1X.ALGO_PART_TO_PART_RANGE_OFFSET_MM)
		Temp = Temp << 3
		Temp = Temp >> 5
		return Temp
	}

	async SetXtalk(XtalkValue) {
		/* XTalkValue in count per second to avoid float type */
		await this.dev.Write16Data(VL531L1X.ALGO_CROSSTALK_COMPENSATION_X_PLANE_GRADIENT_KCPS, 0x0000)
		await this.dev.Write16Data(VL531L1X.ALGO_CROSSTALK_COMPENSATION_Y_PLANE_GRADIENT_KCPS, 0x0000)
		/* * << 9 (7.9 format) and /1000 to convert cps to kpcs */
		await this.dev.Write16Data(VL531L1X.ALGO_CROSSTALK_COMPENSATION_PLANE_OFFSET_KCPS, (XtalkValue << 9) / 1000)
	}

	async GetXtalk() {
		const tmp = await VL53L1_RdDWord(VL531L1X.ALGO_CROSSTALK_COMPENSATION_PLANE_OFFSET_KCPS)
		/* * 1000 to convert kcps to cps and >> 9 (7.9 format) */
		return (tmp * 1000) >> 9
	}

	async SetDistanceThreshold(ThreshLow, ThreshHigh, Window, IntOnNoTarget) {
		const Temp = (await this.dev.Read8Data(VL531L1X.SYSTEM_INTERRUPT_CONFIG_GPIO)) & 0x47
		if (IntOnNoTarget === 0) {
			await this.dev.Write8Data(VL531L1X.SYSTEM_INTERRUPT_CONFIG_GPIO, Temp | (Window & 0x07))
		}
		else {
			await this.dev.Write8Data(VL531L1X.SYSTEM_INTERRUPT_CONFIG_GPIO, (Temp | (Window & 0x07)) | 0x40)
		}
		await this.dev.Write16Data(VL531L1X.SYSTEM_THRESH_HIGH, ThreshHigh)
		await this.dev.Write16Data(VL531L1X.SYSTEM_THRESH_LOW, ThreshLow)
	}

	async GetDistanceThresholdWindow() {
		return (await this.dev.Read8Data(VL531L1X.SYSTEM_INTERRUPT_CONFIG_GPIO)) & 0x7
	}

	async GetDistanceThresholdLow() {
		return await this.dev.Read16Data(VL531L1X.SYSTEM_THRESH_LOW)
	}

	async GetDistanceThresholdHigh() {
		return await this.dev.Read16Data(VL531L1X.SYSTEM_THRESH_HIGH)
	}

	async SetROICenter(ROICenter) {
		return await this.dev.Write8Data(VL531L1X.ROI_CONFIG_USER_ROI_CENTRE_SPAD, ROICenter)
	}

	async GetROICenter() {
		return await this.dev.Read8Data(VL531L1X.ROI_CONFIG_USER_ROI_CENTRE_SPAD)
	}

	async SetROI(X, Y) {
		let OpticalCenter = await this.dev.Read8Data(VL531L1X.ROI_CONFIG_MODE_ROI_CENTRE_SPAD)
		if (X > 16) X = 16
		if (Y > 16) Y = 16

		if (X > 10 || Y > 10) {
			OpticalCenter = 199
		}

		const XY = ((Y - 1) << 4) | (X - 1)
		await this.dev.Write8Data(VL531L1X.ROI_CONFIG_USER_ROI_CENTRE_SPAD, OpticalCenter)
		await this.dev.Write8Data(VL531L1X.ROI_CONFIG_USER_ROI_REQUESTED_GLOBAL_XY_SIZE, XY)
	}

	async GetROI_XY() {
		const tmp = await this.dev.Read8Data(VL531L1X.ROI_CONFIG_USER_ROI_REQUESTED_GLOBAL_XY_SIZE)
		return {
			ROI_X: (tmp & 0x0F) + 1,
			ROI_Y: ((tmp & 0xF0) >> 4) + 1
		}
	}

	async SetSignalThreshold(Signal) {
		return await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT_MCPS, Signal >> 3)
	}

	async GetSignalThreshold() {
		return (await this.dev.Read16Data(VL531L1X.RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT_MCPS)) << 3
	}

	async SetSigmaThreshold(Sigma) {

		if (Sigma > (0xFFFF >> 2)) return 1

		/* 16 bits register 14.2 format */
		return await this.dev.Write16Data(VL531L1X.RANGE_CONFIG_SIGMA_THRESH, Sigma << 2)
	}

	async GetSigmaThreshold() {
		return (await this.dev.Read16Data(VL531L1X.RANGE_CONFIG_SIGMA_THRESH)) >> 2
	}

	async StartTemperatureUpdate() {
		await this.dev.Write8Data(VL531L1X.VHV_CONFIG_TIMEOUT_MACROP_LOOP_BOUND, 0x81) /* full VHV */
		await this.dev.Write8Data(0x0B, 0x92)
		await this.StartRanging()
		const polarity = await this.GetInterruptPolarity()
		while (!(await this.CheckForDataReady(polarity))) { }

		await this.ClearInterrupt()
		await this.StopRanging()
		await this.dev.Write8Data(VL531L1X.VHV_CONFIG_TIMEOUT_MACROP_LOOP_BOUND, 0x09) /* two bounds VHV */
		await this.dev.Write8Data(0x0B, 0) /* start VHV from the previous temperature */
	}
}