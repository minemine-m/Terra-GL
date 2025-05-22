import { OverlayLayerOptions, OverlayLayer } from './OverlayLayer';
import { Line } from '../feature/Line';
export type LineLayerOptions = OverlayLayerOptions<Line> & {


};
export class LineLayer extends OverlayLayer<Line> {
    constructor(id: string, options?: LineLayerOptions) {
        super(id, options);
    }
    protected validateFeature(feature: Line): boolean {
        // 子类自定义校验逻辑（同时享受泛型类型提示）
        return feature._baseType === 'Line'; //
    }
    simplerender() {
            console.log(this.getFeatures(),'this.getFeatures()')
    }

}