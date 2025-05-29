import * as THREE from 'three';
import { GLTFLoader,DRACOLoader,FBXLoader,KTX2Loader,MeshoptDecoder } from 'three-stdlib';
interface LoadedModel {
    model: THREE.Group | THREE.Object3D;
    animations: THREE.AnimationClip[];
}

interface ModelLoaderOptions {
    useDraco?: boolean;
    useMeshopt?: boolean;
    useKTX2?: boolean;
    dracoDecoderPath?: string;
    ktx2TranscoderPath?: string;
}

export class ModelLoader {
    private fbxLoader: FBXLoader;
    private gltfLoader: GLTFLoader;
    private dracoLoader?: DRACOLoader;
    private ktx2Loader?: KTX2Loader;

    constructor(options: ModelLoaderOptions = {}) {
        // 初始化FBX加载器
        this.fbxLoader = new FBXLoader();

        // 初始化GLTF加载器
        this.gltfLoader = new GLTFLoader();

        // 配置DRACO压缩
        if (options.useDraco) {
            this.dracoLoader = new DRACOLoader();
            this.dracoLoader.setDecoderPath(options.dracoDecoderPath || 'https://www.gstatic.com/draco/v1/decoders/');
            this.gltfLoader.setDRACOLoader(this.dracoLoader);
        }

        // 配置Meshopt压缩
        if (options.useMeshopt) {
            this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
        }

        // 配置KTX2纹理压缩
        if (options.useKTX2) {
            this.ktx2Loader = new KTX2Loader();
            this.ktx2Loader.setTranscoderPath(options.ktx2TranscoderPath || 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/libs/basis/');
            this.gltfLoader.setKTX2Loader(this.ktx2Loader);
        }
    }


    async load(url: string, onProgress?: (event: ProgressEvent) => void): Promise<LoadedModel> {
        const extension = url.split('.').pop()?.toLowerCase();

        try {
            if (extension === 'fbx') {
                return await this.loadFBX(url, onProgress);
            } else if (extension === 'gltf' || extension === 'glb') {
                return await this.loadGLTF(url, onProgress);
            } else {
                throw new Error(`Unsupported model format: ${extension}`);
            }
        } catch (error) {
            console.error('Failed to load model:', error);
            throw error;
        }
    }


    private loadFBX(url: string, onProgress?: (event: ProgressEvent) => void): Promise<LoadedModel> {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                url,
                (object) => {
                    const animations = object.animations || [];
                    resolve({ model: object, animations });
                },
                onProgress,
                (error) => reject(error)
            );
        });
    }


    private loadGLTF(url: string, onProgress?: (event: ProgressEvent) => void): Promise<LoadedModel> {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    const animations = gltf.animations || [];
                    resolve({ model, animations });
                },
                onProgress,
                (error) => reject(error)
            );
        });
    }

    dispose(): void {
        if (this.dracoLoader) {
            this.dracoLoader.dispose();
        }
        if (this.ktx2Loader) {
            this.ktx2Loader.dispose();
        }
    }
}

