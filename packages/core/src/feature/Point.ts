
import { Vector3, BufferGeometry, Points, PointsMaterial } from 'three';
import { Feature, FeatureOptions } from './Feature';
import { Point as GeoJSONPoint, MultiPoint as GeoJSONMultiPoint } from 'geojson';
// import { Coordinate } from '../types';
export type PointOptions = FeatureOptions & {
    geometry?: GeoJSONPoint | GeoJSONMultiPoint;
}
// const options: PointOptions = {
//     // 'defaultProjection': 'EPSG:3857' // BAIDU, IDENTITY
// };


export abstract class Point extends Feature {
    readonly _baseType = "Point"; 
    abstract _type: string; 
    constructor(options: PointOptions) {
        //  // 创建几何体
        // const geometry = new THREE.BufferGeometry();
        super(options);
        this._threeGeometry = this._createThreeGeometry();
        // this.add(this._threeGeometry); // 将几何体添加到对象中
        if (this._style) {
          this._style.applyTo(this._threeGeometry);
        }
    }
    _coordsTransform(): Vector3 {
        const map = this.getMap(); // 获取地图对象
        // 提取所有点坐标
        const coordinates = new Vector3(this._geometry.coordinates[0] as number, this._geometry.coordinates[1] as number, this._geometry.coordinates[2] as number || 500); // 假设这是一个包含所有点坐标的数组;
        // 转换坐标
        if (map) {
            let worldcoord = map.geo2world(coordinates);
            return worldcoord;
        } else {
            return coordinates;
        }

    }
    _toThreeJSGeometry() {


    }
    // _createObject(style: Style) {
        
    // }

    protected _createThreeGeometry() {
        // 创建默认几何体（坐标后续设置）
        return new Points(
            new BufferGeometry(),
            new PointsMaterial({ size: 1, color: 0x888888 })
        );
    }
}
// Point.mergeOptions(options);

