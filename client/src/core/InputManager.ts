import type { Game } from './Game';

/**
 * 输入管理器 - 处理鼠标拖拽、缩放、触摸手势
 */
export class InputManager {
    private game: Game;

    // 拖拽状态
    public isDragging = false;
    public dragStartX = 0;
    public dragStartY = 0;

    // 缩放
    public scale = 1;
    public minScale = 0.3;
    public maxScale = 3;

    // 回调
    private onDragCallbacks: Array<(dx: number, dy: number) => void> = [];
    private onZoomCallbacks: Array<(scale: number) => void> = [];

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * 初始化事件监听
     */
    public init(): void {
        const canvas = this.game.app.canvas as HTMLCanvasElement;

        // 鼠标拖拽
        canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX, e.clientY));
        canvas.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
        canvas.addEventListener('mouseup', () => this.onPointerUp());
        canvas.addEventListener('mouseleave', () => this.onPointerUp());

        // 触摸拖拽
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchend', () => this.onPointerUp());

        // 鼠标滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom(delta);
        }, { passive: false });

        console.log('[InputManager] 输入管理器初始化完成');
    }

    /**
     * 注册拖拽回调
     */
    public onDrag(callback: (dx: number, dy: number) => void): void {
        this.onDragCallbacks.push(callback);
    }

    /**
     * 注册缩放回调
     */
    public onZoom(callback: (scale: number) => void): void {
        this.onZoomCallbacks.push(callback);
    }

    private onPointerDown(x: number, y: number): void {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
    }

    private onPointerMove(x: number, y: number): void {
        if (!this.isDragging) return;

        const dx = x - this.dragStartX;
        const dy = y - this.dragStartY;
        this.dragStartX = x;
        this.dragStartY = y;

        this.onDragCallbacks.forEach((cb) => cb(dx, dy));
    }

    private onPointerUp(): void {
        this.isDragging = false;
    }

    private zoom(delta: number): void {
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));
        this.onZoomCallbacks.forEach((cb) => cb(this.scale));
    }
}
