package com.eclinic

import android.view.ViewGroup
import com.eclinic.smarthomodule.SmarthoController
import com.eclinic.smarthomodule.SmarthoViewManager
import com.eclinic.visionmodule.VisionController
import com.eclinic.visionmodule.VisionViewManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewGroupManager
import com.remote_medical_care_2.otg_camera.OTGCameraController
import com.remote_medical_care_2.otg_camera.OTGCameraViewManager


class SmartDevicesPackage : ReactPackage {
    override fun createNativeModules(reactAppContext: ReactApplicationContext): MutableList<NativeModule> {
        val modules: MutableList<NativeModule> = arrayListOf()
        modules.add(SmarthoController(reactAppContext))
        modules.add(OTGCameraController(reactAppContext))
        modules.add(VisionController(reactAppContext))
        return modules
    }

    override fun createViewManagers(reactAppContext: ReactApplicationContext): MutableList<ViewGroupManager<out ViewGroup>> {
        return mutableListOf(
            OTGCameraViewManager(reactAppContext),
            VisionViewManager(reactAppContext),
            SmarthoViewManager(reactAppContext)
        )
    }
}