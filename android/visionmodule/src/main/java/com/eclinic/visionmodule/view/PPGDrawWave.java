package com.eclinic.visionmodule.view;

import android.graphics.Canvas;
import android.graphics.Paint;

import java.util.ArrayList;
import java.util.List;


public class PPGDrawWave extends DrawWave<Integer> {

    //定义PPG波的颜色
    private final static int waveColor = 0xffff0000;
    //定义波的线粗
    private final static float waveStrokeWidth = 2f;
    //定义X轴方向data间距
    private final static int X_INTERVAL = 2;
    private float mViewWidth;
    private float mViewHeight;
    private float dataMax;
    private float dataMin;
    private float dp;
    private Paint mWavePaint;

    public PPGDrawWave() {
        super();
        mWavePaint = newPaint(waveColor, waveStrokeWidth);
    }

    @Override
    public void initWave(float width, float height) {
        mViewWidth = width;
        mViewHeight = height;
        allDataSize = mViewWidth / X_INTERVAL;
    }

    @Override
    public void clear() {
        super.clear();
        dataMax = dataMin = 0;
        dp = 0f;
    }

    @Override
    public void drawWave(Canvas canvas) {
        final List<Integer> list = new ArrayList<>(dataList);
        int size = list.size();
        if (size >= 2) {
            dataMax = dataMin = list.get(0);
            for (int i = 0; i < size; i++) {
//                Log.d("PPGDrawWave", "y2: "+list.get(i));
                try {
                    float dataI = list.get(i);
                    if (dataI < dataMin) {
                        dataMin = dataI;
                    }
                    if (dataI > dataMax) {
                        dataMax = dataI;
                    }
                } catch (NullPointerException e) {
                    e.fillInStackTrace();
                }
            }
            dp = (dataMax - dataMin) / (mViewHeight - mViewHeight / 10 * 2);
            if (dp == 0) {
                dp = 1f;
            }
//            Log.d("PPGDrawWave", "dp:"+dp+"data="+list.get(0));
            for (int i = 0; i < size - 1; i++) {
                Integer ppgDataCurr;
                Integer ppgDataNext;
                try {
                    ppgDataCurr = list.get(i);
                } catch (IndexOutOfBoundsException e) {
                    ppgDataCurr = list.get(i - 1);
                }
                try {
                    ppgDataNext = list.get(i + 1);
                } catch (IndexOutOfBoundsException e) {
                    ppgDataNext = list.get(i);
                }
//                Log.d("PPGDrawWave", "ppgDataCurr: "+ppgDataCurr+" ppgDataNext: "+ppgDataNext);
                float x1 = getX(i, size);
                float x2 = getX(i + 1, size);
                float y1 = getY(ppgDataCurr);
                float y2 = getY(ppgDataNext);
                canvas.drawLine(x1, y1, x2, y2, mWavePaint);
            }
        }
    }

    @Override
    protected float getX(int value, int size) {
        try {
            return mViewWidth - ((size - 1 - value) * X_INTERVAL);
        } catch (NullPointerException e) {
            return 0;
        }
    }

    @Override
    protected float getY(Integer ppgData) {
        try {
//            Log.d("PPGDrawWave", "mViewHeight: "+mViewHeight+" dataMin: "+dataMin+"dp:"+dp+"ppgData:"+ppgData);
            return mViewHeight - mViewHeight / 10 - (ppgData - dataMin) / (dp);
        } catch (NullPointerException e) {
            return 0;
        }
    }
}
