package com.eclinic.smarthomodule

import android.annotation.SuppressLint
import android.os.Environment
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

import com.kl.minttisdk.bean.EchoMode
import com.kl.minttisdk.ble.BleDevice
import com.kl.minttisdk.ble.BleManager
import com.kl.minttisdk.ble.callback.IAudioDataCallback
import com.kl.minttisdk.ble.callback.IBleConnectStatusListener
import com.kl.minttisdk.ble.callback.IBleScanCallback
import com.kl.minttisdk.utils.ArrayUtils
import java.io.File
import java.io.FileNotFoundException
import java.io.FileOutputStream
import java.io.IOException
import java.util.Timer
import java.util.concurrent.Executors
import kotlin.concurrent.schedule

class SmarthoController(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    Handler.Callback {

    val TAG = "SmarthoController"
    private val moduleName = "SmarthoModule"
    var mHandler = Handler(reactContext.mainLooper, this)


    private val MSG_SCAN_DELAY = 0x01
    private val REQUEST_ENABLE_BT = 1
    private val deviceList: List<BleDevice> = ArrayList()
    private var isScanning = false
    private var audioTrackPlayer: AudioTrackPlayer? = null

    private var rootFile: File? = null
    private var pcmFile: File? = null
    private var fos: FileOutputStream? = null

    private val executorService = Executors.newSingleThreadExecutor()


    override fun getName(): String {
        return moduleName
    }



    @ReactMethod
    fun getPCMFilePath(promise: Promise){
        if(pcmFile == null)
            promise.resolve(Arguments.createMap().apply {
                putString("error", "No recording found. ")
            })
        else
            promise.resolve( Arguments.createMap().apply {
                putString("path", pcmFile?.path)
                putBoolean("exists", pcmFile?.exists() == true)
                putString("absolutePath", pcmFile?.absolutePath)
            })
    }

    @ReactMethod
    fun isBluetoothEnabled(promise: Promise) {
        try {
            promise.resolve(BleManager.getInstance().isBluetoothEnable)

        } catch (e: Exception) {
            promise.reject("error", "Error getting bluetooth state")
        }
    }

    @ReactMethod
    fun startDeviceScan(msg: String, promise: Promise) {
        if (!BleManager.getInstance().isBluetoothEnable) {
            promise.reject("BluetoothError", "Bluetooth is not enabled ")
            return
        }
        startScan()
        println(msg)
    }

    @ReactMethod
    fun disconnect(){
        BleManager.getInstance().disconnect()
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
            BleManager.getInstance().addConnectionListener(object : IBleConnectStatusListener {
                override fun onConnectFail(p0: String?, p1: Int) {
                    promise.reject("Connection Error", "Couldn't connect$p0")
                    Log.e(TAG, "Connection failed")
                }

                override fun onConnectSuccess(p0: String?) {
                    Log.e(TAG, "Successfully connected")
                    promise.resolve("Successfully connected to the device")
                }

                override fun onUpdateParamsSuccess() {
                    Log.e(TAG, "onUpdateParamsSuccess")
                }

                override fun onUpdateParamsFail() {
                    Log.e(TAG, "onUpdateParamsFail")
                }

                override fun onDisConnected(p0: String?, p1: Boolean, p2: Int) {
                    Log.e(TAG, "Disconnected $p0")
                    sendEvent(
                        reactApplicationContext,
                        "onDisconnected",
                        Arguments.createMap().apply {
                            putString("message", "Device is disconnected")
                        })
                }

            })
            Timer().schedule(1000) {
                Log.e(TAG, "connecting after 1000" + mac)
                BleManager.getInstance().stopScan()
                BleManager.getInstance().connect(mac)
            }
            device.getString("mac")?.let {
            }
            Log.e(TAG, "connectToDevice" + device.getString("mac"))
        } catch (_: NullPointerException) {
            promise.reject("Error connecting to device", "Error connecting")
        }
    }

    @ReactMethod
    fun startMeasurements() {
        Log.e(TAG, "notifyAudioData is called")
        createFile()
        audioTrackPlayer?.play()
        BleManager.getInstance().notifyAudioData()
    }

    @ReactMethod
    fun stopMeasurements(promise: Promise) {
        closeFile()

        audioTrackPlayer?.stop()

        BleManager.getInstance().unNotifyAudioData()

        promise.resolve(promise.resolve( Arguments.createMap().apply {
            putString("path", pcmFile?.path)
            putString("absolutePath", pcmFile?.absolutePath)
        }))
    }

    @ReactMethod
    fun setMode(mode: String, promise: Promise) {
        try {

            val newMode =
                if (mode == "heart") EchoMode.MODE_BELL_ECHO else EchoMode.MODE_DIAPHRAGM_ECHO;
            BleManager.getInstance()
                .setEchoModeSwitch(newMode)

            promise.resolve("Successfully changed mode to $newMode")

        } catch (error: Exception) {
            promise.reject("Mode Switch Failed", "Failed to switch mode")
        }
    }

    @ReactMethod
    fun getMode(promise: Promise) {
        try {
//            promise.resolve(if (BleManager.getInstance() == EchoMode.MODE_BELL_ECHO) "heart" else "lungs")
            promise.resolve("heart")
        } catch (error: Exception) {
            promise.reject("Getting Echo Failed", "Failed to get echo mode")
        }
    }

    @ReactMethod
    fun getBattery(promise: Promise) {
        try {
            BleManager.getInstance().readBattery { battery ->
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


    @ReactMethod
    fun stopScan() {
        BleManager.getInstance().stopScan()
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
                Log.e(TAG, "onScanResult$bleDevice")

                val deviceName = bleDevice.name
                if (TextUtils.isEmpty(deviceName) || deviceName != "Mintti")
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
        BleManager.getInstance().init(reactApplicationContext)

        rootFile = File(Environment.getExternalStorageDirectory(), "RMV")
        if (!rootFile!!.exists()) {
            rootFile!!.mkdirs()
        }

        audioTrackPlayer = AudioTrackPlayer()


        BleManager.getInstance().apply {
            notifyBattery { battery ->
                sendEvent(reactApplicationContext, "onBattery", Arguments.createMap().apply {
                    putInt("battery", battery)
                })
            }

            notifyModeSwitch { mode ->
                sendEvent(reactApplicationContext, "onModeSwitch", Arguments.createMap().apply {
                    putString("mode", if (mode == EchoMode.MODE_BELL_ECHO) "heart" else "lungs")
                })
            }


        }


        BleManager.getInstance().setAudioDataCallback(object : IAudioDataCallback {
            override fun onSpkData(spkData: ShortArray?) {
                return
                sendEvent(reactApplicationContext, "onSpkData", Arguments.createMap().apply {
                    val writeableArray = WritableNativeArray();
                    if (spkData != null) {
                        for (value in spkData) {
                            writeableArray.pushInt(value.toInt())
                        }
                    }
                    putArray("onSpkData", writeableArray)
                })
            }

            override fun onMicData(micData: ShortArray?) {
                return
                sendEvent(reactApplicationContext, "onMicData", Arguments.createMap().apply {
                    val writeableArray = WritableNativeArray();
                    if (micData != null) {
                        for (value in micData) {
                            writeableArray.pushInt(value.toInt())
                        }
                    }
                    putArray("onMicData", writeableArray)
                })
            }


            override fun onProcessData(processData: ShortArray?) {
                if (audioTrackPlayer != null) {
                    audioTrackPlayer!!.writeData(processData!!)
//                    waveView.addWaveData(processData)
                }
                sendEvent(reactApplicationContext, "onProcessData", Arguments.createMap().apply {
                    val writeableArray = WritableNativeArray();
                    if (processData != null) {
                        for (value in processData) {
                            writeableArray.pushInt(value.toInt())
                        }
                    }
                    putArray("onProcessData", writeableArray)
                })

                executorService.execute(Runnable {
                    try {
                        val f = fos
                        if (f != null) {
                            val data =
                                ArrayUtils.short2ByteArray(processData)
                            f.write(data, 0, data.size)
                        }
                    } catch (e: IOException) {
                        e.printStackTrace()
                    }
                })
            }

            override fun onHeartRate(heartRate: Int) {
                Log.e(TAG, "onHeartRate>>$heartRate")
                sendEvent(reactApplicationContext, "onHeartRate", Arguments.createMap().apply {
                    putInt("heartRate", heartRate)
                })
            }

        })
    }

    private fun createFile() {
        try {
            val rootFile = File(Environment.getExternalStorageDirectory(),"Android/data/" + reactApplicationContext.packageName + "/files/rmv")
            if(!rootFile.exists())
                rootFile.mkdirs()
            pcmFile = File(rootFile, System.currentTimeMillis().toString() + ".pcm")
            fos = FileOutputStream(pcmFile)
        } catch (e: FileNotFoundException) {
            e.printStackTrace()
        }
    }

    private fun closeFile() {
        try {
            if (fos != null) {
                fos!!.close()
                fos = null
            }
        } catch (e: IOException) {
            e.printStackTrace()
        }
    }
}