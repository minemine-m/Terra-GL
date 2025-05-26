import * as THREE from 'three';

interface ShaderEffectOptions {
  // 修改为圆环扩散效果配置
  diffusion?: {
    enabled: boolean;
    color: THREE.Color;
    width: number;      // 圆环宽度（原range改名）
    speed: number;      // 扩散速度
    maxDistance?: number; // 新增：最大扩散距离
    center?: THREE.Vector3;
  };
  // 保留原有其他效果
  flow?: {
    enabled: boolean;
    color: THREE.Color;
    range: number;
    speed: number;
  };
  sweep?: {
    enabled: boolean;
    color: THREE.Color;
    width: number;
    speed: number;
  };
}

interface ShaderOption {
  minY: number;
  maxY: number;
  minRate: number;
  maxRate: number;
  effects?: ShaderEffectOptions;
}

interface MaterialOptions extends THREE.MeshStandardMaterialParameters {
  shaderOption?: Partial<ShaderOption>;
}

export class MeshBuildGradientMaterial extends THREE.MeshStandardMaterial {
  shaderOption: ShaderOption;
  private clock: THREE.Clock;
  private time: { value: number };
  private startTime: { value: number };

  constructor(options: MaterialOptions = {}) {
    const { shaderOption, ...standardOptions } = options;

    super({
      color: "rgb(58,126,182)",
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 0.8,
      ...standardOptions,
    });

    this.shaderOption = {
      minY: 0,
      maxY: 100,
      minRate: 0.3,
      maxRate: 1.5,
      effects: {
        diffusion: {
          enabled: false,
          color: new THREE.Color('#9ECDEC'),
          width: 20,     // 改为width表示圆环宽度
          speed: 1,       // 调整速度为更合理的值
          maxDistance: 100, // 新增默认值
          center: undefined
        },
        // 保留其他效果默认配置
        flow: {
          enabled: false,
          color: new THREE.Color('#00E4FF'),
          range: 10,
          speed: 20
        },
        sweep: {
          enabled: false,
          color: new THREE.Color('#FFFFFF'),
          width: 1.5,
          speed: 10
        }
      },
      ...shaderOption,
    };

    this.clock = new THREE.Clock();
    this.time = { value: 0 };
    this.startTime = { value: 0 };
    this.animate();
  }

  onBeforeCompile(shader: any) {
    const { minY, maxY, minRate, maxRate, effects } = this.shaderOption;
    const heightRange = maxY - minY;

    // 更新uniforms（修改diffusion相关参数）
    shader.uniforms = {
      ...shader.uniforms,
      time: this.time,
      uStartTime: this.startTime,
      uMinY: { value: minY },
      uMaxY: { value: maxY },
      uHeightRange: { value: heightRange },
      uMinRate: { value: minRate },
      uMaxRate: { value: maxRate },
      // 修改后的圆环扩散uniforms
      uDiffusionEnabled: { value: effects?.diffusion?.enabled ? 1 : 0 },
      uDiffusionColor: { value: effects?.diffusion?.color || new THREE.Color('#9ECDEC') },
      uDiffusionWidth: { value: effects?.diffusion?.width || 20 },
      uDiffusionSpeed: { value: effects?.diffusion?.speed || 1 },
      uDiffusionMaxDistance: { value: effects?.diffusion?.maxDistance || 100 },
      uDiffusionCenter: { value: effects?.diffusion?.center || new THREE.Vector3(0, 0, 0) },
      // 保留其他效果uniforms
      uFlowEnabled: { value: effects?.flow?.enabled ? 1 : 0 },
      uFlowColor: { value: effects?.flow?.color || new THREE.Color('#00E4FF') },
      uFlowRange: { value: effects?.flow?.range || 10 },
      uFlowSpeed: { value: effects?.flow?.speed || 20 },
      uSweepEnabled: { value: effects?.sweep?.enabled ? 1 : 0 },
      uSweepColor: { value: effects?.sweep?.color || new THREE.Color('#FFFFFF') },
      uSweepWidth: { value: effects?.sweep?.width || 1.5 },
      uSweepSpeed: { value: effects?.sweep?.speed || 10 }
    };

    // 顶点着色器保持不变
    shader.vertexShader = `
      varying vec3 vWorldPosition;
      varying vec3 vPosition;
      varying float vHeight;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vPosition = position;
      vHeight = position.y;
      `
    );

