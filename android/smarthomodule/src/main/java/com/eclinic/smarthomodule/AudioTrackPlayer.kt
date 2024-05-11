package com.eclinic.smarthomodule

import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import java.util.LinkedList
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.Executors

class AudioTrackPlayer {
    private var mSigleExecutorService = Executors.newSingleThreadExecutor()
    private val minBufferSize: Int
    private var streamType = AudioManager.STREAM_MUSIC
    private var sampleRate = 8000
    private var channelConfig = AudioFormat.CHANNEL_OUT_MONO
    private var audioFormat = AudioFormat.ENCODING_PCM_16BIT
    private var mode = AudioTrack.MODE_STREAM
    private val dataQueue = ConcurrentLinkedQueue<ShortArray>()
    fun writeData(data: ShortArray) {
        if (!isStart) {
            return
        }
        //        synchronized (mInputQuene){
//            mInputQuene.add(data);
//        }
        dataQueue.add(data)
    }

    fun play() {
        isStart = true
        mInputQuene!!.clear()
        if (mAudioTrack == null) {
            mAudioTrack = AudioTrack(
                streamType,
                sampleRate,
                channelConfig,
                audioFormat,
                minBufferSize * 2,
                mode
            )
        }
        mAudioTrack!!.play()
        mSigleExecutorService.execute(playRun)
    }

    //    private Runnable playRun = new Runnable() {
    //        @Override
    //        public void run() {
    ////            mAudioTrack.play();
    //            while (isStart){
    //                synchronized (mInputQuene){
    //
    //                    if (mInputQuene!=null && mInputQuene.size()>0){
    //                        short[] data = mInputQuene.getFirst().clone();
    //                        mAudioTrack.write(data,0,data.length);
    //                        mInputQuene.removeFirst();
    //
    //                    }else {
    //                        Thread.yield();
    //                    }
    //                }
    //            }
    //        }
    //    };
    private val playRun = Runnable { //            mAudioTrack.play();
        while (isStart) {
            if (!dataQueue.isEmpty()) {
                val data = dataQueue.poll()
                mAudioTrack!!.write(data, 0, data.size)
            } else {
                Thread.yield()
            }
        }
    }

    init {
        streamType = AudioManager.STREAM_MUSIC
        sampleRate = 8000
        channelConfig = AudioFormat.CHANNEL_OUT_MONO
        audioFormat = AudioFormat.ENCODING_PCM_16BIT
        mode = AudioTrack.MODE_STREAM
        minBufferSize = AudioTrack.getMinBufferSize(sampleRate, channelConfig, audioFormat)
        mAudioTrack =
            AudioTrack(streamType, sampleRate, channelConfig, audioFormat, minBufferSize * 2, mode)
        mSigleExecutorService = Executors.newSingleThreadExecutor()
    }

    fun stop() {
        if (mAudioTrack != null && mAudioTrack!!.state == AudioTrack.STATE_INITIALIZED) {
            if (mAudioTrack!!.playState != AudioTrack.PLAYSTATE_STOPPED) {
                isStart = false
                dataQueue.clear()
                mAudioTrack!!.pause()
                mAudioTrack!!.flush()
                mAudioTrack!!.release()
                mAudioTrack = null
            }
        }
    }

    fun release() {
        try {
            if (mAudioTrack != null) {
                isStart = false
                stop()
                mAudioTrack!!.release()
                mAudioTrack = null
                mInputQuene!!.clear()
                mInputQuene = null
                dataQueue.clear()
            }
        } catch (e: RuntimeException) {
            e.printStackTrace()
        }
    }

    companion object {
        private var mAudioTrack: AudioTrack? = null
        private var mInputQuene: LinkedList<ShortArray>? = LinkedList()
        private var isStart = false
    }
}
