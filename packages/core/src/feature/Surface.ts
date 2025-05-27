
import { Vector2, Vector3, Mesh, BufferGeometry } from 'three';
import { Feature, FeatureOptions } from './Feature';
import { Polygon as GeoJSONPolygon, MultiPolygon as GeoJSONMultiPolygon } from 'geojson';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Coordinate } from '../types';
// import { ExtrudeStyle } from '../style';
export type SurfaceOptions = FeatureOptions & {
    geometry?: GeoJSONPolygon | GeoJSONMultiPolygon;
}
// const options: PointOptions = {
/ /     // 'defaultProjection': 'EPSG:3857' // BAIDU, IDENTITY
// };


export abstract class Surface extends Feature {
    readonly _baseType = "Surface";
    abstract _type: string;
    _vertexPoints: number[];
    constructor(options: SurfaceOptions) {
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
    // 处理多面和单面的坐标转换
    _coordsTransform(): any {
        const map = this.getMap(); // 获取地图对象
        const geometry = this._geometry;
        if (!geometry) {
            throw new Error('Geometry is not defined');
        }

        // 处理面类型 (Polygon)
        if (this._geometry.type === 'Polygon') {
            const coordinates = geometry.coordinates as Coordinate[][];
            let _positions: Vector3[][] = [];
            let _vertexPoints: number[] = [];

            // 遍历每个环（外环和内环）
            coordinates.forEach(ring => {
                const ringPositions = ring.map(coord => {
                    const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                    return map ? map.geo2world(vec) : vec;
                });

                _positions.push(ringPositions);
                _vertexPoints.push(...ringPositions.flatMap(v => [v.x, v.y, v.z]));
            });

            return {
                _positions,
                _vertexPoints
            }
        } else if (this._geometry.type === 'MultiPolygon') {
            const coordinates = geometry.coordinates as Coordinate[][][];
            let _positions: Vector3[][][] = [];
            let _vertexPoints: number[] = [];

            // 遍历每个多边形
            coordinates.forEach(polygon => {
                const polygonPositions: Vector3[][] = [];

                // 遍历每个环
                polygon.forEach(ring => {
                    const ringPositions = ring.map(coord => {
                        const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                        return map ? map.geo2world(vec) : vec;
                    });

                    polygonPositions.push(ringPositions);
                    _vertexPoints.push(...ringPositions.flatMap(v => [v.x, v.y, v.z]));
                });

                _positions.push(polygonPositions);
            });

            return {
                _positions,
                _vertexPoints
            }
        } else {
            throw new Error(`Unsupported geometry type: ${geometry.type}`);
        }


    }
    _updateGeometry(): void {

        let styletype = this._style?.config.type;
        // console.log(styletype, 'this._style-------------------')
        this.clear();
        // this.add(this._threeGeometry)
        if (!this._threeGeometry || !this._vertexPoints?.length) {
            console.warn('Cannot update geometry: missing geometry or vertex data');
            return;
        }

        const mesh = this._threeGeometry as Mesh;
        const geometry = mesh.geometry as BufferGeometry;


        try {

            if (styletype === 'basic-polygon') {
                // 1. 直接更新现有顶点数据
                const positionAttr = geometry.getAttribute('position');

                // 检查顶点数量是否匹配
                if (positionAttr.count * 3 !== this._vertexPoints.length) {
                    throw new Error(`Vertex count mismatch: ${positionAttr.count} expected, got ${this._vertexPoints.length / 3}`);
                }

                // 2. 高效更新顶点位置
                positionAttr.array.set(this._vertexPoints);
                positionAttr.needsUpdate = true;
                this._threeGeometry.renderOrder = 999;
                // 3. 更新相关计算
                geometry.computeBoundingSphere();
                geometry.computeBoundingBox();

                this.add(this._threeGeometry);
                // 4. 标记需要更新
                mesh.updateMatrix();
                this.updateMatrixWorld(true);
            } else if (styletype === 'extrude-polygon') {
           
                
                this._threeGeometry.renderOrder = 999;
                this._threeGeometry.updateMatrix();
                this.add(this._threeGeometry);
            } else if (styletype?.includes('water')) {
                // this._threeGeometry.renderOrder = 999;
                this._threeGeometry.updateMatrix();
                this.add(this._threeGeometry);
            }


        } catch (error) {
            console.error('Failed to update polygon positions:', error);
            throw error;
        }
    }


    // _createObject(style: Style) {

    // }
    // 创建对象，目前创建的是Line2对象，后边处理成面，暂时先不做
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

