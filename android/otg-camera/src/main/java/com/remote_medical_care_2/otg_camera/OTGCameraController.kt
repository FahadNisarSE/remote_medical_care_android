package com.remote_medical_care_2.otg_camera

import android.os.Handler
import android.os.Message
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.jiangdg.ausbc.MultiCameraClient
import com.jiangdg.ausbc.base.CameraActivity
import com.jiangdg.ausbc.callback.ICameraStateCallBack

@ReactModule(name = "OTGCameraModule")
class OTGCameraController(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),

    Handler.Callback {

    val TAG = "OTGCameraController"
    private val moduleName = "OTGCameraModule"
    var mHandler = Handler(reactContext.mainLooper, this)


    private val MSG_SCAN_DELAY = 0x01
    private val REQUEST_ENABLE_BT = 1
    private var isScanning = false


    override fun getName(): String {
        return moduleName
    }




    public fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }


    override fun handleMessage(msg: Message): Boolean {
        if (msg.what == MSG_SCAN_DELAY) {
            isScanning = false;
            return true;
        }
        return false;
    }

    @ReactMethod
    fun sayHi(){
        Log.e(TAG, "HI")
    }

    override fun initialize() {
        Log.e(TAG, "Initialized is called")
        super.initialize()

    }

}
