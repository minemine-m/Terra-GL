import { Group, Sprite } from "three";
import { BaseMixin, EventMixin } from "../core/mixins";
// import { isMesh } from "../utils";
import type { Map } from '../map';
export type LayerOptions = {
    attribution?: string,
    visible?: boolean,
    opacity?: number,
    zIndex?: number
}

import { requireParam } from "../utils/validate";

/**
 * 配置项
 *
 * @english
 * @property options=null                           - base options of layer.
 * @property options.attribution=null               - the attribution of this layer, you can specify company or other information of this layer.
 * @property options.visible=true                   - whether to display the layer.
 * @property options.opacity=1                      - opacity of the layer, from 0 to 1.
 * @property options.zIndex=undefined               - z index of the layer
 * @memberOf Layer
 * @instance
 */
const options: LayerOptions = {
    'attribution': '',
    'visible': true,
    'opacity': 1,
};
/**
 * 抽象类，不参与实例化
 * Layer is the base class of all layers.
 * @class Layer
 * @param {String} id - layer id.
 * @param {LayerOptions} [options=null] - options of layer.
 */
export abstract class Layer extends EventMixin(
    BaseMixin<typeof Group, any>(Group)
) {
    // public options: LayerOptions;
    private _id: string;
    public opacity: number = 1;
    private _animationCallbacks = new Set<() => void>();

    // private _zIndex: number;
    constructor(id: string, options?: LayerOptions) {
        super();
        requireParam(id, "id", "Layer id must be specified");
        if (options) {
            this.opacity = options.opacity || 1;
        }
        // group的id无法设置，因为他是只读属性
        this._id = id;

        // 自动注册子类的 animate 方法（如果存在）
        if (typeof (this as any).animate === 'function') {
            this._registerAnimate();
        }
    }
    getId(): string {
        return this._id;
    }
    addTo(map: Map) {
        // 处理云朵图层逻辑
        // if(this._clouds) {
        //     map.viewer.scene.add(this._clouds);
        // }
        map.addLayer(this);
        return this;
    }
    // TODO: implementatio
    // setZIndex(zIndex: number) {

    // }
    // TODO: implementatio
    getZIndex(): number {
        return 0;
    }
    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity: number) {
        this.opacity = opacity;

        // 递归处理所有子元素
        this.traverse((child) => {
            // 处理所有可能有material属性的对象
            if ('material' in child) {
                const materials = Array.isArray(child.material)
                    ? child.material
                    : [child.material];

                materials.forEach(mat => {
                    if ('opacity' in mat) {
                        mat.transparent = opacity < 1;
                        mat.opacity = opacity;
                        mat.needsUpdate = true;
                    }
                });
            }

            // 处理Sprite等特殊类型
            if (child instanceof Sprite) {
                child.material.opacity = opacity;
                child.material.transparent = opacity < 1;
                child.material.needsUpdate = true;
            }
        });
    }
    getMap() {
        if (this.map) {
            return this.map;
        }
        return null;
    }
    /**
     * 显示图层
     * @returns 
     */
    show(): this {
        if (!this.visible) {
            // 更新自身可见性
            this.visible = true;

            // 更新 options 状态
            this.options.visible = true;

            // 通知父级 Map
            const map = this.getMap();
            if (map) {
                // map.layerVisibilityChanged(this, true);
            }
        }
        return this;
    }
    /**
     * 隐藏图层
     * @returns this
     */
    hide(): this {
        if (this.visible) {
            //  更新自身可见性
            this.visible = false;

            //  更新 options 状态（保持一致性）
            this.options.visible = false;

            // 通知父级 Map 
            const map = this.getMap();
            if (map) {
                // map.layerVisibilityChanged(this, false);
            }
        }
        return this;
    }
    _bindMap(map: Map) {
        debugger
        if (!map) {
            return;
        }

        this.map = map;
        // 绑定动画
        if (typeof (this as any).animate === 'function') {
            this._registerAnimate();
        }
        // if (!isNil(zIndex)) {
        //     this.setZIndex(zIndex);
        // }
        // this._switchEvents('on', this);

        // this.onAdd();

        // this.fire('add');
    }


    /**
     * 子类可实现的动画逻辑（可选）
     *  @param delta 帧间隔时间
     */
    protected animate?(delta: number,elapsedtime:number): void;

    /**
     * 注册动画回调到 Viewer
     */
    private _registerAnimate() {
        const map = this.getMap();
        if (!map?.viewer) return;

        const removeCallback = map.viewer.addAnimationCallback((delta: number,elapsedtime:number) => {
            this.animate?.(delta,elapsedtime); // 调用子类的 animate 方法
        });

        this._animationCallbacks.add(removeCallback);
    }
    /**
     * 移除动画回调
     */
    protected _clearAnimationCallbacks() {
        this._animationCallbacks.forEach(remove => remove());
        this._animationCallbacks.clear();
    }


}

Layer.mergeOptions(options)


