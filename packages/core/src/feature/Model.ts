import { Vector3, AnimationMixer, LoopOnce, LoopRepeat, Clock, Mesh, Color, Box3 } from "three";
import { PointOptions, Point } from "./Point";
import { Style } from "../style";
import { _createModel } from "../utils/createobject";
// import { renderCity } from "../utils/build";
import { MeshBuildGradientMaterial } from "../utils/build/material/MeshBuildGradientMaterial";

export type ModelOptions = PointOptions & {
	emissive?: boolean;
	emissiveIntensity?: number;
	emissiveColor?: string;
	castShadow?: boolean;
	receiveShadow?: boolean;
	iscity?: boolean;
};

const options: ModelOptions = {
	emissive: false,
	emissiveIntensity: 1.0,
	emissiveColor: "#ffffff",
};

// 定义动画参数类型
interface AnimationPlayParams {
	name: string | number; // 动画名称或索引
	loop?: boolean; // 是否循环 (默认true)
	speed?: number; // 播放速度 (默认1)
	fadeInDuration?: number; // 淡入时间(秒) (默认0)
	fadeOutDuration?: number; // 淡出时间(秒) (默认0)
	startAt?: number; // 从指定时间开始 (秒) (默认0)
	weight?: number; // 动画权重 (0-1) (默认1)
}

interface AnimationUpdateParams {
	deltaTime: number; // 时间增量 (秒)
}

interface AnimationSpeedParams {
	speed: number; // 播放速度
}

interface AnimationPauseParams {
	paused: boolean; // 是否暂停
}

export class Model extends Point {
	_type: string = "Model";
	private _emissive: boolean = false;
	private _emissiveIntensity: number = 1.0;
	private _emissiveColor: string = "#ffffff";
	private _mixer: AnimationMixer | null = null;
	private _currentAction: any = null;
	private _animations: any[] = [];
	private _clock: Clock = new Clock();
	private _autoUpdate: boolean = true;
	private _animationRequestId: number | null = null;
	private _iscity: boolean = false;

	constructor(options: ModelOptions) {
		super(options);
		// 初始化自发光属性
		this._emissive = options.emissive || false;
		this._emissiveIntensity = options.emissiveIntensity || 1.0;
		this._emissiveColor = options.emissiveColor || "#ffffff";

		// 直接使用父类的阴影属性，不再重写访问器
		this.castShadow = options.castShadow || false;
		this.receiveShadow = options.receiveShadow || false;
		this._iscity = options.iscity || false;
	}

	async _toThreeJSGeometry(): Promise<void> {
		this._position = this._coordsTransform() as Vector3;
		// console.log(this._position, 'this._position')
		if (this._style) {
			if (this._threeGeometry) {
				// this.remove(this._threeGeometry);
				this._disposeGeometry(); // 清除旧的几何体
			}

			this.modelunino = await this._createObject(this._style);
			this._threeGeometry = this.modelunino.model;

			// 初始化动画系统
			if (this.modelunino.animations && this.modelunino.animations.length > 0) {
				this._animations = this.modelunino.animations;
				this._mixer = new AnimationMixer(this._threeGeometry);
				this._startAnimationLoop();
				// 默认播放动画
				this.playAnimation({
					name: this._animations[0].name,
					loop: true,
					speed: 1.5,
					fadeInDuration: 0.5,
					fadeOutDuration: 0.3,
				});
			}
			this._updateGeometry();

			this.setShadows({
				cast: this.castShadow,
				receive: this.receiveShadow,
			});

			// 应用自发光属性
			this._applyEmissionProperties();

			// setTimeout(() => {
			//     // 处理city效果
			//     this.traverse((child) => {
			//         if (child instanceof Mesh && child.material) {
			//             // if (cityArray.includes(child.name)) {
			//             //     console.log(child,'child----------------------');
			//             //     // 建筑
			//             //     renderCity(child)
			//             //     // 添加包围线条效
			//             //     // this.surroundLine(child);
			//             // }
			//             // console.log(child, 'child')
			//             // renderCity(child)

			//             // child.material.color.setStyle('#040912');
			//             // // const effect = addSurroundEffect(child, {
			//             // //     color: '#00ff00',  // 绿色描边
			//             // //     opacity: 0.8,      // 更明显
			//             // //     speed: 0.3         // 慢速动画
			//             // // });
			//             // // console.log(effect, 'effect')
			//             // // this.add(effect.object);

			//             const geometry = new EdgesGeometry(child.geometry);

			//             // 获取物体的世界坐标 旋转等
			//             const worldPosition = new Vector3();
			//             child.getWorldPosition(worldPosition);

			//             // this.effectGroup.add();
			//             const material = new LineBasicMaterial({
			//                 color: '#5382EA',
			//                 linewidth: 1,
			//                 linecap: 'round', //ignored by WebGLRenderer
			//                 linejoin: 'round' //ignored by WebGLRenderer
			//             });

			//             const line = new LineSegments(geometry, material);

			//             line.name = 'surroundLine';

			//             line.scale.copy(child.scale);
			//             line.rotation.copy(child.rotation);
			//             line.position.copy(worldPosition);

			//             this.add(line);

			//         }
			//     });
			// }, 5000);
			if (this._iscity) this._rendercity();
			// this._rendercity()

			// console.log(this, "模型------------------------------------");
		}
	}

