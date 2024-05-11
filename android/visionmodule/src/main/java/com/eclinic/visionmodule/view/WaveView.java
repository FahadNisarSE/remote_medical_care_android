package com.eclinic.visionmodule.view;

import android.content.Context;
import android.graphics.Canvas;
import android.util.AttributeSet;
import android.view.View;


public class WaveView extends View {

    protected DrawWave mDrawWave;
    private boolean scrollable;

    public WaveView(Context context) {
        super(context);
    }

    public WaveView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public WaveView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        if (mDrawWave != null)
            mDrawWave.initWave(getWidth(), getHeight());
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (mDrawWave != null)
            mDrawWave.drawWave(canvas);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        if (scrollable && mDrawWave != null) {
            widthMeasureSpec = mDrawWave.getWidthMeasureSpec();
            setMeasuredDimension(widthMeasureSpec, heightMeasureSpec);
        } else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        }
    }

    public <T> void setDrawWave(DrawWave<T> drawWave) {
        mDrawWave = drawWave;
        mDrawWave.setView(this);
        requestLayout();
    }


}