    // 修改片元着色器中的扩散光部分
    shader.fragmentShader = `
      #define PI 3.141592653589793
      varying vec3 vWorldPosition;
      varying vec3 vPosition;
      varying float vHeight;
      uniform float uMinY;
      uniform float uMaxY;
      uniform float uHeightRange;
      uniform float uMinRate;
      uniform float uMaxRate;
      uniform float time;
      uniform float uStartTime;
      // 修改后的圆环扩散uniforms
      uniform int uDiffusionEnabled;
      uniform vec3 uDiffusionColor;
      uniform float uDiffusionWidth;
      uniform float uDiffusionSpeed;
      uniform float uDiffusionMaxDistance;
      uniform vec3 uDiffusionCenter;
      // 其他效果uniforms保持不变
      uniform int uFlowEnabled;
      uniform vec3 uFlowColor;
      uniform float uFlowRange;
      uniform float uFlowSpeed;
      uniform int uSweepEnabled;
      uniform vec3 uSweepColor;
      uniform float uSweepWidth;
      uniform float uSweepSpeed;
      
      float distanceTo(vec2 src, vec2 dst) {
        return distance(src, dst);
      }
      
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // 保留高度渐变计算
      float normalizedHeight = clamp((vWorldPosition.y - uMinY) / uHeightRange, 0.0, 1.0);
      float heightFactor = smoothstep(0.0, 1.0, normalizedHeight);
      diffuseColor.rgb *= mix(uMinRate, uMaxRate, heightFactor);
      
      // ================= 修改为圆环扩散效果 =================
    if (uDiffusionEnabled == 1) {
    vec2 position2D = vec2(vWorldPosition.x, vWorldPosition.z);
    vec2 center2D = vec2(uDiffusionCenter.x, uDiffusionCenter.z);
    float distToCenter = distance(position2D, center2D);
    
    float progress = mod(time * uDiffusionSpeed, 1.0);
    float currentRadius = progress * uDiffusionMaxDistance;
    
    if (distToCenter > currentRadius - uDiffusionWidth && 
        distToCenter < currentRadius) {
        // 核心亮度增强修改：
        float ringFactor = smoothstep(
            currentRadius - uDiffusionWidth,
            currentRadius,
            distToCenter
        );
        
        // 1. 增强亮度：颜色值乘以5倍（可根据需要调整）
        vec3 highBrightnessColor = uDiffusionColor * 5.0;
        
        // 2. 改用加法混合模式（更亮）
        diffuseColor.rgb += highBrightnessColor * (1.0 - ringFactor);
        
        // 3. 防止过曝（可选）
        diffuseColor.rgb = min(diffuseColor.rgb, vec3(2.0));
    }
}
      
      // ================= 保留原有其他效果 =================
      // 流光效果（保持不变）
      if (uFlowEnabled == 1) {
        float dTime = mod(time * uFlowSpeed, uFlowRange * 2.0);
        if (vPosition.z > dTime - uFlowRange && vPosition.z < dTime) {
          float dIndex = sin((dTime - vPosition.z) / uFlowRange * PI);
          diffuseColor.rgb = mix(uFlowColor, diffuseColor.rgb, 1.0 - dIndex);
        }
      }
      
      // 扫光效果（保持不变）
      if (uSweepEnabled == 1) {
        float sweepPos = mod(time * uSweepSpeed, 2.0);
        if (vHeight > sweepPos - uSweepWidth && vHeight < sweepPos) {
          float sweepFactor = smoothstep(sweepPos - uSweepWidth, sweepPos, vHeight);
          diffuseColor.rgb = mix(uSweepColor, diffuseColor.rgb, 1.0 - sweepFactor);
        }
      }
      `
    );
  }

  // 新增：自动计算圆环扩散参数
  setDiffusionFromObject(object: THREE.Object3D) {
    if (!this.shaderOption.effects?.diffusion) return;
    
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;
    
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // 计算模型最远点距离
    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z)
    ];
    let maxDistance = 0;
    corners.forEach(corner => {
      const d = center.distanceTo(corner);
      if (d > maxDistance) maxDistance = d;
    });
    
    this.shaderOption.effects.diffusion = {
      ...this.shaderOption.effects.diffusion,
      center: center,
      maxDistance: maxDistance
    };
    this.needsUpdate = true;
  }

  // 保留原有方法
  updateBoundingBox(minY: number, maxY: number) {
    this.shaderOption.minY = minY;
    this.shaderOption.maxY = maxY;
    this.needsUpdate = true;
  }

  updateEffects(effects: Partial<ShaderEffectOptions>) {
    this.shaderOption.effects = {
      ...this.shaderOption.effects,
      ...effects
    };
    this.needsUpdate = true;
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.time.value = this.clock.getElapsedTime();
    if (this.startTime.value < 1.0) {
      this.startTime.value += 0.01;
    }
  }
}