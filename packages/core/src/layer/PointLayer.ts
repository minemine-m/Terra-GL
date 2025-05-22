import { OverlayLayerOptions, OverlayLayer } from './OverlayLayer';
import { Point } from '../feature/Point';

export type PointLayerOptions = OverlayLayerOptions<Point> & {
    // 可以添加 PointLayer 特有的配置项，例如：
    // pointStyle?: {
    //     color?: string;
    //     size?: number;
    // };
};;
export class PointLayer extends OverlayLayer<Point> {
    constructor(id: string, options?: PointLayerOptions) {
        super(id, options);
    }
    protected validateFeature(feature: Point): boolean {
        // 子类自定义校验逻辑（同时享受泛型类型提示）
        return feature._baseType === 'Point'; //
    }
}