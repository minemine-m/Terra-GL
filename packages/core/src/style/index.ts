import {
    Color, Object3D, Points, PointsMaterial,
    Sprite, SpriteMaterial, TextureLoader,
    Texture, Group, Material, Vector2,
    Vector3, LoadingManager, Matrix4
} from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { _createBasicPoint, _createIconPoint, _createBasicLine } from '../utils/createobject';
import { Feature } from '../feature/Feature';

// 1. 类型定义 ==============================================
// type StyleType = 'point' | 'line' | 'model' | 'custom';

interface BaseStyle {
    visible?: boolean;
    opacity?: number;
    zIndex?: number;
}

export interface BasicPointStyle extends BaseStyle {
    type: 'basic-point';
    color?: string | number | Color;
    size: number;
    glow?: boolean;

}

export interface IconPointStyle extends BaseStyle {
    type: 'icon-point';
    color?: string | number | Color;
    url: string;
    size: [number, number];
    rotation?: number;
    anchor?: [number, number];
    sizeAttenuation?: boolean;
}

// 定义基础多边形样式接口
export interface BasePolygonStyle extends BaseStyle {
    type: 'basic-polygon';
    color?: string | number | Color;
    opacity?: number;
    wireframe?: boolean;
    wireframeColor?: string | number | Color;
    side?: 'front' | 'back' | 'double'; // 渲染面
    vertexColors?: boolean; // 是否使用顶点颜色
    flatShading?: boolean; // 是否使用平面着色
}


// 定义基础多边形样式接口
export interface ExtrudeStyle extends BaseStyle {
    type: 'extrude-polygon';
    color?: number | string;
    opacity?: number;
    wireframe?: boolean;
    side?: 'front' | 'back' | 'double';
    extrude?: {
        height: number;      // 拉伸高度
        bevelEnabled?: boolean; // 是否启用斜角
    };
}


export interface LightWaterStyle extends BaseStyle {
    type: 'water'
    color?: number | string;          // 水面颜色
    opacity?: number;                 // 透明度
    sunDirection?: Vector3;           // 阳光方向
    sunColor?: number | string;       // 阳光颜色
    distortionScale?: number;         // 波纹强度
    size?: number;                    // 波纹大小
    normalMap: string;       // 自定义法线贴图
    fog?: boolean;                    // 是否受雾影响
}



export interface BaseWaterStyle extends BaseStyle {
    type: 'base-water'
    color?: number | string;          // 水面颜色
    opacity?: number;                 // 透明度
    sunDirection?: Vector3;           // 阳光方向
    sunColor?: number | string;       // 阳光颜色
    distortionScale?: number;         // 波纹强度
    size?: number;                    // 波纹大小
    normalMap: string;       // 自定义法线贴图
    fog?: boolean;                    // 是否受雾影响
}


export type WaterStyle = BaseWaterStyle | LightWaterStyle;





// 定义模型样式接口
export interface ModelStyle extends BaseStyle {
    url: string;
    type: 'gltf' | 'fbx';
    position?: Vector3;
    scale?: number | Vector3 | { x?: number; y?: number; z?: number };
    rotation?: Vector3;
    materialOverrides?: Record<string, Material>;
    manager?: LoadingManager;
    dracoOptions?: {
        enable: boolean;
        decoderPath?: string;
    };
    shadows?: {
        cast?: boolean;
        receive?: boolean;
        quality?: 'low' | 'medium' | 'high';
    };
}

export type PointStyle = BasicPointStyle | IconPointStyle;



export interface PipelineStyle extends BaseStyle {
    type: 'tube-line';
    color?: string | number | Color;
    radius: number;                 // 管道半径
    segments?: number;              // 圆柱分段数（默认8）
    caps?: boolean;                 // 是否包含端盖
    flowTexture?: string;           // 流动贴图URL（可选）
    pressure?: number;              // 压力值（用于爆管效果）
}
export interface BaseLineStyle extends BaseStyle {
    type: 'basic-line';
    color?: string | number | Color;
    width?: number;          // 线宽（世界单位）
    dashArray?: [number, number]; // 虚线模式 [划线长度, 间隙长度]
    opacity?: number;
    zIndex?: number;
    resolution?: Vector2; // 必须传入渲染器的分辨率
}


