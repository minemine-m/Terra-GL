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
    // private _zIndex: number;
    constructor(id: string, options?: LayerOptions) {
        super();
        requireParam(id, "id", "Layer id must be specified");
        if (options) {
            this.opacity = options.opacity || 1;
        }
        // group的id无法设置，因为他是只读属性
        this._id = id;
    }
    getId(): string {
        return this._id;
    }
    addTo(map: Map) {
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
    // setOpacity(opacity: number) {
    //     this.opacity = opacity;

    //     this.children.forEach(child => {
    //         // 处理Mesh
    //         if (isMesh(child)) {
    //             const materials = Array.isArray(child.material)
    //                 ? child.material
    //                 : [child.material];


    //             materials.forEach((mat) => {
    //                 mat.transparent = true;
    //                 mat.opacity = opacity;
    //                 console.log(mat,'mat - ---------------- ')
    //             })

    //         }

    //         // 递归处理子Group
    //         if (child.children.length > 0) {
    //             this.setOpacity.call(child, opacity); // 保持this上下文
    //         }
    //     });


    // }

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
        if (!map) {
            return;
        }
        this.map = map;
        // if (!isNil(zIndex)) {
        //     this.setZIndex(zIndex);
        // }
        // this._switchEvents('on', this);

        // this.onAdd();

        // this.fire('add');
    }


}

Layer.mergeOptions(options)


