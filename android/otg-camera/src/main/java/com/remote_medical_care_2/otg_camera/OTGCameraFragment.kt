package com.remote_medical_care_2.otg_camera

import android.R
import android.R.attr
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.jiangdg.ausbc.MultiCameraClient
import com.jiangdg.ausbc.base.CameraFragment
import com.jiangdg.ausbc.callback.ICameraStateCallBack
import com.jiangdg.ausbc.callback.IPreviewDataCallBack
import com.jiangdg.ausbc.widget.AspectRatioTextureView
import com.jiangdg.ausbc.widget.IAspectRatio
import io.agora.base.VideoFrame
import io.agora.base.VideoFrame.Buffer
import io.agora.rtc2.ChannelMediaOptions
import io.agora.rtc2.Constants
import io.agora.rtc2.IRtcEngineEventHandler
import io.agora.rtc2.RtcEngine
import io.agora.rtc2.video.AgoraVideoFrame
import io.agora.rtc2.video.VideoEncoderConfiguration
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.Base64
import java.util.Timer
import java.util.TimerTask


class OTGCameraFragment(val reactContext: ReactContext) : CameraFragment() {
    // TODO: Rename and change types of parameters
    private var param1: String? = null
    private var param2: String? = null
    private val TAG = "OTGCameraFragment"
    private var mRtcEngine: RtcEngine? = null
    private var isAgoraChannelJoined: Boolean = false

    private val timer = Timer()


    fun generateRandomColorBitmap(width: Int, height: Int): ByteArray {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val random = java.util.Random()

        // Generate random RGBA color for each pixel
        for (x in 0 until width) {
            for (y in 0 until height) {
                val color = Color.argb(255, random.nextInt(256), random.nextInt(256), random.nextInt(256))
                bitmap.setPixel(x, y, color)
            }
        }

        // Convert bitmap to byte array
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
        return outputStream.toByteArray()
    }

    fun startSendingDummyFrames(fps: Int) {
        val frameInterval = 1000L / fps // Calculate frame interval in milliseconds
        val timerTask = object : TimerTask() {
            override fun run() {
//                val dummyFrameData = generateDummyFrameData(100, 100)
                sendDummyFrame(generateRandomColorBitmap(360, 640))
            }
        }

        // Schedule frame sending with the desired frame rate
        timer.schedule(timerTask, 0, frameInterval)
    }

    private fun sendDummyFrame(dummyFrameData: ByteArray) {
        val videoFrame = AgoraVideoFrame()
        videoFrame.format = AgoraVideoFrame.FORMAT_RGBA
        videoFrame.stride = 100
        videoFrame.height = 100
        videoFrame.textureID = 2
        videoFrame.timeStamp = System.currentTimeMillis() // Set the timestamp
        videoFrame.buf = dummyFrameData

//        val vFrame = VideoFrame( ByteBuffer.wrap(dummyFrameData)., 0, System.currentTimeMillis())


        // Push the dummy frame to Agora RTC engine
        if (mRtcEngine != null) {
            Log.e(TAG, "sending dummy frame>>")
            mRtcEngine!!.pushExternalVideoFrame(videoFrame)
        }
    }

    private fun generateDummyFrameData(width: Int, height: Int): ByteArray {
        // Allocate memory for the dummy frame data
        val dummyFrameData = ByteArray(width * height * 4)

        // Fill the frame data with a specific color (e.g., green)
        for (i in 0 until dummyFrameData.size - 3) {
            dummyFrameData[i] = 0 // Alpha channel (transparent)
            dummyFrameData[i + 1] = 0 // Blue
            dummyFrameData[i + 2] = 255.toByte() // Green
            dummyFrameData[i + 3] = 0 // Red
        }

        return dummyFrameData
    }

    public fun joinChannel(accessToken: String, channelName: String, uid: Int) {
        setupCustomVideo()
        mRtcEngine!!.joinChannel(accessToken, channelName, "Extra Optional Data", uid)
        isAgoraChannelJoined = true
//        startSendingDummyFrames(30)
    }

    fun setupCustomVideo () {
        // Enable publishing of the captured video from a custom source
        val options = ChannelMediaOptions()
        options.publishCustomVideoTrack = true
        options.publishCameraTrack = false

        mRtcEngine!!.updateChannelMediaOptions(options)

        // Configure the external video source.
        mRtcEngine!!.setExternalVideoSource(
            true,
            true,
            Constants.ExternalVideoSourceType.VIDEO_FRAME
        )
    }