	async _createObject(style: Style): Promise<any> {
		switch (style.config.type) {
			case "fbx":
			case "gltf":
				return _createModel(style.config, this._position as Vector3);
			default:
				throw new Error(`不支持的样式类型: ${style.config.type}`);
		}
	}

	private _applyEmissionProperties(): void {
		if (this._threeGeometry) {
			this._threeGeometry.traverse(child => {
				if ("material" in child) {
					const material = (child as any).material;
					if (material) {
						material.emissiveIntensity = this._emissive ? this._emissiveIntensity : 0;
						if (material.emissive) {
							material.emissive.setStyle(this._emissiveColor);
						}
					}
				}
			});
		}
	}

	/* 自发光属性访问器 */
	get emissive(): boolean {
		return this._emissive;
	}

	set emissive(value: boolean) {
		this._emissive = value;
		this._applyEmissionProperties();
	}

	get emissiveIntensity(): number {
		return this._emissiveIntensity;
	}

	set emissiveIntensity(value: number) {
		this._emissiveIntensity = value;
		this._applyEmissionProperties();
	}

	get emissiveColor(): string {
		return this._emissiveColor;
	}

	set emissiveColor(value: string) {
		this._emissiveColor = value;
		this._applyEmissionProperties();
	}

	/* 便捷方法 */
	setEmission(enabled: boolean, intensity?: number, color?: string): void {
		this._emissive = enabled;
		if (intensity !== undefined) this._emissiveIntensity = intensity;
		if (color !== undefined) this._emissiveColor = color;
		this._applyEmissionProperties();
	}
	async setShadows(options: { cast: boolean; receive: boolean }) {
		this.castShadow = options.cast;
		this.receiveShadow = options.receive;
		if (this._threeGeometry) {
			this._threeGeometry.traverse((child: any) => {
				if (child.isMesh && child.material) {
					child.castShadow = options.cast;
					child.receiveShadow = options.receive;
					// child.material.shadowSide = DoubleSide;
				}
			});
		}
	}
	playAnimation(params: AnimationPlayParams): void {
		if (!this._mixer || this._animations.length === 0) {
			console.warn("模型没有可用的动画");
			return;
		}

		// 停止当前动画
		if (this._currentAction) {
			if (params.fadeOutDuration && params.fadeOutDuration > 0) {
				this._currentAction.fadeOut(params.fadeOutDuration);
			} else {
				this._currentAction.stop();
			}
		}

		// 获取动画剪辑
		const clip =
			typeof params.name === "number"
				? this._animations[params.name]
				: this._animations.find(anim => anim.name === params.name);

		if (!clip) {
			console.warn(`找不到动画: ${params.name}`);
			return;
		}

		// 创建并播放新动画
		this._currentAction = this._mixer.clipAction(clip);
		this._currentAction.setLoop(params.loop ? LoopRepeat : LoopOnce, params.loop ? Infinity : 1);
		this._currentAction.timeScale = params.speed || 1;
		this._currentAction.time = params.startAt || 0;
		this._currentAction.setEffectiveWeight(params.weight || 1);

		if (params.fadeInDuration && params.fadeInDuration > 0) {
			this._currentAction.fadeIn(params.fadeInDuration);
		}

		this._currentAction.play();

		// 启动动画循环（如果未启动）
		if (this._autoUpdate && this._animationRequestId === null) {
			this._startAnimationLoop();
		}
	}
	stopAnimation(params: { fadeDuration?: number } = {}): void {
		if (this._currentAction) {
			if (params.fadeDuration && params.fadeDuration > 0) {
				this._currentAction.fadeOut(params.fadeDuration);
				// 延迟真正停止
				setTimeout(() => {
					if (this._currentAction) {
						this._currentAction.stop();
						this._currentAction = null;
					}
				}, params.fadeDuration * 1000);
			} else {
				this._currentAction.stop();
				this._currentAction = null;
			}
		}
	}
	setAnimationPaused(params: AnimationPauseParams): void {
		if (this._currentAction) {
			this._currentAction.paused = params.paused;
		}
	}
	setAnimationSpeed(params: AnimationSpeedParams): void {
		if (this._currentAction) {
			this._currentAction.timeScale = params.speed;
		}
	}
	updateAnimation(params: AnimationUpdateParams): void {
		if (this._mixer) {
			this._mixer.update(params.deltaTime);
		}
	}
	getAnimationNames(): string[] {
		return this._animations.map(anim => anim.name);
	}
	getCurrentAnimationName(): string | null {
		return this._currentAction ? this._currentAction.getClip().name : null;
	}
	getAnimationDuration(params: { name: string | number }): number | null {
		let clip: any;
		if (typeof params.name === "number") {
			clip = this._animations[params.name];
		} else {
			clip = this._animations.find(anim => anim.name === params.name);
		}
		return clip ? clip.duration : null;
	}

