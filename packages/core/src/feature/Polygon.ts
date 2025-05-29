
import { Object3D } from 'three';
import { _createBasePolygon, _createExtrudedPolygon, _createWaterSurface,_createBaseWaterSurface } from '../utils/createobject';
import { Style } from '../style';
import { Surface, SurfaceOptions } from './Surface';
import { Polygon as GeoJSONPolygon, MultiPolygon as GeoJSONMultiPolygon } from 'geojson';
import { Map } from '../map';

export type PolygonOptions = SurfaceOptions & {
    // type?: 'circle' | 'icon';
    geometry?: GeoJSONPolygon | GeoJSONMultiPolygon;
}
const options: PolygonOptions = {
    // type: 'circle', // 默认为 Point geometr
};

export class Polygon extends Surface {
    _type: string = 'Polygon';
    constructor(options: PolygonOptions) {
        super(options);
        // this._type = options.type || 'circle'; // 设置类型
    }
    async _toThreeJSGeometry(): Promise<void> {
        let { _vertexPoints } = this._coordsTransform(); // 进行坐标转换
        // console.log(JSON.stringify(_vertexPoints), '_vertexPoints')
        // console.log(JSON.stringify(_positions), '_positions')
        this._vertexPoints = _vertexPoints;
        // console.log(this._vertexPoints, 'this._vertexPoints')
        if (this._style) {
            // 创建新几何体前先清除旧引用
            if (this._threeGeometry) {
                this.remove(this._threeGeometry);
            }

            this._threeGeometry = await this._createObject(this._style);
            // console.log(this._threeGeometry,'water-----------------');

            this._updateGeometry();

            // 强制触发场景图更新
            // this.dispatchEvent({ type: 'geometry-updated' });
        }



    }


    // 根据样式类型创建对应对象
    async _createObject(style: Style): Promise<Object3D> {
        switch (style.config.type) {
            case 'basic-polygon':
                return _createBasePolygon(style.config, this._vertexPoints);
            case 'extrude-polygon':
                // alert('extrude-polygon')
                return _createExtrudedPolygon(style.config, this._vertexPoints);
            case 'water':
                // alert('extrude-polygon')
                return _createWaterSurface(style.config, this.getMap() as Map, this._vertexPoints);
            case 'base-water':
                // alert('extrude-polygon')
                return _createBaseWaterSurface(style.config, this._vertexPoints);
            default:
                throw new Error(`Unsupported style type: ${style.config.type}`);
        }
    }



    // _createObject() {

    // }

}
Polygon.mergeOptions(options);

