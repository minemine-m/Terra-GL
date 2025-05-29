import {  Group } from 'three';
import { LineOptions, Line } from './Line';
import { _createBasicLine } from '../utils/createobject';
import { Line2 } from 'three-stdlib';
import { Style } from '../style';
import { MultiLineString as GeoJSONMultiLineString } from 'geojson';
import { Vector3 } from 'three';

export type MultiLineStringOptions = LineOptions & {
    // 可以添加多线特有的选项
}

const options: MultiLineStringOptions = {
    // 默认选项
};

export class MultiLineString extends Line {
    _type: string = 'MultiLineString';
    private _lineObjects: Line2[] = []; // 存储所有线对象
    private _linesContainer: Group; // 用于包含所有线对象的容器

    constructor(options: MultiLineStringOptions) {
        super(options);
        this._linesContainer = new Group();
   
    }

    async _toThreeJSGeometry(): Promise<void> {
        const { _position } = this._coordsTransform(); // 进行坐标转换
        
        // console.log('MultiLineString _position:', _position);
        
        // 清除现有的线对象
        this.clearLines();
        this._disposeGeometry(); // 清除旧的几何体
        // this._disposeGeometry();
        
        if (this._style) {
            // 为每条线创建单独的几何体
            for (const linePositions of _position as Vector3[][]) {
                const vertexPoints = linePositions.flatMap(v => [v.x, v.y, v.z]);
                // console.log('多线的vertexPoints:', vertexPoints);
                const lineObject = await this._createLineObject(this._style, vertexPoints);
                this._lineObjects.push(lineObject);
                this._linesContainer.add(lineObject);
                this._threeGeometry = this._linesContainer; // 将容器作为主几何体
            }
            
            this.add(this._threeGeometry);
            // 更新容器
            this._updateContainer();
            
            // 强制触发场景图更新
            this.updateMatrixWorld(true);
            this._tryProcessQueue();
        }
    }

    // 创建单条线对象
    private async _createLineObject(style: Style, vertexPoints: number[]): Promise<Line2> {
        switch (style.config.type) {
            case 'basic-line':
                return _createBasicLine(style.config, vertexPoints);
            default:
                throw new Error(`Unsupported style type: ${style.config.type}`);
        }
    }

    // 坐标转换方法 - 覆盖父类方法
    _coordsTransform(): any {
        const map = this.getMap();
        const geometry = this._geometry as GeoJSONMultiLineString;

        if (this._geometry.type === 'MultiLineString') {
            const _position = geometry.coordinates.map(line => {
                return line.map(coord => {
                    const vec = new Vector3(coord[0], coord[1], coord[2] || 0);
                    return map ? map.geo2world(vec) : vec;
                });
            });

            return { _position };
        }
    }

    // 更新容器状态
    private _updateContainer() {
        // 计算整个多线图形的包围盒等
        this._linesContainer.updateMatrixWorld(true);
        
        // 如果有需要，可以在这里更新其他容器属性
    }

    // 清除所有线对象
    private clearLines() {
        this._lineObjects.forEach(line => {
            this._linesContainer.remove(line);
            // 可以在这里添加资源清理逻辑
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        });
        this._lineObjects = [];
    }

    // 覆盖父类的清除方法
    // clear() {
    //     super.clear();
    //     this.clearLines();
    //     this._linesContainer.clear();
    // }

    // 更新几何体
    _updateGeometry() {
        this._toThreeJSGeometry(); // 对于多线，直接重新创建所有线更简单
    }
    _disposeObject() {

    }
}

MultiLineString.mergeOptions(options);