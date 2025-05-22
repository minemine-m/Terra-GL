
import { Vector3, Object3D } from 'three';
import { PointOptions, Point } from './Point';
import { Style} from '../style';
import { _createBasicPoint, _createIconPoint } from '../utils/createobject';

export type MakerOptions = PointOptions & {

}
const options: MakerOptions = {

};

export class Maker extends Point {
    _type: string = 'Maker';
    constructor(options: MakerOptions) {
        super(options);
        // this._type = options.type || 'circle'; // 设置类型
    }
    async _toThreeJSGeometry(): Promise<void> {
        this._position = this._coordsTransform() as Vector3;
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
            case 'basic-point':
                return _createBasicPoint(style.config, new Vector3(0, 0, 0));
            case 'icon-point':
                return _createIconPoint(style.config, this._position as Vector3);
            default:
                throw new Error(`Unsupported style type: ${style.config.type}`);
        }
    }

}
Maker.mergeOptions(options);

