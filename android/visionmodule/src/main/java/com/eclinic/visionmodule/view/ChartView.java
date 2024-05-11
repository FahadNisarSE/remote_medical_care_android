package com.eclinic.visionmodule.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PaintFlagsDrawFilter;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.PointF;
import android.graphics.PorterDuff;
import android.os.SystemClock;
import android.util.AttributeSet;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;


public class ChartView extends SurfaceView implements SurfaceHolder.Callback, Runnable {

    public static final int TIME_IN_FRAME = 30;
    volatile ThreadPoolExecutor singleThreadExecutor;//单线程池
    private SurfaceHolder mHolder;
    /**
     * 与SurfaceHolder绑定的Canvas
     */
    private Canvas mCanvas;
    /**
     * 用于绘制的线程
     */
    private Thread t;
    /**
     * 线程的控制开关
     */
    private boolean isRunning;
    /**
     * 线条画笔
     */
    private Paint linePaint;
    /**
     * 数据源
     */
    private List<PointF> datas;
    /**
     * x轴间隙
     */
    private float gapX = 0.2f;
    /**
     * 删除效果空隙
     */
    private int delGap = 50;
    /**
     * 待画区  最后一个点下标
     */
    private int index = 0;
    /**
     * 线条 开始和结束坐标
     */
    private PointF startPoint;
    private PointF endPoint;
    /**
     * 是否需要删除效果
     */
    private boolean isDelEffect = true;
    /**
     * 是否绘制 点
     */
    private boolean isDraw = false;
    /**
     * 1区和2区绘制路径
     */
    private Path path1, path2;
    private int pointIndex;//当前绘制波形下标
    private List<Integer> nativeDatas = null;
    /**
     * 平均每秒上报的波形数据点数。
     */
//    private final static int DATA_PRE_SECOND = 530;
    private int sampleRate = 512;
    private int drawPointCostTime = Math.round(1000F / 512);  //绘制每个采样点的时间 = 1000/sampleRate  ms

    /**
     * X轴时间基准（走纸速度）
     * pagerSpeed = 1: 25mm/s 25毫米（小格）每秒
     * pagerSpeed = 2 50mm/s  50毫米（小格）每秒
     */
    private int pagerSpeed = 1; // 1 ;2

    /**
     * Y轴增益
     * gain = 0.5  5mm/mV 波形增幅5毫米左右
     * gain = 1.0 10mm/mV 波形增幅10毫米左右
     * gain = 2.0 20mm/mV 波形增幅20毫米左右
     */
    private float gain = 1f;// 0.5;1 ;2
    /**
     * 当前屏幕波形满屏时最大的总点数。
     */
    private int allDataSize;
    private float totalLattices;
    private float dataSpacing;
    private float mViewWidth;
    private float mViewHalfHeight;
    private float xS;
    private boolean isClearData = false;

    public ChartView(Context context) {
        this(context, null);
    }

    public ChartView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public ChartView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);

        //initBitmap();

        mHolder = getHolder();
        mHolder.addCallback(this);

        setZOrderOnTop(true);// 设置画布 背景透明
        mHolder.setFormat(PixelFormat.TRANSLUCENT);

        // 设置可获得焦点
        setFocusable(true);
        setFocusableInTouchMode(true);
        // 设置常亮
        this.setKeepScreenOn(true);

        //线条画笔
        linePaint = new Paint();
//        linePaint.setStrokeWidth(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 1f, getContext().getResources().getDisplayMetrics()));
        linePaint.setStrokeWidth(5f);
        linePaint.setStyle(Paint.Style.STROKE);
        linePaint.setAntiAlias(true);
//        linePaint.setColor(getResources().getColo);

        //数据源
        datas = new ArrayList<PointF>();

    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        // 开启线程
        isRunning = true;
        t = new Thread(this);
        t.start();

//        singleThreadExecutor = new ThreadPoolExecutor(1, 1,
//                0L, TimeUnit.MILLISECONDS,
//                new LinkedBlockingQueue<Runnable>());
        startSingleThreadExecutor();
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

