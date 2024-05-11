package com.eclinic.visionmodule

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Message
import android.text.TextUtils
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.linktop.constant.TestPaper.Manufacturer
import com.mintti.visionsdk.ble.BleDevice
import com.mintti.visionsdk.ble.BleManager
import com.mintti.visionsdk.ble.DeviceType
import com.mintti.visionsdk.ble.bean.BgEvent
import com.mintti.visionsdk.ble.bean.MeasureType
import com.mintti.visionsdk.ble.callback.IBgResultListener
import com.mintti.visionsdk.ble.callback.IBleConnectionListener
import com.mintti.visionsdk.ble.callback.IBleInitCallback
import com.mintti.visionsdk.ble.callback.IBleScanCallback
import com.mintti.visionsdk.ble.callback.IBleWriteResponse
import com.mintti.visionsdk.ble.callback.IBpResultListener
import com.mintti.visionsdk.ble.callback.IEcgResultListener
import com.mintti.visionsdk.ble.callback.ISpo2ResultListener
import java.util.Timer
import kotlin.concurrent.schedule


class VisionController(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    Handler.Callback {

    val TAG = "VisionController"
    private val moduleName = "VisionModule"
    var mHandler = Handler(reactContext.mainLooper, this)


    private val MSG_SCAN_DELAY = 0x01
    private val REQUEST_ENABLE_BT = 1
    private val deviceList: List<BleDevice> = ArrayList()
    private var isScanning = false


    override fun getName(): String {
        return moduleName
    }

    @ReactMethod
    fun startDeviceScan(msg: String) {
        startScan()
        println(msg)
    }

    @ReactMethod
    fun connectToDevice(device: ReadableMap, promise: Promise) {
        val mac = device.getString("mac");
        if (mac.isNullOrBlank() || device.getString("name").isNullOrBlank()) {
            Log.e(TAG, "cant connect to this device")
            promise.reject("invalid device", "This device is invalid")
            return
        }

        try {
            BleManager.getInstance().addConnectionListener(object : IBleConnectionListener {

                override fun onConnectSuccess(p0: String?) {
                    Log.e(TAG, "Successfully connected")
                    promise.resolve("Successfully connected to the device")
                }

                override fun onConnectFailed(p0: String?) {
                    promise.reject("Connection Error", "Couldn't connect$p0")
                    Log.e(TAG, "Connection failed")
                }

                override fun onDisconnected(p0: String?, p1: Boolean) {
                    Log.e(TAG, "Disconnected")
                }
            })
            Timer().schedule(1000) {
                Log.e(TAG, "connecting after 1000" + mac)
                BleManager.getInstance().stopScan()
                BleManager.getInstance().connect(mac)
            }

            Log.e(TAG, "connectToDevice" + device.getString("mac"))
        } catch (_: NullPointerException) {
            promise.reject("Error connecting to device", "Error connecting")
        }
    }

    @ReactMethod
    fun measureECG() {
        BleManager.getInstance().setEcgResultListener(object : IEcgResultListener {
            override fun onDrawWave(wave: Int) {
                sendEvent(
                    reactApplicationContext,
                    "onEcg",
                    Arguments.createMap().apply {
                        putInt("wave", wave)
                    })
            }

            override fun onHeartRate(heartRate: Int) {
                sendEvent(
                    reactApplicationContext,
                    "onEcg",
                    Arguments.createMap().apply {
                        putInt("heartRate", heartRate)
                    })

            }

            override fun onRespiratoryRate(respiratoryRate: Int) {
                sendEvent(
                    reactApplicationContext,
                    "onEcg",
                    Arguments.createMap().apply {
                        putInt("respiratoryRate", respiratoryRate)
                    })
            }

            override fun onEcgResult(rrMax: Int, rrMin: Int, hrv: Int) {
                sendEvent(
                    reactApplicationContext,
                    "onEcg",
                    Arguments.createMap().apply {
                        putMap("results", Arguments.createMap().apply {
                            putInt("rrMax", rrMax)
                            putInt("rrMin", rrMin)
                            putInt("hrv", hrv)
                        })
                    })
            }

            override fun onEcgDuration(duration: Int, isEnd: Boolean) {
                sendEvent(
                    reactApplicationContext,
                    "onEcg",
                    Arguments.createMap().apply {
                        putMap("duration", Arguments.createMap().apply {
                            putInt("duration", duration)
                            putBoolean("isEnd", isEnd)
                        })
                    })
            }
        })
        startMeasurements(MeasureType.TYPE_ECG)
    }

    @ReactMethod
    fun setTestPaper(manufacturer: String, testPaperCode: String) {
        BleManager.getInstance().setTestPaper(manufacturer, testPaperCode)
    }

    @ReactMethod
    fun getTestPaperManufacturer() {
        BleManager.getInstance().testPaperManufacturer
    }

    @ReactMethod
    fun getTestPaperCodesByManufacturer(manufacturer: String) {
        BleManager.getInstance().getTestPaperCodesByManufacturer(manufacturer)
    }


    @ReactMethod
    fun getDeviceType(promise: Promise) {
        val deviceType = BleManager.getInstance().deviceType
        if (deviceType == DeviceType.TYPE_VISION) {
            promise.resolve("vision")
        } else if (deviceType == DeviceType.TYPE_MINTTI_VISION)
            promise.resolve("minttiVision")
    }

    @ReactMethod
    fun measureBloodGlucose() {
        BleManager.getInstance()
            .setBgResultListener(object : IBgResultListener {
                override fun onBgEvent(bgEvent: BgEvent?) {
                    when (bgEvent) {
                        BgEvent.BG_EVENT_CALIBRATION_FAILED -> {
                            sendEvent(
                                reactApplicationContext,
                                "onBgEvent",
                                Arguments.createMap().apply {
                                    putString("eventType", "bgEventCalibrationFailed")
                                    putString(
                                        "message",
                                        "Calibration failed, pull out the test paper and restart the measurement"
                                    )
                                })

                        }

                        BgEvent.BG_EVENT_WAIT_DRIP_BLOOD -> {
                            sendEvent(
                                reactApplicationContext,
                                "onBgEvent",
                                Arguments.createMap().apply {
                                    putString("eventType", "bgEventWaitDripBlood")
                                    putString(
                                        "message",
                                        "Waiting for the blood sample to be dripped"
                                    )
                                })
                        }

                        BgEvent.BG_EVENT_BLOOD_SAMPLE_DETECTING -> {
                            sendEvent(
                                reactApplicationContext,
                                "onBgEvent",
                                Arguments.createMap().apply {
                                    putString("event", "bgEventBloodSampleDetecting")
                                    putString(
                                        "message",
                                        "The dripped blood sample is collected, and the calculation is in progress"
                                    )
                                })
                        }

                        BgEvent.BG_EVENT_GET_BG_RESULT_TIMEOUT -> {
                            sendEvent(
                                reactApplicationContext,
                                "onBgEvent",
                                Arguments.createMap().apply {
                                    putString("event", "bgEventGetBgResultTimeout")
                                    putString(
                                        "message",
                                        "Timeout in obtaining blood glucose results"
                                    )
                                })
                        }

                        BgEvent.BG_EVENT_MEASURE_END -> {
                            sendEvent(
                                reactApplicationContext,
                                "onBgEvent",
                                Arguments.createMap().apply {
                                    putString("event", "bgEventMeasureEnd")
                                    putString(
                                        "message",
                                        "End of blood glucose measurement"
                                    )
                                })
                        }

                        BgEvent.BG_EVENT_PAPER_USED -> {
                            sendEvent(
                                reactApplicationContext,
                                "onBgEvent",
                                Arguments.createMap().apply {
                                    putString("event", "bgEventPaperUsed")
                                    putString(
                                        "message",
                                        "Test paper has been used"
                                    )
                                })
                        }

                        BgEvent.BG_EVENT_WAIT_PAGER_INSERT -> Log.e(
                            TAG,
                            "bg_event_wait_pager_insert"
                        )

                        null -> Log.e(TAG, "null")
                    }
                }

                override fun onBgResult(bg: Double) {
                    sendEvent(
                        reactApplicationContext,
                        "onBgResult",
                        Arguments.createMap().apply {
                            putDouble("bg", bg)
                        })
                }
            })
        startMeasurements(MeasureType.TYPE_BG)
    }


    @ReactMethod
    fun measureBloodOxygenSaturation() {
        BleManager.getInstance().setSpo2ResultListener(object : ISpo2ResultListener {
            override fun onWaveData(waveData: Int) {
                sendEvent(
                    reactApplicationContext,
                    "onSpo2",
                    Arguments.createMap().apply {
                        putInt("waveData", waveData)
                    })
            }

            override fun onSpo2ResultData(heartRate: Int, spo2: Double) {
                sendEvent(
                    reactApplicationContext,
                    "onSpo2",
                    Arguments.createMap().apply {
                        putMap("result", Arguments.createMap().apply {
                            putInt("heartRate", heartRate)
                            putDouble("spo2", spo2)
                        })
                    })
            }

            override fun onSpo2End() {
                sendEvent(
                    reactApplicationContext,
                    "onSpo2",
                    Arguments.createMap().apply {
                        putBoolean("measurementEnded", true)
                        putString("message", "Spo2 measurement ended")
                    })
            }
        })
        startMeasurements(MeasureType.TYPE_SPO2)
    }

    @ReactMethod
    fun measureBloodPressure() {
        BleManager.getInstance().setBpResultListener(object : IBpResultListener {
            override fun onBpResult(systolic: Int, diastolic: Int, heartRate: Int) {
                sendEvent(reactApplicationContext, "onBp", Arguments.createMap().apply {
                    putMap("result", Arguments.createMap().apply {
                        putInt("systolic", systolic)
                        putInt("diastolic", diastolic)
                        putInt("heartRate", heartRate)
                    })
                })
            }

            override fun onLeadError() {
                sendEvent(
                    reactApplicationContext,
                    "onBp",
                    Arguments.createMap().apply {
                        putString(
                            "error",
                            "Air leakage is detected, please check the air circuit and remeasure"
                        )
                    })
            }

            override fun onBpError() {
                sendEvent(
                    reactApplicationContext,
                    "onBp",
                    Arguments.createMap().apply {
                        putString(
                            "error",
                            "This result is invalid, please remeasure"
                        )
                    })
            }
        })
        startMeasurements(MeasureType.TYPE_BP)
    }

    @ReactMethod
    fun measureBodyTemperature(promise: Promise) {
        BleManager.getInstance().setBtResultListener {
            promise.resolve(it)
            sendEvent(
                reactApplicationContext,
                "onBodyTemperatureResult",
                Arguments.createMap().apply {
                    putDouble("bodyTemperature", it)
                })
        }
        startMeasurements(MeasureType.TYPE_BT)
    }

    private fun startMeasurements(measureType: MeasureType) {
        BleManager.getInstance().startMeasure(measureType, object : IBleWriteResponse {
            override fun onWriteSuccess() {
                Log.e(TAG, "startMeasurments>>write success")
            }

            override fun onWriteFailed() {
                Log.e(TAG, "startMeasurments>>write failed")
            }

        })
    }

    @ReactMethod
    fun stopMeasurements() {
//        BleManager.getInstance().sto()

    }


    @ReactMethod
    fun getBattery(promise: Promise) {
        try {
            BleManager.getInstance().getDeviceBattery { battery ->
                promise.resolve(battery)
            }
        } catch (e: Exception) {
            promise.reject("Battery Error>>", "couldn't get batter $e")
        }
    }


    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun startScan() {
        Log.i("startScan", "start")
        mHandler?.sendEmptyMessageDelayed(MSG_SCAN_DELAY, 10 * 1000);
        Log.i("startScan>>", "after mHandler")
        isScanning = true
        var isConnected = false
        BleManager.getInstance().startScan(object : IBleScanCallback {
            @SuppressLint("MissingPermission")
            override fun onScanResult(bleDevice: BleDevice) {
                Log.e(TAG, "onScanResult${bleDevice.name}")

                val deviceName = bleDevice.name
                if (TextUtils.isEmpty(deviceName) || deviceName != "Mintti-Vision")
                    return

                sendEvent(reactApplicationContext, "onScanResult", Arguments.createMap().apply {
                    putString("mac", bleDevice.mac)
                    putString("name", bleDevice.name)
                    putInt("rssi", bleDevice.rssi)
                    putMap("bluetoothDevice", Arguments.createMap().apply {
                        bleDevice.bluetoothDevice?.let {
                            putInt("type", it.type)
                            putString("type", it.name)
                            putString("address", it.address)
                            putInt("bondState", it.bondState)
                            putString("name", it.name)
                        }
                    })
                })

                if (TextUtils.isEmpty(bleDevice.name) || TextUtils.isEmpty(bleDevice.mac)) {
                    return
                }
                Log.e(TAG, "scan result" + bleDevice.bluetoothDevice.address)
            }


            override fun onScanFailed(errorCode: Int) {
                Log.e(TAG, "scan Failed")

                isScanning = false
                mHandler!!.removeMessages(MSG_SCAN_DELAY)
            }
        })
    }

    override fun handleMessage(msg: Message): Boolean {
        if (msg.what == MSG_SCAN_DELAY) {
            BleManager.getInstance().stopScan();
            isScanning = false;
            return true;
        }
        return false;
    }

    override fun initialize() {
        Log.e(TAG, "Initialized is called")
        super.initialize()
        BleManager.getInstance().init(reactApplicationContext, object : IBleInitCallback {
            override fun onInitSuccess() {
                Log.e(TAG, "Successful init")
            }

            override fun onInitFailed() {
                Log.e(TAG, "Init Failed")

            }

        })


        BleManager.getInstance().apply {
            setBatteryListener { battery ->
                sendEvent(reactApplicationContext, "onBattery", Arguments.createMap().apply {
                    putInt("battery", battery)
                })
            }
        }


    }
}