
import { Vector3 } from 'three';
import { Feature, FeatureOptions } from './Feature';
import { LineString as GeoJSONLineString, MultiLineString as GeoJSONMultiLineString } from 'geojson';
import { Coordinate } from '../types';
export type PathOptions = FeatureOptions & {
    geometry?: GeoJSONLineString | GeoJSONMultiLineString;
}
// const options: PointOptions = {
//     // 'defaultProjection': 'EPSG:3857' // BAIDU, IDENTITY
// };


export abstract class Path extends Feature {
    constructor(options: PathOptions) {
        super(options);
    }

    _coordsTransform() {
        const map = this.getMap(); // 获取地图对象
        const geometry = this._geometry;

        // 处理线类型 (LineString)
        if (geometry.type === 'LineString') {
            const coordinates = geometry.coordinates as Coordinate[];
            return coordinates.map(coord => {
                const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                return map ? map.geo2world(vec) : vec;
            });
        }

        // 处理多线类型 (MultiLineString) 或面类型 (Polygon)
        if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') {
            const coordinates = geometry.coordinates as Coordinate[][];
            return coordinates.map(line =>
                line.map(coord => {
                    const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                    return map ? map.geo2world(vec) : vec;
                })
            );
        }

        // 处理多多边形类型 (MultiPolygon)
        if (geometry.type === 'MultiPolygon') {
            const coordinates = geometry.coordinates as Coordinate[][][];
            return coordinates.map(polygon =>
                polygon.map(ring =>
                    ring.map(coord => {
                        const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                        return map ? map.geo2world(vec) : vec;
                    })
                )
            );
        }

        throw new Error(`Unsupported geometry type: ${geometry.type}`);
    }

    _toThreeJSGeometry() {
        // 实现将转换后的坐标转换为 Three.js 几何体的逻辑
    }
    _createObject() {
        
    }
}
// Point.mergeOptions(options);

