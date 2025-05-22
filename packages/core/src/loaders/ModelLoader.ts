import { Group, Mesh, LoadingManager } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { ModelStyle } from '../style';



interface ModelCacheItem {
    model: Group;
    animations?: any[];
}

//模型加载器类 ==========================================
export class ModelLoader {
    private static _instance: ModelLoader;
    private _cache = new Map<string, ModelCacheItem>();
    private _gltfLoader: GLTFLoader;
    private _fbxLoader: FBXLoader;
    private _dracoLoader?: DRACOLoader;

    private constructor(manager?: LoadingManager) {
        this._gltfLoader = new GLTFLoader(manager);
        this._fbxLoader = new FBXLoader(manager);
    }

    static init(manager?: LoadingManager): ModelLoader {
        if (!this._instance) {
            this._instance = new ModelLoader(manager);
        }
        return this._instance;
    }

    async load(options: ModelStyle): Promise<any> {
        const cacheKey = `${options.type}:${options.url}`;

        // 检查缓存
        if (this._cache.has(cacheKey)) {
            return this._cloneCachedModel(cacheKey, options);
        }

        // 初始化Draco加载器（如果需要）
        if (options.type === 'gltf' && options.dracoOptions?.enable) {
            this._initDracoLoader(options.dracoOptions.decoderPath);
        }

        // 执行加载
        let model: Group;
        let animations: any[] | undefined;

        try {
            if (options.type === 'gltf') {
                const gltf = await this._gltfLoader.loadAsync(options.url);
                model = gltf.scene;
                animations = gltf.animations;
            } else {
                model = await this._fbxLoader.loadAsync(options.url);
                animations = (model as any).animations;
            }

            // 存入缓存
            this._cache.set(cacheKey, { model, animations });

            // 返回处理后的副本
            return {
                model: this._processModel(model.clone(), options),
                animations: animations?.map(anim => ({ ...anim, name: anim.name || 'unnamed' })) || []
            }
        } catch (error) {
            console.error(`Failed to load ${options.type} model:`, options.url, error);
            throw error;
        }
    }

    private _initDracoLoader(decoderPath = '/draco/'): void {
        if (!this._dracoLoader) {
            this._dracoLoader = new DRACOLoader();
            this._dracoLoader.setDecoderPath(decoderPath);
            this._gltfLoader.setDRACOLoader(this._dracoLoader);
        }
    }

    private _cloneCachedModel(cacheKey: string, options: ModelStyle): Group {
        const cached = this._cache.get(cacheKey)!;
        const clone = cached.model.clone();
        return this._processModel(clone, options);
    }

    private _processModel(model: Group, options: ModelStyle): Group {

        


        // 应用变换
        if (options.position) model.position.copy(options.position);

        if (options.scale) {
            if (typeof options.scale === 'number') {
                model.scale.setScalar(options.scale);
            } else if (options.scale.x !== undefined || options.scale.y !== undefined || options.scale.z !== undefined) {
                // Handle separate x, y, z scaling
                if (options.scale.x !== undefined) model.scale.x = options.scale.x;
                if (options.scale.y !== undefined) model.scale.y = options.scale.y;
                if (options.scale.z !== undefined) model.scale.z = options.scale.z;
            } else {
                // Fallback to copying the scale object if it's a Vector3-like object
                model.scale.copy(options.scale as { x: number; y: number; z: number });
            }
        }

        if (options.rotation) {
            model.rotation.set(
                options.rotation.x,
                options.rotation.y,
                options.rotation.z
            );
        }

        // 应用材质覆盖
        if (options.materialOverrides) {
            model.traverse(child => {
                if (child instanceof Mesh && child.material) {
                    const override = options.materialOverrides![child.name];
                    if (override) child.material = override;
                }
            });
        }


        // model.traverse(child => {
        //     if (child instanceof Mesh && child.material) {
        //         // 增加材质的颜色饱和度
        //         // if (child.material.color) {
        //         //     const hsl = child.material.color.getHSL({ h: 0, s: 0, l: 0 });
        //         //     child.material.color.setHSL(hsl.h, Math.min(hsl.s * 1.5, 1), hsl.l);
        //         // }

        //         // 调整其他材质属性
        //         child.material.emissiveIntensity = 0.2; // 增加自发光强度
        //         child.material.metalness = 0; // 减少金属感
        //         child.material.roughness = 0.7; // 增加粗糙度
        //     }
        // });

        // 添加颜色增强处理
        model.traverse(child => {
            if (child instanceof Mesh && child.material) {
                // 确保材质使用物理渲染
                // if (child.material instanceof MeshStandardMaterial ||
                //     child.material instanceof MeshPhysicalMaterial) {
                //     child.material.needsUpdate = true;

                //     // 增强颜色
                //     // if (child.material.color) {
                //     //     const color = new Color(child.material.color);
                //     //     const hsl = { h: 0, s: 0, l: 0 };
                //     //     color.getHSL(hsl);
                //     //     color.setHSL(hsl.h, Math.min(hsl.s * 1.3, 1), hsl.l * 0.95);
                //     //     child.material.color.copy(color);
                //     // }

                //     child.material.metalness = 0.1; // 减少金属感
                //     child.material.roughness = 0.7; // 增加粗糙度
                    
                // }
            }
        });


        // 处理建筑效果
        // model.traverse(child => {
        //     if (child instanceof Mesh && child.material) {
    
        //         child.material.color.setStyle('#040912')

        //     }
        // });

        // 阴影
        // if (options.shadows) {
        //     model.traverse((child: any) => {
        //         if (child.isMesh && child.material) {

        //             if (options.shadows) {
        //                 child.castShadow = options.shadows.cast ?? true;
        //                 child.receiveShadow = options.shadows.receive ??  true;
        //                 child.material.shadowSide = DoubleSide;
        //             }
        //         }
        //     });
        // }

        return model;
    }

    // // 3. 与Style类的集成方法 ================================
    // static async loadForStyle(style: ModelStyle, target: Group): Promise<boolean> {
    //     const loader = ModelLoader.init();

    //     try {
    //         const model = await loader.load({
    //             url: style.url,
    //             type: style.url.toLowerCase().endsWith('.fbx') ? 'fbx' : 'gltf',
    //             materialOverrides: style.materialOverrides,
    //             scale: style.scale
    //         });

    //         target.clear();
    //         target.add(model);
    //         return true;
    //     } catch (error) {
    //         console.error('Model load failed for style:', style, error);
    //         target.visible = false;
    //         return false;
    //     }
    // }
}