type CloudState = {
    ref: Group
    uuid: string
    index: number
    segments: number
    dist: number
    matrix: Matrix4
    bounds: Vector3
    position: Vector3
    volume: number
    length: number
    speed: number
    growth: number
    opacity: number
    fade: number
    density: number
    rotation: number
    rotationFactor: number
    color: Color
}


type CloudProps = {
    /** 使用种子随机数可以确保云朵形态一致，默认: Math.random()  */
    seed?: number
    /** 云朵的分段或粒子数量，默认: 20  */
    segments?: number
    /** 云朵的3D边界范围，默认: [5, 1, 1] */
    bounds?: Vector3
    /** 分段体积在边界内的分布方式，默认: inside (边缘的云朵较小) */
    concentrate?: 'random' | 'inside' | 'outside'
    /**​ 分段的基础缩放比例   */
    scale?: Vector3
    /** 分段体积/厚度，默认: 6  */
    volume?: number
    /** 分布云朵时的最小体积，默认: 0.25 */
    smallestVolume?: number
    /** 可选的自定义分布函数（会覆盖其他设置），默认: null
     *  point和volume都是比例值，point的x/y/z范围在-1到1之间，volume范围在0到1之间 */
    distribute?: ((cloud: CloudState, index: number) => { point: Vector3; volume?: number }) | null
    /** 动态云朵的生长系数（当speed > 0时生效），默认: 4 */
    growth?: number
    /** 动画速度系数，默认: 0 */
    speed?: number
    /** 相机距离达到该值时云朵会渐隐，默认: 10 */
    fade?: number
    /** 不透明度，默认: 1 */
    opacity?: number
    /** ​ 颜色，默认: 白色 */
    color?: Color,
    hexcolor?: string,
    boundstext?: { x: number ; y: number ; z: number  }
}


export type CloudStyle = BaseStyle & CloudProps & {
    type: 'cloud'
}





export interface CustomStyle extends BaseStyle {
    type: 'custom';
    build: () => Object3D | Promise<Object3D>;
}

export type StyleConfig = PointStyle | BaseLineStyle | PipelineStyle | ModelStyle | CustomStyle | BasePolygonStyle | ExtrudeStyle | WaterStyle | CloudStyle | BaseWaterStyle;
export type StyleInput = StyleConfig | Style;

// 2. 样式主类 ==============================================
export class Style {
    private static _textureCache = new Map<string, Texture>();
    // private static _modelCache = new Map<string, Group>();
    private static _textureLoader = new TextureLoader();
    // private static _modelLoader: GLTFLoader | null = null;

    constructor(public config: StyleConfig) { }

    // 4. 核心应用方法 ========================================
    async applyTo(object: Object3D): Promise<boolean> {
        if (!object) return false;

        try {
            object.visible = this.config.visible !== false;
            if (this.config.zIndex) object.renderOrder = this.config.zIndex;

            switch (this.config.type) {
                case 'basic-point':
                case 'icon-point':
                    return this._applyPointStyle(object);
                case 'basic-line':
                    return this._applyLineStyle(object as Line2);
                case 'gltf':
                case 'fbx':
                    return this._applyModelStyle(object);
                case 'basic-polygon':
                    return this._applyPolygonStyle(object);
                case 'extrude-polygon':
                    return this._applyExtrudeStyle(object);
                case 'water':
                case 'base-water':
                    return this._applyWaterStyle(object);
                case 'cloud':
                    return this._applyCloudStyle(object);
                case 'custom':
                    return this._applyCustomStyle(object);
                default:
                    // const _exhaustiveCheck: never = this.config;
                    throw new Error(`Unknown style type`);
            }
        } catch (error) {
            console.error(`Style apply failed:`, error);
            object.visible = false;
            return false;
        }
    }

    // 5. 点样式处理 ==========================================
    private async _applyPointStyle(object: Object3D): Promise<boolean> {
        const config = this.config as PointStyle;

        if (config.type === 'icon-point') {
            await this._applyIconPoint(object, config);
        } else {
            this._applyBasicPoint(object, config);
        }

        return true;
    }