    fun initializeRtcEngine(){
        try {
            mRtcEngine = RtcEngine.create(reactContext, "7cb84b69b92a41b2adc21a19e1a32e3e",
                object: IRtcEngineEventHandler() {
                    override fun onUserJoined(uid: Int, elapsed: Int) {
                        // Called when a remote user joins the channel
                        Log.e(TAG, "User Joined")
                    }

                    override fun onUserOffline(uid: Int, reason: Int) {
                        // Called when a remote user leaves the channel or goes offline
                        Log.e(TAG, "User offline")

                    }

                    override fun onJoinChannelSuccess(channel: String?, uid: Int, elapsed: Int) {
                        super.onJoinChannelSuccess(channel, uid, elapsed)
                        isAgoraChannelJoined = true
                    }
                });
            mRtcEngine?.enableVideo();
            mRtcEngine?.setClientRole(IRtcEngineEventHandler.ClientRole.CLIENT_ROLE_BROADCASTER);
            mRtcEngine?.enableAudio();
            mRtcEngine?.setEnableSpeakerphone(true);
            mRtcEngine?.setVideoEncoderConfiguration(
                VideoEncoderConfiguration(
                    VideoEncoderConfiguration.VD_640x360,
                    VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_30,
                    VideoEncoderConfiguration.STANDARD_BITRATE,
                    VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_PORTRAIT
                )
            )

        } catch (e: Exception) {
            Log.e(TAG, Log.getStackTraceString(e));
            throw  RuntimeException("Agora RtcEngine initialization failed.");
        }
    }
    override fun getCameraView(): IAspectRatio? {
        return AspectRatioTextureView(requireContext())
    }

    override fun getCameraViewContainer(): ViewGroup? {
        return activity?.findViewById(com.remote_medical_care_2.otg_camera.R.id.cameraViewContainer)
    }

    override fun getRootView(inflater: LayoutInflater, container: ViewGroup?): View? {
        initializeRtcEngine()
        val view = layoutInflater.inflate(com.remote_medical_care_2.otg_camera.R.layout.fragment_otg_camera, container, false)
        return view.rootView
    }


    override fun onCameraState(
        self: MultiCameraClient.ICamera,
        code: ICameraStateCallBack.State,
        msg: String?
    ) {
        Log.e(TAG, "onCameraState>>" + self.isCameraOpened())
        if(self.isCameraOpened()){
            self.addPreviewDataCallBack(object: IPreviewDataCallBack {
                @RequiresApi(Build.VERSION_CODES.O)
                override fun onPreviewData(
                    data: ByteArray?,
                    width: Int,
                    height: Int,
                    format: IPreviewDataCallBack.DataFormat
                ) {
                    if(isAgoraChannelJoined){
                        val videoFrame = AgoraVideoFrame()
                        videoFrame.format = AgoraVideoFrame.FORMAT_RGBA
                        videoFrame.stride = width
                        videoFrame.height = height
                        videoFrame.textureID = 2
                        videoFrame.timeStamp = System.currentTimeMillis() // Set the timestamp

                        videoFrame.buf = data
                        // Check if the RTC engine is initialized before pushing the frame
                        // Check if the RTC engine is initialized before pushing the frame
                        if (mRtcEngine != null) {
                            mRtcEngine!!.pushExternalVideoFrame(videoFrame)
                        }
                    }
                }
            })
        }
    }
//    override fun onCameraState(
//        self: MultiCameraClient.ICamera,
//        code: ICameraStateCallBack.State,
//        msg: String?
//    ) {
//        Log.e(TAG, "onCameraState>>" + self.isCameraOpened())
//        if(self.isCameraOpened()){
//            self.addPreviewDataCallBack(object: IPreviewDataCallBack {
//                @RequiresApi(Build.VERSION_CODES.O)
//                override fun onPreviewData(
//                    data: ByteArray?,
//                    width: Int,
//                    height: Int,
//                    format: IPreviewDataCallBack.DataFormat
//                ) {
//
//                    val writeableArray = WritableNativeArray();
//                    if (data != null) {
//                        for (value in data) {
//                            writeableArray.pushInt(value.toInt())
//                        }
//                    }
//                    sendEvent(
//                        reactContext,
//                        "onPreviewData",
//                        Arguments.createMap().apply {
//                            putArray("data", writeableArray )
//                        })
//                    Log.e(TAG, "onPreviewData")
//                }
//            })
//        }
//    }

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getNativeModule(OTGCameraController::class.java)
            ?.sendEvent(reactContext, eventName, params)
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//
//        arguments?.let {
//            param1 = it.getString(com.remote_medical_care_2.ARG_PARAM1)
//            param2 = it.getString(com.remote_medical_care_2.ARG_PARAM2)
//        }
    }


    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment MeasurementFragment.
         */
        // TODO: Rename and change types and number of parameters
        @JvmStatic
        fun newInstance(param1: String, param2: String) =
            OTGCameraFragment(reactContext = this as ReactContext).apply {
                arguments = Bundle().apply {
//                    putString(com.remote_medical_care_2.ARG_PARAM1, param1)
//                    putString(com.remote_medical_care_2.ARG_PARAM2, param2)
                }
            }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
fun ByteArray.toBase64(): String =
    String(Base64.getEncoder().encode(this))