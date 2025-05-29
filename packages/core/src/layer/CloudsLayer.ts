// 暂时废弃此类


import { Texture,Vector3 } from 'three';
import { OverlayLayerOptions, OverlayLayer } from './OverlayLayer';
import { ICloud } from '../feature/ICloud';
import { Clouds } from "@pmndrs/vanilla";
import { Style } from '../style';
import { requireProp } from "../utils/validate";
// import { Map } from '../map';

export type ICloudLayerOptions = OverlayLayerOptions<ICloud> & {
    texture: string | Texture; // 可以添加 PointLayer 特有的配置项，例如：
    // 可以添加 PointLayer 特有的配置项，例如：
    // pointStyle?: {
    //     color?: string;
    //     size?: number;
    // };
};
export class CloudsLayer extends OverlayLayer<ICloud> {
    public _clouds: Clouds | null = null; // 存储 Clouds 实例的属性
    constructor(id: string, options: ICloudLayerOptions) {
        super(id, options);
        const configPaths = ['texture'];
        for (const path of configPaths) {
            requireProp<string>(options, path)
        }
        this._createClouds(options.texture);
    }

    private async _createClouds(teture: string | Texture) {
        const texture = await Style._loadTexture(teture as string);
        const clouds = new Clouds({
            texture,
        });

        clouds.castShadow = true;
        clouds.renderOrder = 99999;
        // clouds.scale.setScalar(100000);
        this._clouds = clouds;
        // console.log(this.map, 'this.map -------------')
        // let  centerPostion = this.map.viewer.camera.position.clone();

        // let centerPosition = this.map.geo2world(new Vector3(this.map.center[0], this.map.center[1], 0));
        // console.log(centerPosition, 'centerPosition');

        // this._clouds.position.set(0, 0, 0); // 可选：设置位置，根据需要调整
        // this._clouds.position.copy(centerPosition);
        // this.add(this._clouds);
    }

  
    protected validateFeature(feature: ICloud): boolean {
        // 子类自定义校验逻辑（同时享受泛型类型提示）
        return feature._type === 'Cloud'; //
    }

    // 直接实现 animate 方法，无需手动注册
    protected animate(delta: number,elapsedtime:number) {
   
      if (this._clouds) {
        // console.log('循环里的',this._clouds)
        this._clouds.update(this.map.viewer.camera, elapsedtime, delta);
      }
    }
}