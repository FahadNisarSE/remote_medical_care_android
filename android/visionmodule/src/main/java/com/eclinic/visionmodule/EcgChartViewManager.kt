package com.eclinic.visionmodule

import android.util.Log
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.RelativeLayout
import androidx.fragment.app.FragmentActivity
import com.eclinic.visionmodule.view.ChartView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactPropGroup

class EcgChartViewManager(
    private val reactContext: ReactApplicationContext
) : ViewGroupManager<RelativeLayout>() {
    private val TAG = "EcgChartViewManager"

    private var propWidth: Int? = null
    private var propHeight: Int? = null
    private var propMarginTop: Int? = null


    override fun getName() = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): RelativeLayout =
        RelativeLayout(reactContext)

    override fun getCommandsMap() =
        mapOf("create" to COMMAND_CREATE, "updateWaveData" to COMMAND_UPDATE_WAVE_DATA)

    /**
     * Handle "create" command (called from JS) and call createFragment method
     */
    override fun receiveCommand(root: RelativeLayout, commandId: String?, args: ReadableArray?) {
        super.receiveCommand(root, commandId, args)
        val reactNativeViewId = requireNotNull(args).getInt(0)

        if (commandId != null) {
            when (commandId.toInt()) {
                COMMAND_CREATE -> createFragment(root, reactNativeViewId)
                COMMAND_UPDATE_WAVE_DATA -> {
                    val ecgView: ChartView = root.findViewById(R.id.ecg_view)

                    val waveData = args.getInt(1)
                    ecgView.addPoint(waveData)

                    Log.e(TAG, "Update command called ${args.getInt(1)}")
                }
            }
        }
    }

    @ReactPropGroup(names = ["width", "height", "marginTop"], customType = "Style")
    fun setStyle(view: RelativeLayout, index: Int, value: Int) {
        if (index == 0) propWidth = value
        if (index == 1) propHeight = value
        if (index == 2) propMarginTop = value
    }


    /**
     * Replace your React Native view with a custom fragment
     */
    fun createFragment(root: RelativeLayout, reactNativeViewId: Int) {
        val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
        setupLayout(parentView)

        val myFragment = EcgChartFragment()
        val activity = reactContext.currentActivity as FragmentActivity
        activity.supportFragmentManager
            .beginTransaction()
            .replace(reactNativeViewId, myFragment, reactNativeViewId.toString())
            .commit()
    }

    fun setupLayout(view: View) {
        Choreographer.getInstance().postFrameCallback(object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                manuallyLayoutChildren(view)
                view.viewTreeObserver.dispatchOnGlobalLayout()
                Choreographer.getInstance().postFrameCallback(this)
            }
        })
    }

    /**
     * Layout all children properly
     */
    private fun manuallyLayoutChildren(view: View) {
        // propWidth and propHeight coming from react-native props
        val width = requireNotNull(propWidth)
        val height = requireNotNull(propHeight)
        val marginTop = requireNotNull(propMarginTop)

        view.measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
        )

        view.layout(0, marginTop, width, height)
    }

    companion object {
        private const val REACT_CLASS = "EcgChartViewManager"
        private const val COMMAND_CREATE = 1
        private const val COMMAND_UPDATE_WAVE_DATA = 2
    }
}