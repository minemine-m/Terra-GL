import { Vector3, DirectionalLightHelper, Object3D } from "three";
import { Viewer, ViewerOptions } from "../viewer";
import { TileMapParams, TileMap } from "../meshmap";
import { Coordinate } from "../types";
import { requireParam, requireProp } from "../utils/validate";
import { BaseMixin, EventMixin } from "../core/mixins";
import { Layer } from "../layer/Layer";
import { isNil } from "../utils";
import { LayerContainer } from "../layer/LayerContainer";
import { _createModel } from '../utils/createobject';
// import { DirectionalLightHelper } from "three";

// map的总配置（用嵌套对象区分模块）
type MapOptions = {
    viewer?: ViewerOptions;
    meshmap: TileMapParams;
    center: Coordinate;  // center 是必填项
};



// 创建一个空基类（仅用于混入起点）
class EmptyClass { }
// export class Map extends EventMixin(
//     BaseMixin<typeof EmptyClass, any>(EmptyClass)
// ) {
export class Map extends EventMixin(
    BaseMixin<typeof EmptyClass, any>(EmptyClass)
) {

    viewer: Viewer;
    tilemap: TileMap;
    public readonly center: Coordinate;
    public options: Required<MapOptions>;
    private _layerContainer: LayerContainer;
    constructor(
        container: HTMLElement | string,
        options: MapOptions  // 移除了可选标记，强制要求必须传参数
    ) {
        super();
        requireParam(container, "container", "Map container element must be specified");
        const configPaths = ['center', 'meshmap'];
        for (const path of configPaths) {
            requireProp<string>(options, path)
        }
        // 默认配置（仅对可选属性 viewer 生效）
        const defaultOptions: Pick<Required<MapOptions>, "viewer"> = {
            viewer: {
                antialias: true,
                stencil: true,
                logarithmicDepthBuffer: true,
            }
        };

        // 合并配置
        this.options = {
            ...options,
            viewer: { ...defaultOptions.viewer, ...options.viewer },

        };

        this.center = this.options.center;
        this.viewer = new Viewer(container, this.options.viewer);
        this.tilemap = this.initTileMap(this.options.meshmap);
        // 默认开启阴影
        // 开启阴影
        this.tilemap.receiveShadow = true;
        // 地图添加到场景
        this.viewer.scene.add(this.tilemap);

        this.tilemap = this.initTileMap(this.options.meshmap);

        // this.viewer.scene.add(this.tilemap);
        // this.viewer.scene.add(this.tilemap);
        // this.viewer.scene.add(this.tilemap);
        // this.tilemap.castShadow = true;

        // console.log(this.tilemap, ' this.tilemap - ---------------- ')
        // this.viewer.renderer.shadowMap.enabled = true;
        // this.viewer.renderer.shadowMap.type = PCFSoftShadowMap;


        // 直接定位到中心点
        // 地图中心经纬度高度（m）转为世界坐标


        const centerPostion = this.tilemap.geo2world(new Vector3(this.center[0], this.center[1], 0));
        // 摄像机经纬度高度（m）转为世界坐标
        const cameraPosition = this.tilemap.geo2world(new Vector3(this.center[0], this.center[1] - 0.01, this.center[2] || 1000));

        // 调整摄像机位置
        this.viewer.camera.position.copy(cameraPosition);
        // 调整地图中心位置
        this.viewer.controls.target.copy(centerPostion);

        // 初始化图层容器
        this._layerContainer = new LayerContainer();
        this.viewer.scene.add(this._layerContainer);




        console.log(this.viewer, 'this.viewer ----------------------')

        // 默认开启阴影 - 平行光设置
        // this.dirLight.
        const x = 0.5;  // 右前方向
        const y = 1;     // 上方（必须正值！）
        const z = 0.5;   // 前方向
        const size = 2000;
        const mapSize = 5;
        const near = 1;
        const far = size * 3.5;
        const radius = 1;
        const bias = -0.0001 * 0;
        this.viewer.dirLight.position.set(centerPostion.x + size * x, size * y, centerPostion.z + size * z);
        this.viewer.dirLight.target.position.copy(centerPostion);
        // 阴影配置
        this.viewer.dirLight.castShadow = true;
        this.viewer.dirLight.shadow.mapSize.width = 1024 * mapSize;
        this.viewer.dirLight.shadow.mapSize.height = 1024 * mapSize;
        this.viewer.dirLight.shadow.camera.near = near;
        this.viewer.dirLight.shadow.camera.far = far;
        this.viewer.dirLight.shadow.camera.left = -size;
        this.viewer.dirLight.shadow.camera.bottom = -size;
        this.viewer.dirLight.shadow.camera.top = size;
        this.viewer.dirLight.shadow.camera.right = size;
        this.viewer.dirLight.shadow.radius = radius;
        this.viewer.dirLight.shadow.bias = bias;
        this.viewer.dirLight.name = '平行光';
        this.viewer.dirLight.intensity = 3;

        console.log(this.viewer.dirLight, 'this.viewer.dirLight ----------------------')

        // 添加 DirectionalLightHelper（参数：光源对象，辅助线长度）
        const lightHelper = new DirectionalLightHelper(this.viewer.dirLight, 5);
        this.viewer.scene.add(lightHelper);
    }


    /**
     * 初始化tilemap 地图
     * @param options 地图配置项
     * @returns tilemap地图对象
     * */
    private initTileMap(options: TileMapParams) {
        // 创建地图对象
        const tilemap = new TileMap({
            ...options
        });

        // map.scale.setScalar(1000);

        // 地图旋转到xz平面
        tilemap.rotateX(-Math.PI / 2);
        // 开启阴影
        tilemap.receiveShadow = true;

        // 地图准备就绪
        tilemap.addEventListener("ready", () => {
            this.trigger("loaded", {
                timestamp: Date.now(),
                map: this
            });
        });
        return tilemap;
    }

    /**
     * 添加图层
     * @param layers 图层对象或图层对象数组
     * @param otherLayers 其他图层对象
     * @returns 当前地图对象
     */
    addLayer(layers: Layer | Array<Layer>, ...otherLayers: Array<Layer>): this {
        if (!layers) {
            return this; // 如果 layers 不存在，直接返回 this
        }
        if (!Array.isArray(layers)) {
            layers = [layers]; // 如果不是数组，转为数组
        }
        if (otherLayers?.length) { // 可选链 + 检查长度
            layers = layers.concat(otherLayers);
        }
        const mapLayers = this._layerContainer;
        for (let i = 0, len = layers.length; i < len; i++) {
            const layer = layers[i];
            const id = layer.getId();
            if (isNil(id)) {
                throw new Error('Invalid id for the layer: ' + id);
            }
            layer._bindMap(this);
            console.log(mapLayers, 'mapLayers - ---------------- ')
            mapLayers.add(layer);
        }
        return this; // 确保所有路径都返回 this
    }
    /**
     * 移除图层
     * @param layers 要移除的图层对象或图层对象数组
     * @returns 当前地图对象
     */
    clearLayers() {
        this._layerContainer.clear(); // 调用 LayerContainer 的 clear 方法
        return this._layerContainer; // 确保所有路径都返回 this
    }
    /**
     * 根据 ID 获取图层
     * @param id 图层 ID
     * @returns 找到的图层对象，如果未找到则返回 undefined
     */
    getLayers() {
        return this._layerContainer.getLayers(); // 调用 LayerContainer 的 getLayers 方法
    }
    /**
     * 根据 ID 获取图层
     * @param id 图层 ID
     * @returns 找到的图层对象，如果未找到则返回 undefined
     */
    getLayerById(id: string) {
        return this._layerContainer.getLayerById(id); // 调用 LayerContainer 的 getLayerById 方法
    }
    geo2world(coords: Vector3) {
        return this.tilemap.geo2world(coords);
    }
    world2geo(coords: Vector3) {
        return this.tilemap.world2geo(coords);
    }

}