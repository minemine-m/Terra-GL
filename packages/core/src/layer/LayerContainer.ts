import { Group } from "three";
import { Layer } from "../layer/Layer"
/**
 * 图层容器类，用于管理多个图层
 */
export class LayerContainer extends Group {
    private _layers: Set<Layer> = new Set();
    _layerids: Set<string> = new Set(); // 用于存储所有图层的 ID

    // 重写 add，限制只能加 Layer
    override add(...layers: Layer[]): this {
        layers.forEach(layer => {
            if (!(layer instanceof Layer)) {
                throw new Error("LayerContainer can only contain Layer instances!");
            }
            const layerId = layer.getId();
            if (this._layerids.has(layerId)) {
                throw new Error(`Layer with ID '${layerId}' already exists in the container!`);
            }
            this._layers.add(layer);
            this._layerids.add(layerId); // 添加 ID 到 _layerid
            super.add(layer); // 调用 Group.add
        });
        return this;
    }

    // 重写 remove
    override remove(...layers: Layer[]): this {
        layers.forEach(layer => {
            this._layers.delete(layer);
            super.remove(layer); // 调用 Group.remove
        });
        return this;
    }

    // 获取所有图层
    getLayers(): Layer[] {
        return Array.from(this._layers);
    }
    /**
     * 根据 ID 查找 Layer
     * @param id 要查找的 Layer ID
     * @returns 找到的 Layer，如果不存在则返回 undefined
     */
    getLayerById(id: string): Layer | undefined {
        for (const layer of this._layers) {
            if (layer.getId() === id) {
                return layer;
            }
        }
        return undefined;
    }

    /**
     * 清空所有图层
     * @returns this，用于链式调用
     */
    clearLayers(): this {
        this._layers.clear(); // 清空 Set
        super.clear(); // 调用 Group.clear()，移除所有子对象
        return this; // 返回 this 以支持链式调用
    }
}