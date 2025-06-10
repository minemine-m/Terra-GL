import { Point as GeoJSONPoint, MultiPoint as GeoJSONMultiPoint, LineString as GeoJSONLineString, MultiLineString as GeoJSONMultiLineString, Polygon as GeoJSONPolygon, MultiPolygon as GeoJSONMultiPolygon } from 'geojson';
import { Line2 } from 'three-stdlib';
import { Object3D, Vector3, Mesh } from 'three';
import { BaseMixin, EventMixin } from "../core/mixins";
import { requireParam } from "../utils/validate";
import { OverlayLayer } from '../layer/OverlayLayer';
import { Style, StyleInput } from '../style/index';

import type { Map } from '../map';
export type FeatureOptions = {
    id?: string;
    geometry?: GeoJSON.Geometry;
    visible?: boolean;
    defaultProjection?: string;
    style?: StyleInput;
    userData?: { [key: string]: any };
    rotateAngle?: number;

}

// 定义所有GeoJSON几何类型的联合类型
export type GeoJSONGeometry =
    | GeoJSONPoint
    | GeoJSONMultiPoint
    | GeoJSONLineString
    | GeoJSONMultiLineString
    | GeoJSONPolygon
    | GeoJSONMultiPolygon;



export abstract class Feature extends EventMixin(
    BaseMixin<typeof Object3D, any>(Object3D)
) {
    // Geometry properties
    _position: Vector3 | Vector3[];
    _threeGeometry: Object3D | Line2;
    _geometry: GeoJSONGeometry;
    //@ts-ignore  
    _layer?: OverlayLayer;

    // Style management
    _style?: Style;
    private _styleQueue: StyleInput[] = [];
    private _isApplyingStyle = false;
    private _isGeometryInitializing = false;

    constructor(options: FeatureOptions) {
        super();
        requireParam(options.geometry, "geometry", "geometry must be specified");
        this._geometry = options.geometry as GeoJSONGeometry;;
        this._position = new Vector3(0, 0, 0);
        this._threeGeometry = new Object3D();
        // 处理属性存储
        if (options.userData) {
            this.userData = Object.assign(
                {},
                JSON.parse(JSON.stringify(options.userData))
            );
        }
        if (options.style) {
            this.setStyle(options.style);
        }
    }
    // 核心模板方法 ==============================================
    async initializeGeometry(): Promise<void> {
        if (this._isGeometryInitializing || this._threeGeometry) return;
        this._isGeometryInitializing = true;
        try {
            await this._toThreeJSGeometry(); // 子类实现
            this._processStyleQueue(); // 处理积压的样式变更
        } finally {
            this._isGeometryInitializing = false;
        }
    }

    // 抽象方法（子类必须实现） ==================================
    abstract _toThreeJSGeometry(): Promise<void> | void;
    // protected abstract _createObject(style: Style): Promise<Object3D> | Object3D;

    // 样式管理 ================================================
    // setStyle(input: StyleInput): this {
    //     const style = Style.create(input);
    //     this._style = style;

    //     if (this._threeGeometry) {
    //         this._applyStyleWithRetry(style);
    //     } else {
    //         this._styleQueue.push(input);
    //         this.initializeGeometry(); // 自动触发初始化
    //     }
    //     return this;
    // }

    setStyle(input: StyleInput): this {
        // 1. 标准化输入（支持Style实例或配置对象）
        const style = input instanceof Style ? input : new Style(input);

        // 2. 更新当前样式引用
        this._style = style;

        // 3. 必须深拷贝配置对象，避免外部修改影响队列
        const configCopy = JSON.parse(JSON.stringify(style.config));
        this._styleQueue.push(configCopy);

        // 4. 打印调试信息（生产环境可移除）
        // console.debug(`[Feature] 样式入队，当前队列长度: ${this._styleQueue.length}`, {
        //     type: configCopy.type,
        //     queueDepth: this._styleQueue.length
        // });

        // 5. 立即尝试处理
        this._tryProcessQueue();

        return this;
    }

    getStyle(): Style | undefined {
        return this._style;
    }

    private async _applyStyleWithRetry(
        style: Style,
        maxRetries: number = 3,
        baseDelay: number = 100
    ): Promise<void> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // 1. 确保几何体已挂载
                if (!this._threeGeometry!.parent) {
                    this.add(this._threeGeometry!);
                    await new Promise(r => requestAnimationFrame(r)); // 等待一帧
                }

                // 2. 实际应用
                await style.applyTo(this._threeGeometry!);
                return; // 成功则退出

            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt - 1); // 指数退避
                    console.warn(`[Feature] 重试中... (${attempt}/${maxRetries})`, {
                        delay,
                        error
                    });
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        // 重试耗尽
        throw lastError || new Error(`样式应用失败，重试次数耗尽`);
    }



    private async _processStyleQueue(): Promise<void> {
        // 二次验证（防御竞态条件）
        if (!this._threeGeometry || this._isApplyingStyle || this._styleQueue.length === 0) {
            console.warn('[Feature] 取消处理：不满足运行时条件');
            return;
        }

        // 加锁
        this._isApplyingStyle = true;
        const currentStyle = this._styleQueue[0];

        try {
            // 1. 验证样式有效性
            if (!currentStyle) {
                throw new Error(`无效样式配置: ${JSON.stringify(currentStyle)}`);
            }

            // 2. 创建样式实例（深拷贝保护）
            const styleInstance = new Style(JSON.parse(JSON.stringify(currentStyle)));

            // 3. 应用样式（带重试机制）
            await this._applyStyleWithRetry(styleInstance);

            // 4. 成功后才移除队列项
            this._styleQueue.shift();

            // 5. 递归处理剩余队列
            if (this._styleQueue.length > 0) {
                await this._processStyleQueue();
            }
        } catch (error) {
            console.error('[Feature] 样式应用失败:', {
                error,
                // styleType: currentStyle?.type,
                remainingQueue: this._styleQueue.length
            });
            throw error; // 向上传递
        } finally {
            // 释放锁
            this._isApplyingStyle = false;

            // 最终检查（处理可能的新入队项）
            if (this._styleQueue.length > 0) {
                this._tryProcessQueue();
            }
        }
    }

    // 新增方法：智能触发队列处理
    _tryProcessQueue(): void {
        // 条件检查三元组（全部满足才处理）
        const shouldProcess = (
            this._threeGeometry &&         // 有几何体
            !this._isApplyingStyle &&      // 无并发冲突
            this._styleQueue.length > 0    // 队列非空
        );

        if (shouldProcess) {
            // 启动处理（包含错误隔离）
            this._processStyleQueue()
                .then(() => {
                    // console.debug('[Feature] 队列处理完成');
                })
                .catch((error) => {
                    console.error('[Feature] 队列处理失败:', error);
                    // 自动恢复：重置状态并重新尝试
                    this._isApplyingStyle = false;
                    this._tryProcessQueue();
                });
        } else {
            // 不满足条件时的补偿机制
            if (!this._threeGeometry && !this._isGeometryInitializing) {
                console.debug('[Feature] 触发延迟初始化');
                this.initializeGeometry();
            }
        }
    }

    // 图层管理 ================================================
    addTo(layer: OverlayLayer): this {
        layer.addFeature(this);
        return this;
    }

    getLayer(): OverlayLayer | null {
        return this._layer || null;
    }

    getMap(): Map | null {
        return this._layer?.getMap() || null;
    }

    _bindLayer(layer: OverlayLayer): void {
        // console.log('验证一下 ------------------------------', this);
        if (this._layer && this._layer !== layer) {
            throw new Error('Feature cannot be added to multiple layers');
        }

        this._layer = layer;

    }

    // 几何体更新 ==============================================
    _updateGeometry(): void {
        this._disposeGeometry();
        // this.clear();
        if (this._threeGeometry) {
            this._threeGeometry.position.copy(this._position as any);
            this._threeGeometry.renderOrder = 999;
            this.add(this._threeGeometry);
            this.updateMatrixWorld(true);
            this._tryProcessQueue(); // 几何体更新后强制检查队列
        }
    }
    /**
  * 将其自身从图层中移除（如果有的话）。
  * @english
  * remove itself from the layer if any.
  * @returns {Feature} this
  */
    _remove() {
        const layer = this.getLayer();
        if (!layer) {
            return this;
        }
        this._unbind();
        return this;
    }

    _unbind(): void {
        const layer = this.getLayer();
        if (!layer) {
            return;
        }
        if (layer.onRemoveFeature) {
            layer.onRemoveFeature(this);
        }
        delete this._layer;
    }

    _disposeGeometry(): void {
        if (!this._threeGeometry) return;
        this.clear();
        // 递归释放资源
        if ('traverse' in this) {
            (this._threeGeometry as Object3D).traverse(obj => {
                if (obj instanceof Mesh) {
                    obj.geometry?.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material?.dispose();
                    }
                }
                // 特殊处理Line2等类型
                else if ('isLine' in obj && obj.isLine) {
                    (obj as any).geometry?.dispose();
                    (obj as any).material?.dispose();
                }
            });
        }

        // 清除引用
        // this._threeGeometry = null!;
    }

    
}