	dispose(): void {
		this._stopAnimationLoop();
		if (this._mixer) {
			this._mixer.stopAllAction();
			this._mixer.uncacheRoot(this._threeGeometry);
		}
		super.dispose();
	}

	private _startAnimationLoop(): void {
		if (!this._autoUpdate || this._animationRequestId !== null) return;

		const update = () => {
			if (this._mixer) {
				const delta = this._clock.getDelta();
				this._mixer.update(delta);
			}
			this._animationRequestId = requestAnimationFrame(update);
		};

		this._clock.start();
		this._animationRequestId = requestAnimationFrame(update);
	}

	private _stopAnimationLoop(): void {
		if (this._animationRequestId !== null) {
			cancelAnimationFrame(this._animationRequestId);
			this._animationRequestId = null;
		}
		this._clock.stop();
	}

	setAutoUpdate(enabled: boolean): void {
		this._autoUpdate = enabled;
		if (enabled) {
			this._startAnimationLoop();
		} else {
			this._stopAnimationLoop();
		}
	}

	private _rendercity() {
		// const cityArray = ['CITY_UNTRIANGULATED'];
		this.traverse(child => {
			if (child instanceof Mesh && child.material) {
				// console.log(child.material, "child.materialchild.materialchild.material");
				child.castShadow = true;

				// const geometry = new EdgesGeometry(child.geometry);

				// // 获取物体的世界坐标 旋转等
				// const worldPosition = new Vector3();
				// child.getWorldPosition(worldPosition);

				// // this.effectGroup.add();
				// const material = new LineBasicMaterial({
				//     color: '#B9E0F4',
				//     linewidth: 1,
				//     transparent: true,  // 必须设置为true才能使透明度生效
				//     opacity: 0.1,      // 透明度值，范围0.0（完全透明）到1.0（完全不透明）
				//     linecap: 'round',  // 注意：WebGL渲染器会忽略这个属性
				//     linejoin: 'round',  // 注意：WebGL渲染器会忽略这个属性
				//     fog: false
				// });

				// const line = new LineSegments(geometry, material);

				// line.name = 'surroundLine';

				// line.scale.copy(child.scale);
				// line.rotation.copy(child.rotation);
				// line.position.copy(worldPosition);

				// this.add(line);

				child.castShadow = true;
				if (child.name === "building") {
					
					// let material = new MeshBuildGradientMaterial({
					//     // color: new THREE.Color('rgb(43,100,141)').multiplyScalar(getNum(0.9, 1.1)),
					//     // color: new THREE.Color('hsl(212, 43.00%, 35.10%)').multiplyScalar(1.5),
					//     color: new Color("#489BD6").multiplyScalar(1.4),
					//     roughness: 0.7,
					//     metalness: 0.3,
					//     transparent: true,
					//     opacity: 0.8,
					//     envMapIntensity: 0.8,
					//     shaderOption: {
					//         minRate: 0.5, // 底部亮度系数
					//         maxRate: 1.5, // 顶部亮度系数
					//         maxY: 122.84, // 使用图片中的maxY值（单位：米）
					//     },
					// });

					const material = new MeshBuildGradientMaterial({
						color: new Color("#6BA7EC").multiplyScalar(1.4),
						opacity:0.8,
						shaderOption: {
							minY: 0, // 建筑底部Y坐标
							maxY: 50, // 建筑顶部Y坐标
							minRate: 0.3, // 底部亮度系数
							maxRate: 1.5, // 顶部亮度系数
							effects: {
								diffusion: {
									enabled: true,
									color: new Color("#FFFFF"),
									width: 80,
									speed: 0.5 / 3,
									//   center: new Vector3(0, 0, 0)
								},
								flow: {
									enabled: false,
									color: new Color("#FFFFF"),
									range: 1000,
									speed: 3000,
								},
								sweep: {
									enabled: true,
									color: new Color("#ffffff"),
									width: 3,
									speed: 5,
								},
							},
						},
					});

					const box = new Box3().setFromObject(child);
					material.updateBoundingBox(box.min.y, box.max.y);
					// 设置扩散中心为模型中心
					// 自动设置圆环参数
					material.setDiffusionFromObject(child);
					child.material = material;

					child.material.needsUpdate = true;

					// renderCity(child, {
					//     BaseColor: new Color("#7BB2E4"),
					//     topColor: "#A0C4DA",
					//     flowColor: "#FFFFFF",
					//     effectColor: "#FFFFFF",
					//     opacity: 0.9,
					//     diffusionParams: {
					//         enabled: true,
					//         range: 5000,
					//         speed: 50000,
					//         // center: new Vector3(0, 0, 0)
					//     },
					//     flowParams: {
					//         enabled: false,
					//         range: 500,
					//         speed: 5000,
					//     },
					//     animationSpeed: 0.01
					// });
					// const box = new Box3().setFromObject(child);
					// // const uMinWorldY = box.min.y + 1; // 最低点（可能是地面）
					// const uMaxWorldHeight = box.max.y;

					// console.log(uMaxWorldHeight, '模型最大高度--------------------------')

					// const box = new Box3().setFromObject(child);
					// console.log("模型包围盒信息:", {
					// 	minY: box.min.y, // 模型最低点Y值
					// 	maxY: box.max.y, // 模型最高点Y值
					// 	sizeY: box.max.y - box.min.y, // 模型总高度
					// });

					// let material = new MeshBuildGradientMaterial({
					// 	// color: new THREE.Color('rgb(43,100,141)').multiplyScalar(getNum(0.9, 1.1)),
					// 	// color: new THREE.Color('hsl(212, 43.00%, 35.10%)').multiplyScalar(1.5),
					// 	color: new Color("#489BD6").multiplyScalar(1.4),
					// 	roughness: 0.7,
					// 	metalness: 0.3,
					// 	transparent: true,
					// 	opacity: 0.8,
					// 	envMapIntensity: 0.8,
					// 	shaderOption: {
					// 		minRate: 0.5, // 底部亮度系数
					// 		maxRate: 1.5, // 顶部亮度系数
					// 		maxY: 122.84, // 使用图片中的maxY值（单位：米）
					// 	},
					// });
					// const box = new Box3().setFromObject(child);
					// material.updateBoundingBox(box.min.y, box.max.y);
					// child.material = material;
					// child.material.needsUpdate = true;

					// console.log(uMinWorldY, '模型最小高度--------------------------')

					// child.material = new MeshBuildGradientMaterial({
					// 	// color: new THREE.Color('rgb(43,100,141)').multiplyScalar(getNum(0.9, 1.1)),
					// 	// color: new THREE.Color('rgb(51,87,128)').multiplyScalar(1.5),
					// 	color: new Color("#489BD6"),
					// 	roughness: 0.7,
					// 	metalness: 0.3,
					// 	transparent: true,
					// 	opacity: 0.8,
					// 	envMapIntensity: 0.8,
					// 	shaderOption: {
					//         minRate: 0.3,  // 底部亮度系数
					//         maxRate: 1.5,  // 顶部亮度系数
					//         maxY: 122.84 // 使用图片中的maxY值（单位：米）
					// 	},
					// });

					// // 确保材质参数已更新
					// // child.material.shaderOption.maxHight = box.max.y;
					// child.material.needsUpdate = true; // 强制更新材质

					// console.log({
					//     // color: new THREE.Color('rgb(43,100,141)').multiplyScalar(getNum(0.9, 1.1)),
					//     // color: new THREE.Color('rgb(51,87,128)').multiplyScalar(1.5),
					//     color: new Color('#335a80').multiplyScalar(1.4),
					//     roughness: 0.7,
					//     metalness: 0.3,
					//     transparent: true,
					//     opacity: 0.8,
					//     envMapIntensity: 0.8,
					//     shaderOption: {
					//         maxHight: 25, minRate: 0.25, maxRate: 1.5,
					//     }
					// }, '我的建筑参数')
				}

				if (child.name === "grass") {
					// console.log(child.material, '草--------------------------')
					// 确保材质参数已更新
					// child.material.shaderOption.maxHight = box.max.y;
					// child.material.color = new Color("#298F80");
					child.castShadow = false;
					child.material.emissiveIntensity = 0.1;
					child.material.emissive = new Color("#3FD3BD");
					child.material.needsUpdate = true; // 强制更新材质
				}

		
			}
		});
	}
}

Model.mergeOptions(options);