    private async _applyIconPoint(object: Object3D, config: IconPointStyle) {
        let sprite: Sprite;

        if (object instanceof Sprite) {
            sprite = object;
        } else {
            sprite = await _createIconPoint(config, object.position)
            // 继承原对象的变换
            sprite.position.copy(object.position);
            sprite.rotation.copy(object.rotation);
            sprite.scale.copy(object.scale);
            sprite.renderOrder = 999; // 确保渲染在最上层

            // 替换原对象
            if (object.parent) {
                let parent = object.parent as Feature;
                parent._threeGeometry = sprite;
                parent._updateGeometry(); // 清除原对象

            }
        }

        // // 确保 size 有效
        const [width, height] = config.size;
        if (width <= 0 || height <= 0) {
            console.error("Invalid sprite size:", config.size);
            sprite.visible = false;
            return;
        }

        // 加载纹理
        const material = sprite.material as SpriteMaterial;
        try {
            material.map = await Style._loadTexture(config.url);
            if (!material.map) {
                throw new Error("Texture failed to load");
            }
            material.needsUpdate = true;
            sprite.scale.set(width, height, 1);
            if (config.rotation !== undefined) {
                sprite.rotation.z = config.rotation;
            }
        } catch (error) {
            console.error("Failed to load texture:", config.url, error);
            sprite.visible = false;
        }
    }

    private _applyBasicPoint(object: Object3D, config: BasicPointStyle) {
        let points: Points;
        if (object instanceof Points) {
            points = object;
        } else {
            points = _createBasicPoint(config, object.position)
            // 继承原对象的变换
            points.position.copy(object.position);
            points.rotation.copy(object.rotation);
            points.scale.copy(object.scale);
            points.renderOrder = 999; // 确保渲染在最上层
            // 替换原对象
            if (object.parent) {
                let parent = object.parent as Feature;
                parent._threeGeometry = points;
                parent._updateGeometry(); // 清除原对象

            }


        }

        const material = points.material as PointsMaterial;
        material.size = config.size;
        if (config.color) material.color.set(config.color);
        if (config.glow) material.sizeAttenuation = false;
    }

    private _applyLineStyle(object: Object3D) {
        const config = this.config as BaseLineStyle;
        // let line = _createBasicLine(config, object.position as Vector3[])
        // console.log('line------------', config, object);
        if (object.parent) {
            let parent = object.parent as Feature;
            parent._threeGeometry = _createBasicLine(config, parent._vertexPoints);
            parent._updateGeometry(); // 清除原对象
        }
        return true;
    }

    // @ts-ignore
    private _applyPolygonStyle(object: Object3D) {
        // @ts-ignore
        const config = this.config as BasePolygonStyle;
        
        return true
    }
  // @ts-ignore
    private _applyExtrudeStyle(object: Object3D) {
        // @ts-ignore
        const config = this.config as ExtrudeStyle;
        return true
    }
  // @ts-ignore
    private _applyWaterStyle(object: Object3D) {
        const config = this.config as WaterStyle;

        if (config.type === 'water') {
            // this._applyIconPoint(object, config);
        } else {
            // this._applyBasicPoint(object, config);
        }
        // console.log('applyModelStyle', object);
        // const config = this.config as WaterStyle;
        // console.log('applyModelStyle', config);
        return true
    }


  // @ts-ignore
    private _applyCloudStyle(object: Object3D) {
      // @ts-ignore
        const config = this.config as CloudStyle;
        return true
    }




      // @ts-ignore
    private async _applyModelStyle(object: Object3D) {
          // @ts-ignore
        const config = this.config as ModelStyle;
        return true


    }
    // private _applyMaterialOverrides(object: Object3D, overrides?: Record<string, Material>) {
    //     if (!overrides) return; // 明确的未定义检查

    //     object.traverse((child: Object3D) => {
    //         if (child instanceof Mesh && child.material) {
    //             const materialOverride = overrides[child.name];
    //             if (materialOverride) {
    //                 child.material = materialOverride;
    //             }
    //         }
    //     });
    // }


    private async _applyCustomStyle(object: Object3D): Promise<boolean> {
        const config = this.config as CustomStyle;
        const customObj = await config.build();

        if (object instanceof Group) {
            object.clear();
            object.add(customObj);
        }
        return true;
    }

    static async _loadTexture(url: string): Promise<Texture> {
        if (Style._textureCache.has(url)) {
            return Style._textureCache.get(url)!;
        }

        const texture = await new Promise<Texture>((resolve, reject) => {
            Style._textureLoader.load(url, resolve, undefined, reject);
        });
        texture.premultiplyAlpha = true; // 预乘 Alpha



        Style._textureCache.set(url, texture);
        texture.premultiplyAlpha = true; // 预乘 Alpha

        return texture;
    }

    static create(input: StyleInput): Style {
        return input instanceof Style ? input : new Style(input);
    }
}