import { OverlayLayerOptions, OverlayLayer } from './OverlayLayer';
import { Polygon } from '../feature/Polygon';

export type PolygonLayerOptions = OverlayLayerOptions<Polygon> & {
    // 可以添加 PointLayer 特有的配置项，例如：
    // pointStyle?: {
    //     color?: string;
    //     size?: number;
    // };
};;
export class PolygonLayer extends OverlayLayer<Polygon> {
    constructor(id: string, options?: PolygonLayerOptions) {
        super(id, options);
    }
    protected validateFeature(feature: Polygon): boolean {
        // 子类自定义校验逻辑（同时享受泛型类型提示）
        return feature._baseType === 'Surface'; //
    }
}