//        this.width = width;
//        this.height = height;
//
//        //计算 缩放比
//        scaleY = (this.height - offsetY * 2) / maxScopeY;
//        gapX = this.width / 1000;
//
//        widthSize = Math.round(this.width / gapX);
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        mViewWidth = getWidth();
        mViewHalfHeight = getHeight() / 2.0f;
        xS = EcgBackgroundView.xS;//控件每毫米的像素宽
        totalLattices = EcgBackgroundView.totalLattices;//平均总格子数
        final float dataPerLattice = sampleRate / (25.0f * pagerSpeed);//每格波形数据点数
        allDataSize = (int) (totalLattices * dataPerLattice); //一屏所有波形数据点数
        dataSpacing = xS / dataPerLattice;//每个数据点间距。
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        // 通知关闭线程
        isRunning = false;

        if (datas != null) {
            datas.clear();
        }

        if (mHolder != null) {
            mHolder.removeCallback(null);
        }

        if (singleThreadExecutor != null && !singleThreadExecutor.isShutdown()) {
//            singleThreadExecutor.shutdown();
            singleThreadExecutor.shutdownNow();
        }


        index = 0;
    }

    @Override
    public void run() {
        while (isRunning) {
            if (isDraw) {
                /**取得更新游戏之前的时间**/
                long startTime = System.currentTimeMillis();
                draw();
                isDraw = false;
                /**取得更新游戏结束的时间**/
                long endTime = System.currentTimeMillis();

                /**计算出游戏一次更新的毫秒数**/
                int diffTime = (int) (endTime - startTime);

                /**确保每次更新时间为30帧**/
                while (diffTime <= TIME_IN_FRAME) {
                    diffTime = (int) (System.currentTimeMillis() - startTime);
                    /**线程等待**/
                    Thread.yield();
                }
            }
        }
    }

    public synchronized void draw() {
        try {
            // 获得canvas
            mCanvas = mHolder.lockCanvas();
            if (mCanvas != null) {
                // drawSomething..
                mCanvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR);
                //mCanvas.drawColor(Color.BLACK);
                mCanvas.setDrawFilter(new PaintFlagsDrawFilter(0, Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG));

                //drawBg();
                drawLine();
//                if (index > width / gapX) {
//                    index = 0;
//                }
            }
        } catch (Exception e) {
        } finally {
            if (mCanvas != null)
                mHolder.unlockCanvasAndPost(mCanvas);
        }
    }

    /**
     * 画线
     */
    private void drawLine() {
        if (datas == null) {
            datas = new ArrayList<PointF>();
        }

        if (datas.size() < 4) {
            return;
        }

        if (startPoint == null || endPoint == null) {
            startPoint = new PointF();
            endPoint = new PointF();
        } else {
            startPoint.set(0, mViewHalfHeight / 2);
            endPoint.set(0, mViewHalfHeight / 2);
        }

        //数据集大小
        int size = datas.size();

        //绘制第一区
        if (path1 == null) {
            path1 = new Path();
        } else {
            path1.reset();
        }

        path1.moveTo(datas.get(1).x, datas.get(1).y);
        for (int i = 2; i < index; i++) {
            path1.lineTo(datas.get(i).x, datas.get(i).y);
        }

        //画第一区
//        startPoint.set(datas.get(0).x, datas.get(0).y);
//        drawLine(1, index);

        //是否  第一次画线
        if (!isDelEffect || size < allDataSize || (index + delGap + 2) >= allDataSize) {
            mCanvas.drawPath(path1, linePaint);
            return;
        }

        //绘制第二区
        if (path2 == null) {
            path2 = new Path();
        } else {
            path2.reset();
        }

        path2.moveTo(datas.get(index + delGap).x, datas.get(index + delGap).y);
        for (int i = index + delGap + 1; i < size - 1; i++) {
            path2.lineTo(datas.get(i).x, datas.get(i).y);
        }

        mCanvas.drawPath(path1, linePaint);
        mCanvas.drawPath(path2, linePaint);
    }

    public synchronized void addPoint(int y) {
        if (!isRunning) {
            return;
        }
        isClearData = false;
        if (nativeDatas == null) {
            nativeDatas = new ArrayList<>();
        }
        nativeDatas.add(y);
        if (sampleRate == 200) {
            if (nativeDatas.size() >= 64) {
                addPointThreadExecutor(nativeDatas);
                nativeDatas = new ArrayList<>();
            }
        } else if (sampleRate == 512) {
            if (nativeDatas.size() >= 256) {
                addPointThreadExecutor(nativeDatas);
                nativeDatas = new ArrayList<>();
            }
        }


//        addNativePoint(y);
    }

    /**
     * 添加点集合到线程池
     *
     * @param datas
     */
    public synchronized void addPointThreadExecutor(final List<Integer> datas) {
        if (!isRunning) {
            return;
        }
        if (datas == null) {
            return;
        }
        if (singleThreadExecutor == null || singleThreadExecutor.isShutdown()) {
            startSingleThreadExecutor();
            return;
        }
        int threadQueueSize = singleThreadExecutor.getQueue().size();
        if (threadQueueSize >= 5) {
            Log.e("ChartView", "" + singleThreadExecutor.getQueue().size());
            return;
        }

        try {
            singleThreadExecutor.execute(() -> {
                List<Integer> nativeData = datas;
                for (int i = 0; i < nativeData.size(); i++) {
                    if (isClearData) {
                        break;
                    }
                    if (sampleRate == 512) {
                        if (threadQueueSize > 2) {
                            if (i % 8 == 0) {
                                SystemClock.sleep(drawPointCostTime * 8L - 2);
                            }
                        } else {
                            if (i % 8 == 0) {
                                SystemClock.sleep(drawPointCostTime * 8L - 1);
                            }
                        }

                    } else if (sampleRate == 200) {

                        if (threadQueueSize > 2) {
                            if (i % 2 == 0) {
                                SystemClock.sleep(8);
                            }
                        } else {
                            if (i % 2 == 0) {
                                SystemClock.sleep(10);
                            }
                        }


                    }

                    addNativePoint(nativeData.get(i));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 添加点
     */
    public void addNativePoint(int y) {
        if (!isRunning) {
            return;
        }

        if (datas == null) {
            datas = new ArrayList<>();
        }

        //重新计算Y
        if (this.sampleRate == 512) {
            y = (int) (mViewHalfHeight + y * 18.3 / 128 * xS / 100 * gain);
        } else if (this.sampleRate == 200) {
            float realMv = calcRealMv(y);
            y = (int) (mViewHalfHeight + realMv * xS * gain * 10);
        }

        //判断超出范围
        if (y > (mViewHalfHeight * 2)) {
            y = (int) mViewHalfHeight * 2;
        } else if (y < 0) {
            y = 0;
        }
        //赋值或者追加
        if (datas.size() < allDataSize) {
            PointF point = new PointF(index * dataSpacing, y);
            datas.add(point);
        } else {
            datas.get(index).set(index * dataSpacing, y);
        }

        index++;

        //是否超过边界
        if (index >= allDataSize) {
            index = 0;
        }

        //开启绘制
        isDraw = true;

    }

    public void clearDatas() {
        if (datas != null) {
            datas.clear();
        }
        isClearData = true;
        startSingleThreadExecutor();
        index = 0;
        draw();
    }


    public void drawView() {
        //开启绘制
        isDraw = true;
    }


    /**
     * 设置删除效果 占位点个数
     *
     * @param delGap
     */
    public void setDelGap(int delGap) {
        this.delGap = delGap;
    }

    /**
     * 是否需要删除动画效果
     *
     * @param isDelEffect
     */
    public void setIsDelEffect(boolean isDelEffect) {
        this.isDelEffect = isDelEffect;
    }


    protected void startSingleThreadExecutor() {
        if (singleThreadExecutor != null && !singleThreadExecutor.isShutdown()) {
            singleThreadExecutor.shutdownNow();
        }

        singleThreadExecutor = new ThreadPoolExecutor(1, 1,
                0L, TimeUnit.MILLISECONDS,
                new ArrayBlockingQueue<>(10));
    }

    public void setPagerSpeed(int pagerSpeed) {
        this.pagerSpeed = pagerSpeed;
    }

    public float getGain() {
        return gain;
    }

    public void setGain(float gain) {
        if (this.sampleRate == 512) {
            this.gain = gain;
        } else if (this.sampleRate == 200) {
            this.gain = gain;
        }

    }

    public void setSampleRate(int sampleRate) {
        this.sampleRate = sampleRate;
        final float dataPerLattice = sampleRate / (25.0f * pagerSpeed);//每格波形数据点数
        allDataSize = (int) (totalLattices * dataPerLattice); //一屏所有波形数据点数
        dataSpacing = xS / dataPerLattice;//每个数据点间距。
        drawPointCostTime = Math.round(1000F / sampleRate);
    }

    /**
     * mintti  计算真实毫伏值
     *
     * @param point
     * @return
     */
    private float calcRealMv(int point) {

        return (float) (((point) * 12.247 / 9.5 / 8) / 1000);

    }

}
