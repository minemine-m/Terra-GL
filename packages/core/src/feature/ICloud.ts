import { Vector3 } from "three";
// import { Clouds, Cloud as vanillaCloud } from "@pmndrs/vanilla";
import { PointOptions, Point } from "./Point";
import { _createClouds } from "../utils/createobject";
import { Style } from "../style";


export type CloudOptions = PointOptions & {
    // emissive?: boolean;
    // emissiveIntensity?: number;
    // emissiveColor?: string;
    // castShadow?: boolean;
    // receiveShadow?: boolean;
    // iscity?: boolean;
};

const options: CloudOptions = {
    // emissive: false,
    // emissiveIntensity: 1.0,
    // emissiveColor: "#ffffff",
};

export class ICloud extends Point {
    _type: string = "Cloud";
    constructor(options: PointOptions) {
        //  // 创建几何体
        // const geometry = new THREE.BufferGeometry();
        super(options);
        // this._threeGeometry = this._createThreeGeometry();
        // // this.add(this._threeGeometry); // 将几何体添加到对象中
        // if (this._style) {
        //     this._style.applyTo(this._threeGeometry);
        // }
    }

    async _toThreeJSGeometry(): Promise<void> {
        // console.log(this._style,'this._stylethis._stylethis._style')
        this._position = this._coordsTransform() as Vector3;
        if (this._style) {
            // 创建新几何体前先清除旧引用
            if (this._threeGeometry) {
                // this.remove(this._threeGeometry);
                this._disposeGeometry(); // 清除旧的几何体
            }

            this._threeGeometry = await this._createObject(this._style);
            console.log(this._threeGeometry, '云朵');
            this._updateGeometry();

            // 强制触发场景图更新
            // this.dispatchEvent({ type: 'geometry-updated' });
        }
    }

    override _updateGeometry(): void {
        this._disposeGeometry();
        // console.log(this,'this--------')
        // console.log(this.getLayer(),'绑定的图层')
        const layer = this.getLayer(); // 获取绑定的图层实例

        // this.clear();
        if (this._threeGeometry) {
            this._threeGeometry.position.copy(this._position as any);
            this._threeGeometry.renderOrder = 999;
            console.log(layer, 'layer')
            if (layer) {
                layer._clouds.add(this._threeGeometry);
            }


            // this.updateMatrixWorld(true);
            // this._tryProcessQueue(); // 几何体更新后强制检查队列
        }
    }

    async _createObject(style: Style): Promise<any> {
        switch (style.config.type) {
            case "cloud":
                return _createClouds(style.config, this._position as Vector3);
            default:
                throw new Error(`不支持的样式类型: ${style.config.type}`);
        }
    }
}

ICloud.mergeOptions(options);