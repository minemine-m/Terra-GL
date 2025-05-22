import {
	AmbientLight,
	BaseEvent,
	Clock,
	Color,
	DirectionalLight,
	EventDispatcher,
	FogExp2,
	MathUtils,
	Object3DEventMap,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer,
	CubeTextureLoader,
	PCFSoftShadowMap,
	SRGBColorSpace
} from "three";
import Stats from 'three/addons/libs/stats.module.js';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { Easing, Tween, update as teweenUpdate } from "three/examples/jsm/libs/tween.module.js";

/**
 * Viewer event map
 */
export interface ViewerEventMap extends Object3DEventMap {
	update: BaseEvent & { delta: number };
}

/**
 * Viewer options
 */
export type ViewerOptions = {
	/** Whether to use antialiasing. Default is false. */
	antialias?: boolean;
	/** Whether to use stencil buffer. Default is true. */
	stencil?: boolean;
	/** Whether to use logarithmic depth buffer. Default is true. */
	logarithmicDepthBuffer?: boolean;
	/** Skybox configuration */
	skybox?: {
		/** ​ Path to skybox images */
		path?: string;
		/**
		 * Skybox image file names in order: [px, nx, py, ny, pz, nz]
		 */
		files?: string[];
		/** Default skybox color (used if skybox loading fails)  */
		defaultColor?: number;
	};
};

/**
 * Threejs scene initialize class
 */
export class Viewer extends EventDispatcher<ViewerEventMap> {
	public readonly scene: Scene;
	public readonly renderer: WebGLRenderer;
	public readonly camera: PerspectiveCamera;
	public readonly controls: MapControls;
	public readonly ambLight: AmbientLight;
	public readonly dirLight: DirectionalLight;
	public container?: HTMLElement;
	private readonly _clock: Clock = new Clock();
	private stats: Stats;

	private _fogFactor = 1.0;

	/** Get fog factor */
	public get fogFactor() {
		return this._fogFactor;
	}

	/** Set fog factor, default 1 */
	public set fogFactor(value) {
		this._fogFactor = value;
		this.controls.dispatchEvent({ type: "change" });
	}

	/** Container width */
	public get width() {
		return this.container?.clientWidth || 0;
	}

	/** Container height */
	public get height() {
		return this.container?.clientHeight || 0;
	}

