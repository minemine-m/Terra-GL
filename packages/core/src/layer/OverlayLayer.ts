
import { Object3D } from 'three';
import { LayerOptions, Layer } from './Layer';
import { Feature } from '../feature/Feature';
// import { isNil } from '../utils';

export type OverlayLayerOptions<T extends Feature> = LayerOptions & {
    features?: T[]; // 泛型约束 Feature 类型
};

/**
 * Layer的基类， 管理features
 * 抽象类，不能直接实例化
 */
export abstract class OverlayLayer<T extends Feature = Feature> extends Layer {
    private _feaList: T[]; // 使用泛型约束数组类型
    constructor(id: string, options?: OverlayLayerOptions<T>) {
        super(id, options);
        this._feaList = [];
        // Object.assign(this, options);
    }
    /** 
     *  子类必须实现的校验逻辑（抽象方法）
     *  @param feature 待校验的 Feature
     *  @returns 是否合法
    **/
    protected abstract validateFeature(feature: T): boolean;
    /**
     * 添加Feature到图层
     * @param feature 要添加的Feature实例或实例数组
     * @param fitView 是否自动调整地图视野
     */
    addFeature(features: T | T[]): this {
        const featuresArray = Array.isArray(features) ? features : [features];

        for (const feature of featuresArray) {
            if (!feature || !(feature instanceof Feature)) continue;
            if (feature.getLayer()) continue;

            // 调用子类实现的校验方法
            if (!this.validateFeature(feature)) {
                console.error(`Feature ${feature.id} does not match the layer's type requirements`);
                continue;
            }

            feature._bindLayer(this);
            this._feaList.push(feature);

            if (feature.getMap()) {
                feature._toThreeJSGeometry();
            }
            // debugger
            if(this._clouds){
                this.map.viewer.scene.add(this._clouds);
                console.log('我是云朵被添加cloud', this.map.viewer.scene)
                // this._clouds.add(feature._threeGeometry);
                // console.log( this._clouds,'我是云朵被添加')
              
            }
            this.add(feature);
        }

        return this;
    }
    /**
     * 获取所有的Features
     * @param filter 
     * @param context 
     * @returns 
     */
    getFeatures(filter?: (feature: Feature) => boolean, context?: any): Array<Feature> {
        if (!filter) {
            return this._feaList.slice(0);
        }
        const result = [];
        let geometry, filtered;
        for (let i = 0, l = this._feaList.length; i < l; i++) {
            geometry = this._feaList[i];
            if (context) {
                filtered = filter.call(context, geometry);
            } else {
                filtered = filter(geometry);
            }
            if (filtered) {
                result.push(geometry);
            }
        }
        return result;
    }

    /**
    * 获取 features 个数
    *
    * Get count of the features
    * @return count
    */
    getCount(): number {
        return this._feaList.length;
    }
    /**
     * layer 是否为空
    *
    * @english
    * Whether the layer is empty.
    * @return {Boolean}
    */
    isEmpty(): boolean {
        return !this._feaList.length;
    }

    /**
    * 移除一个或多个features
    *
    * @english
    * Removes one or more features from the layer
    * @param  features - feature ids or features to remove
    * @returns this
    */
    removeFeature(features: Feature | Feature[]): any {
        if (!Array.isArray(features)) {
            return this.removeFeature([features]);
        }
        for (let i = features.length - 1; i >= 0; i--) {
            if (!(features[i] instanceof Feature)) {
                features[i] = this.removeFeature(features[i]);
            }
            if (!features[i] || this !== features[i].getLayer()) continue;
            features[i]._remove();
        }
        return this;
    }

    onRemoveFeature(feature: Feature) {
        if (!feature) return;

        // 检查feature是否属于该图层
        if (this !== feature.getLayer()) {
            return;
        }

        // 从列表中移除
        const idx = this._findInList(feature);
        if (idx >= 0) {
            this._feaList.splice(idx, 1);
        }

        // 安全地从父级移除
        if (feature.parent && feature.parent === this) {
            this.remove(feature);
        } else {
            console.warn("Feature parent mismatch:", feature.parent);
        }

        // 安全释放资源
        this._disposeFeatureResources(feature);
    }

    //binarySearch
    //@internal
    _findInList(feature: Feature): number {
        // 二分查找算法，需要和图层的index结合
        // console.log(feature, '执行了查找方法');
        const len = this._feaList.length;
        if (len === 0) {
            return -1;
        }
        // this._sortGeometries();
        let low = 0,
            high = len - 1,
            middle;
        while (low <= high) {
            middle = Math.floor((low + high) / 2);
            if (this._feaList[middle] === feature) {
                return middle;
            } else {
                low = middle + 1;
            }
        }
        return -1;
    }

    private _disposeFeatureResources(feature: Feature) {
        try {
            // 处理几何体
            if (feature.geometry && feature.geometry.dispose) {
                feature.geometry.dispose();
                // console.log('执行了geometry的释放方法');
            }

            // 处理材质
            if (feature.material) {
                if (Array.isArray(feature.material)) {
                    feature.material.forEach(mat => mat.dispose?.());
                } else if (feature.material.dispose) {
                    feature.material.dispose();
                    // console.log('执行了材质的释放方法');
                }
            }

            // 处理嵌套的Object3D
            if (feature instanceof Object3D) {
                feature.traverse(child => {
                    if (child !== feature) { // 避免重复处理
                        this._disposeFeatureResources(child as any);
                    }
                });
            }
        } catch (e) {
            console.error('Error disposing feature resources:', e);
        }
    }

    // _add() {

    // }
}

// OverlayLayer.mergeOptions({});