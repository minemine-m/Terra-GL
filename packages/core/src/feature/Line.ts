
import { Vector2, Vector3 } from 'three';
import { Feature, FeatureOptions } from './Feature';
import { LineString as GeoJSONLineString, MultiLineString as GeoJSONMultiLineString } from 'geojson';
import { Line2,LineMaterial,LineGeometry } from 'three-stdlib';
import { Coordinate } from '../types';
export type LineOptions = FeatureOptions & {
    geometry?: GeoJSONLineString | GeoJSONMultiLineString;
}
// const options: PointOptions = {
/ /     // 'defaultProjection': 'EPSG:3857' // BAIDU, IDENTITY
// };


export abstract class Line extends Feature {
    readonly _baseType = "Line";
    abstract _type: string;
    _vertexPoints: number[];
    constructor(options: LineOptions) {
        //  // 创建几何体
        // const geometry = new THREE.BufferGeometry();
        super(options);
        this._threeGeometry = this._createThreeGeometry();
        // 线的顶点坐标
        this._vertexPoints = [0, 0, 0];
        // this.add(this._threeGeometry); // 将几何体添加到对象中
        if (this._style) {
            this._style.applyTo(this._threeGeometry);
        }
    }
    _coordsTransform():any {
        const map = this.getMap(); // 获取地图对象
        const geometry = this._geometry;

        // 处理线类型 (LineString)
        if (this._geometry.type === 'LineString') {
            const coordinates = geometry.coordinates as Coordinate[];
            let _position = coordinates.map(coord => {
                const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                return map ? map.geo2world(vec) : vec;
            });

            let _vertexPoints = (_position as Vector3[]).flatMap(v => [v.x, v.y, v.z]);
            return {
                _position,
                _vertexPoints
            }
        }

    }
    _toThreeJSGeometry() {


    }
    // _createObject(style: Style) {

    // }

    // 创建 Line2 对象
    protected _createThreeGeometry() {
        // 1. 创建空的 LineGeometry（顶点后续设置）
        const geometry = new LineGeometry();

        // 2. 配置线条材质
        const material = new LineMaterial({
            color: 0x888888,  // 线条颜色
            linewidth: 0.1,   // 线条宽度（注意单位可能受分辨率影响）
            dashed: false,    // 是否虚线
            resolution: new Vector2(window.innerWidth, window.innerHeight) // 抗锯齿依赖分辨率
        });

        // 3. 返回 Line2 对象
        return new Line2(geometry, material);
    }
}
// Point.mergeOptions(options);

