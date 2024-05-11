package com.eclinic.visionmodule.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.util.AttributeSet;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;

import androidx.annotation.NonNull;


public class WaveSurfaceView extends SurfaceView implements Runnable, SurfaceHolder.Callback {

    private final static long sleepTimeMillis = 20L;
    private final SurfaceHolder mSurfaceHolder;
    public DrawWave mDrawWave;
    private boolean isLoop;
    private Thread mDrawWaveThread;
    private boolean isPause;

    public WaveSurfaceView(Context context) {
        super(context);
        mSurfaceHolder = getHolder();

    }

    public WaveSurfaceView(Context context, AttributeSet attrs) {
        super(context, attrs);
        mSurfaceHolder = getHolder();
    }

    public WaveSurfaceView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        mSurfaceHolder = getHolder();
    }


    @Override
    protected void onVisibilityChanged(@NonNull View changedView, int visibility) {
        super.onVisibilityChanged(changedView, visibility);
        if (visibility == VISIBLE) {
            isLoop = true;
        } else if (visibility == INVISIBLE) {
            isLoop = false;
        }

    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
//        logger("surfaceCreated");
        isLoop = true;
        //创建并启动一个画图线程。
        mDrawWaveThread = new Thread(this);
        mDrawWaveThread.start();
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
//        logger("surfaceChanged - width:" + width + ", height:" + height);
        mDrawWave.initWave(getWidth(), getHeight());
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
//        logger("surfaceDestroyed");
        //销毁画图线程。
        isLoop = false;
        mDrawWaveThread = null;
    }

    @Override
    public void run() {
        while (isLoop) {
//            logger("run()");
            synchronized (mSurfaceHolder) {
                if (isPause) {
                    try {
                        mSurfaceHolder.wait();
//                        logger(" mSurfaceHolder.wait()");
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                Canvas canvas = null;
                try {
                    canvas = mSurfaceHolder.lockCanvas();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                if (canvas == null) {
                    isLoop = false;
//                    logger("canvas == null, return");
                    return;
                }
                canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR);
                mDrawWave.drawWave(canvas);
                try {
                    mSurfaceHolder.unlockCanvasAndPost(canvas);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            try {
                Thread.sleep(sleepTimeMillis);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 恢复SurfaceView的图形刷新循环
     * 当处于暂停时有效。
     */
    public void reply() {
        if (!isPause) return;
        isPause = false;
        synchronized (mSurfaceHolder) {
            try {
                mSurfaceHolder.notify();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void pause() {
        isPause = true;
    }

    public <T> void setDrawWave(DrawWave<T> drawWave) {
        this.mDrawWave = drawWave;
        setZOrderOnTop(true);
        setFocusable(true);
        mSurfaceHolder.setFormat(PixelFormat.TRANSPARENT);
        mSurfaceHolder.addCallback(this);
    }
}