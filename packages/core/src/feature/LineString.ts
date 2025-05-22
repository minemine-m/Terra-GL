
import { Object3D } from 'three';
import { LineOptions, Line } from './Line';
import { _createBasicLine } from '../utils/createobject';
import { Line2 } from 'three/addons/lines/Line2.js';
import { Style } from '../style';

export type LineStringOptions = LineOptions & {
    // type?: 'circle' | 'icon';
}
const options: LineStringOptions = {
    // type: 'circle', // 默认为 Point geometr
};

export class LineString extends Line {
    _type: string = 'LineString';
    constructor(options: LineStringOptions) {
        super(options);
        // this._type = options.type || 'circle'; // 设置类型
    }
    async _toThreeJSGeometry(): Promise<void> {
        let { _vertexPoints } = this._coordsTransform(); // 进行坐标转换
        this._vertexPoints = _vertexPoints;
        // console.log(this._vertexPoints,'this._vertexPoints')
        if (this._style) {
            // 创建新几何体前先清除旧引用
            if (this._threeGeometry) {
                // this.remove(this._threeGeometry);
                this._disposeGeometry(); // 清除旧的几何体
            }

            this._threeGeometry = await this._createObject(this._style);
            this._updateGeometry();

            // 强制触发场景图更新
            // this.dispatchEvent({ type: 'geometry-updated' });
        }



    }
    // 根据样式类型创建对应对象
    async _createObject(style: Style): Promise<Object3D> {
        switch (style.config.type) {
            case 'basic-line':
                return _createBasicLine(style.config, this._vertexPoints);
            default:
                throw new Error(`Unsupported style type: ${style.config.type}`);
        }
    }
    _updateGeometry() {
        this._disposeGeometry(); // 清除旧的几何体
        if (this._threeGeometry) {
            const line2 = this._threeGeometry as Line2; // 强制类型断言
            const geometry = line2.geometry; // 获取底层 BufferGeometry
            // 2. 更新几何体坐标
            geometry.setPositions(this._vertexPoints);

            // 3. 重新计算边界盒和包围球
            geometry.computeBoundingSphere();
            geometry.computeBoundingBox();
   

            this.add(this._threeGeometry);
            this.updateMatrixWorld(true);
            this._tryProcessQueue(); // 几何体更新后强制检查队列
            // console.log('LineString geometry updated'); // 调试用，确保更新正确
        }
    }
    // _createObject() {

    // }

}
LineString.mergeOptions(options);