	/**
	 * Constructor
	 * @param container container element or selector string
	 * @param options GLViewer options
	 */
	constructor(container?: HTMLElement | string, options: ViewerOptions = {}) {
		super();

		const { antialias = false, stencil = true, logarithmicDepthBuffer = true, skybox } = options;
		this.renderer = this._createRenderer(antialias, stencil, logarithmicDepthBuffer);
		this.scene = this._createScene(skybox);
		this.camera = this._createCamera();
		if (container) {
			this.addTo(container);
		}
		this.controls = this._createControls();
		this.ambLight = this._createAmbLight();
		this.scene.add(this.ambLight);
		this.dirLight = this._createDirLight();
		this.scene.add(this.dirLight);
		this.scene.add(this.dirLight.target);

		this.renderer.setAnimationLoop(this.animate.bind(this));

		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);
	}

	/**
	 * Add the renderer to a container
	 * @param container container element or selector string
	 * @returns this
	 */
	public addTo(container: HTMLElement | string) {
		const el = typeof container === "string" ? document.querySelector(container) : container;
		if (el instanceof HTMLElement) {
			this.container = el;
			el.appendChild(this.renderer.domElement);
			new ResizeObserver(this.resize.bind(this)).observe(el);
		} else {
			throw `${container} not found!}`;
		}
		return this;
	}

	/**
	 * Create scene
	 * @param skyboxConfig Skybox configuration
	 * @returns scene
	 */
	private _createScene(skyboxConfig?: ViewerOptions['skybox']) {
		const scene = new Scene();
		const backColor = skyboxConfig?.defaultColor || 0xdbf0ff;
		scene.background = new Color(backColor);
		scene.fog = new FogExp2(backColor, 0);
		// Load skybox if configured
		if (skyboxConfig?.files) {
			const loader = new CubeTextureLoader();
			if (skyboxConfig.path) {
				loader.setPath(skyboxConfig.path);
			}

			loader.load(
				skyboxConfig.files,
				(texture) => {
					scene.background = texture;
				},
				undefined,
				(error) => {
					console.error('Error loading skybox:', error);
					// Fall back to default color
					scene.background = new Color(backColor);
				}
			);
		}
		return scene;
	}

	/**
	 * Create WebGL renderer
	 * @param antialias
	 * @param stencil
	 * @param logarithmicDepthBuffer
	 * @returns renderer
	 */
	private _createRenderer(antialias: boolean, stencil: boolean, logarithmicDepthBuffer: boolean) {
		const renderer = new WebGLRenderer({
			antialias,
			logarithmicDepthBuffer,
			stencil,
			alpha: true,
			precision: "highp",
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: true, // 强制检测硬件能力
		});

		// renderer.debug.checkShaderErrors = true;
		// renderer.toneMapping = 3;
		// renderer.toneMappingExposure = 1;
		// renderer.sortObjects = false;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.domElement.tabIndex = 0;

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap; // 更好的阴影质量

		// renderer.toneMapping = ACESFilmicToneMapping; // 使用更生动的色调映射
		// renderer.toneMappingExposure = 1.2; // 增加曝光度
		renderer.outputColorSpace = SRGBColorSpace;
		if (renderer.capabilities.isWebGL2) {
			const gl = renderer.getContext();
			gl.getExtension('EXT_color_buffer_float');
			gl.getExtension('OES_texture_float_linear');
		}
		return renderer;


	}

	/**
	 * Create camera
	 * @returns camera
	 */
	private _createCamera() {
		const camera = new PerspectiveCamera(70, 1, 100, 5e4);

		// const camera = new PerspectiveCamera(
		// 	70,
		// 	window.innerWidth / window.innerHeight, // 建议用实际宽高比
		// 	0.1,      // near 尽量小（但不能为0）
		// 	1e6    // far 覆盖场景范围（如1千万）
		// );
		camera.position.set(0, 3e4 * 1000, 0);

		// 在镜头变化时实时计算
		// camera.addEventListener('change', () => {
		// 	const distance = camera.position.distanceTo(target);
		// 	camera.near = Math.max(0.001, distance * 0.001); // 动态近裁面
		// 	camera.far = 1e8;
		// 	camera.updateProjectionMatrix();
		// });
		return camera;
	}

	/**
	 * Create map controls
	 * @returns MapControls
	 */
	private _createControls() {
		const controls = new MapControls(this.camera, this.renderer.domElement);
		const MAX_POLAR_ANGLE = 1.4;

		controls.target.set(0, 0, -3e3);
		controls.screenSpacePanning = false;
		controls.minDistance = 0.1e3 / 2;
		controls.maxDistance = 3e7;
		controls.maxPolarAngle = MAX_POLAR_ANGLE;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.keyPanSpeed = 5;

		controls.listenToKeyEvents(this.renderer.domElement);

		// Adjust zinear/far and azimuth/polar when controls changed
		controls.addEventListener("change", () => {
			// Get the current polar angle and distance
			const polar = Math.max(controls.getPolarAngle(), 0.1);
			const dist = Math.max(controls.getDistance(), 100);

			// Set ther zoom speed based on distance
			controls.zoomSpeed = Math.max(Math.log(dist / 1e3), 0) + 0.5;

			// Set the camera near/far based on distance and polayr angle
			this.camera.far = MathUtils.clamp((dist / polar) * 8, 100, 50000 * 1000);
			this.camera.near = this.camera.far / 1e4;

			// 动态调整 near 和 far，确保精度足够
			// this.camera.far = MathUtils.clamp((dist / polar) * 8, 100, 5000);
			// this.camera.near = Math.max(this.camera.far / 10000, 0.1); // 防止 near 过小

			this.camera.updateProjectionMatrix();







			// console.log(`Near: ${this.camera.near}, Far: ${this.camera.far}`);
			// const gl = this.renderer.getContext();
			// console.log('Depth bits:', gl.getParameter(gl.DEPTH_BITS));
			// 应该输出: Near: 0.1, Far: 100000000

			// Set fog based on distance and polar angle
			if (this.scene.fog instanceof FogExp2) {
				this.scene.fog.density = (polar / (dist + 5)) * this.fogFactor * 0.25;
			}

			// Set the azimuth/polar angles based on distance
			const DIST_THRESHOLD = 8e6;
			const isDistAboveThreshold = dist > DIST_THRESHOLD;
			controls.minAzimuthAngle = isDistAboveThreshold ? 0 : -Infinity;
			controls.maxAzimuthAngle = isDistAboveThreshold ? 0 : Infinity;

			// Set the polar angle based on distance
			const POLAR_BASE = 1e7;
			const POLAR_EXPONENT = 4;
			controls.maxPolarAngle = Math.min(Math.pow(POLAR_BASE / dist, POLAR_EXPONENT), MAX_POLAR_ANGLE);
		});
		return controls;
	}

	/**
	 * Create ambient light
	 * @returns AmbientLight
	 */
	private _createAmbLight() {
		const ambLight = new AmbientLight(0xffffff, 0);
		return ambLight;
	}

	/**
	 * Create directional light
	 * @returns DirectionalLight
	 */
	private _createDirLight() {
		const dirLight = new DirectionalLight(0xffffff, 0);
		dirLight.position.set(0, 2e3, 1e3);
		dirLight.castShadow = true;
		// 配置阴影相机
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.near = 100;
		dirLight.shadow.camera.far = 1e6;
		dirLight.shadow.camera.left = -10000;
		dirLight.shadow.camera.right = 10000;
		dirLight.shadow.camera.top = 10000;
		dirLight.shadow.camera.bottom = -10000;
		return dirLight;
	}

	/**
	 * Container resize
	 * @returns this
	 */
	public resize() {
		const width = this.width;
		const height = this.height;
		this.renderer.setSize(width, height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		// 防止resize过程中黑屏
		this.renderer.render(this.scene, this.camera);
		return this;
	}

	/**
	 * Threejs animation loop
	 */
	private animate() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		teweenUpdate();
		this.stats.update();
		this.dispatchEvent({ type: "update", delta: this._clock.getDelta() });
	}

	/**
	 * Fly to a position
	 * @param centerPostion Map center target position (world coordinate)
	 * @param cameraPostion Camera target position (world coordinate)
	 * @param animate animate or not
	 */
	public flyTo(centerPostion: Vector3, cameraPostion: Vector3, animate = true, onComplete?: (obj: Vector3) => void) {
		this.controls.target.copy(centerPostion);
		if (animate) {
			const start = this.camera.position;
			new Tween(start)
				// fly to 10000km
				.to({ y: 2e7, z: 0 }, 500)
				// to taget
				.chain(
					new Tween(start)
						.to(cameraPostion, 2000)
						.easing(Easing.Quintic.Out)
						.onComplete(obj => onComplete && onComplete(obj))
				)

				.start();
		} else {
			this.camera.position.copy(cameraPostion);
		}
	}

	/**
	 * Get current scens state
	 * @returns center position and camera position
	 */
	public getState() {
		return {
			centerPosition: this.controls.target,
			cameraPosition: this.camera.position,
		};
	}
}
