package com.eclinic.visionmodule.view;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.view.View;


public class EcgBackgroundView extends View {

    /**
     * 平均每秒上报的波形数据点数。
     */
    public final static int DATA_PER_SEC = 512;
    private final static float mm2Inches = 0.03937f;
    public static float xS;//每个格子的毫米尺寸
    public static float totalLattices;//平均总格子数
    private int mSmallGirdColor;
    private int mLargeGridColor;
    private Paint mPaintLargeGrid;
    private Paint mPaintSmallGrid;
    private int sizeX;
    private int sizeY;
    private float mViewWidth;
    private float mViewHeight;
    private float mViewHalfWidth;
    private float mViewHalfHeight;

    public EcgBackgroundView(Context context) {
        this(context, null);
    }

    public EcgBackgroundView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);

    }

    public EcgBackgroundView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    @SuppressLint("NewApi")
    public EcgBackgroundView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init();
    }


    private void init() {
        mPaintLargeGrid = new Paint();
        mPaintLargeGrid.setAntiAlias(true);
        mPaintLargeGrid.setColor(mLargeGridColor);
        mPaintLargeGrid.setStrokeWidth(2.0f);
        mPaintLargeGrid.setStyle(Paint.Style.FILL);

        mPaintSmallGrid = new Paint();
        mPaintSmallGrid.setAntiAlias(true);
        mPaintSmallGrid.setColor(mSmallGirdColor);
        mPaintSmallGrid.setStrokeWidth(1.0f);
        mPaintSmallGrid.setStyle(Paint.Style.FILL);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        for (int i = 0; i <= sizeX; i++) {
            final float x1 = mViewHalfWidth - i * xS;
            final float x2 = mViewHalfWidth + i * xS;
            if (i % 5 == 0) {
                canvas.drawLine(x1, 0, x1, mViewHeight, mPaintLargeGrid);
                if (i > 0) canvas.drawLine(x2, 0, x2, mViewHeight, mPaintLargeGrid);
            } else {
                canvas.drawLine(x1, 0, x1, mViewHeight, mPaintSmallGrid);
                canvas.drawLine(x2, 0, x2, mViewHeight, mPaintSmallGrid);
            }
        }
        for (int i = 0; i <= sizeY; i++) {
            final float y1 = mViewHalfHeight - i * xS;
            final float y2 = mViewHalfHeight + i * xS;
            if (i % 5 == 0) {
                canvas.drawLine(0, y1, mViewWidth, y1, mPaintLargeGrid);
                if (i > 0) canvas.drawLine(0, y2, mViewWidth, y2, mPaintLargeGrid);
            } else {
                canvas.drawLine(0, y1, mViewWidth, y1, mPaintSmallGrid);
                canvas.drawLine(0, y2, mViewWidth, y2, mPaintSmallGrid);
            }
        }
        //中心点
//        canvas.drawCircle(mViewHalfWidth, mViewHalfHeight, 4f, mPaintSmallGrid);
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        initDrawLatticeParams();
        super.onLayout(changed, left, top, right, bottom);
    }

    private void initDrawLatticeParams() {
        final DisplayMetrics dm = getResources().getDisplayMetrics();
        float density = dm.density; //屏幕密度（像素比例：0.75/1.0/1.5/2.0）
        mViewWidth = getWidth();
        mViewHeight = getHeight();
        mViewHalfWidth = mViewWidth / 2.0f;
        mViewHalfHeight = mViewHeight / 2.0f;
        final float xdpi = dm.xdpi; //屏幕横向每英寸所占像素数
        final float ydpi = dm.ydpi; //屏幕纵向每英寸所占像素数
        final float diffX = xdpi - 160.0f;
        final float diffY = ydpi - 160.0f;
        float multi = 1.0f;
        //判断 xdpi和ydpi 是否约等于160.0
        if ((diffX > -1.0f && diffX < 1.0f) && (diffY > -1.0f && diffY < 1.0f)) {
            //若是 根据根据像素密度校正。
            if (density == 2.0d) multi = 1.70f;
            if (density == 3.0d) multi = 2.52f;
        }
        final float viewXInches = mViewWidth / (xdpi * multi);
        final float viewYInches = mViewHeight / (ydpi * multi);
        float totalViewXmm = viewXInches / mm2Inches;//控件X轴毫米尺寸
        final float totalViewYmm = viewYInches / mm2Inches; //控件X轴毫米尺寸 1in = 25.4mm
        final float mmX0 = 0.5f * totalViewXmm;
        sizeX = (int) mmX0;
        if (mmX0 - sizeX >= 0.5f) sizeX = sizeX + 1;
        final double mmY0 = 0.5f * totalViewYmm;
        sizeY = (int) mmY0;
        if (mmY0 - sizeY >= 0.5f) sizeY = sizeY + 1;
        xS = mViewWidth / (viewXInches / mm2Inches); //每毫米所占像素
        totalLattices = mViewWidth / xS; //平均总格子数
    }
}
