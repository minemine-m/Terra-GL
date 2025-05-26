import * as THREE from 'three';

interface ShaderEffectOptions {
  // 扩散光效果配置
  diffusion?: {
    enabled: boolean;
    color: THREE.Color;
    range: number;
    speed: number;
    center?: THREE.Vector3;
  };
  // 流光效果配置
  flow?: {
    enabled: boolean;
    color: THREE.Color;
    range: number;
    speed: number;
  };
  // 扫光效果配置
  sweep?: {
    enabled: boolean;
    color: THREE.Color;
    width: number;
    speed: number;
  };
}

interface ShaderOption {
  minY: number; // 模型底部Y坐标
  maxY: number; // 模型顶部Y坐标
  minRate: number; // 底部亮度系数
  maxRate: number; // 顶部亮度系数
  effects?: ShaderEffectOptions; // 特效配置
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
          range: 120,
          speed: 600,
          center: undefined
        },
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

    // 自动计算动画
    this.animate();
  }

  onBeforeCompile(shader: any) {
    const { minY, maxY, minRate, maxRate, effects } = this.shaderOption;
    const heightRange = maxY - minY;

    // 添加uniforms
    shader.uniforms = {
      ...shader.uniforms,
      time: this.time,
      uStartTime: this.startTime,
      uMinY: { value: minY },
      uMaxY: { value: maxY },
      uHeightRange: { value: heightRange },
      uMinRate: { value: minRate },
      uMaxRate: { value: maxRate },
      // 特效相关uniforms
      uDiffusionEnabled: { value: effects?.diffusion?.enabled ? 1 : 0 },
      uDiffusionColor: { value: effects?.diffusion?.color || new THREE.Color('#9ECDEC') },
      uDiffusionRange: { value: effects?.diffusion?.range || 120 },
      uDiffusionSpeed: { value: effects?.diffusion?.speed || 600 },
      uDiffusionCenter: { value: effects?.diffusion?.center || new THREE.Vector3(0, 0, 0) },
      uFlowEnabled: { value: effects?.flow?.enabled ? 1 : 0 },
      uFlowColor: { value: effects?.flow?.color || new THREE.Color('#00E4FF') },
      uFlowRange: { value: effects?.flow?.range || 10 },
      uFlowSpeed: { value: effects?.flow?.speed || 20 },
      uSweepEnabled: { value: effects?.sweep?.enabled ? 1 : 0 },
      uSweepColor: { value: effects?.sweep?.color || new THREE.Color('#FFFFFF') },
      uSweepWidth: { value: effects?.sweep?.width || 1.5 },
      uSweepSpeed: { value: effects?.sweep?.speed || 10 }
    };

    // 修改顶点着色器
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

    // 修改片元着色器
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
      // 扩散光uniforms
      uniform int uDiffusionEnabled;
      uniform vec3 uDiffusionColor;
      uniform float uDiffusionRange;
      uniform float uDiffusionSpeed;
      uniform vec3 uDiffusionCenter;
      // 流光uniforms
      uniform int uFlowEnabled;
      uniform vec3 uFlowColor;
      uniform float uFlowRange;
      uniform float uFlowSpeed;
      // 扫光uniforms
      uniform int uSweepEnabled;
      uniform vec3 uSweepColor;
      uniform float uSweepWidth;
      uniform float uSweepSpeed;
      
      float distanceTo(vec2 src, vec2 dst) {
        float dx = src.x - dst.x;
        float dy = src.y - dst.y;
        float dv = dx * dx + dy * dy;
        return sqrt(dv);
      }
      
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // 高度渐变计算
      float normalizedHeight = clamp((vWorldPosition.y - uMinY) / uHeightRange, 0.0, 1.0);
      float heightFactor = smoothstep(0.0, 1.0, normalizedHeight);
      diffuseColor.rgb *= mix(uMinRate, uMaxRate, heightFactor);
      
      // 扩散光效果
      if (uDiffusionEnabled == 1) {
        vec2 position2D = vec2(vWorldPosition.x, vWorldPosition.z);
        vec2 center2D = vec2(uDiffusionCenter.x, uDiffusionCenter.z);
        float dTime = mod(time * uDiffusionSpeed, uDiffusionRange * 2.0);
        float uLen = distanceTo(position2D, center2D);
        
        if (uLen < dTime && uLen > dTime - uDiffusionRange) {
          float dIndex = sin((dTime - uLen) / uDiffusionRange * PI);
          diffuseColor.rgb = mix(uDiffusionColor, diffuseColor.rgb, 1.0 - dIndex);
        }
      }
      
      // 流光效果
      if (uFlowEnabled == 1) {
        float dTime = mod(time * uFlowSpeed, uFlowRange * 2.0);
        if (vPosition.z > dTime - uFlowRange && vPosition.z < dTime) {
          float dIndex = sin((dTime - vPosition.z) / uFlowRange * PI);
          diffuseColor.rgb = mix(uFlowColor, diffuseColor.rgb, 1.0 - dIndex);
        }
      }
      
      // 扫光效果
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

  // 更新包围盒
  updateBoundingBox(minY: number, maxY: number) {
    this.shaderOption.minY = minY;
    this.shaderOption.maxY = maxY;
    this.shaderOption.effects = this.shaderOption.effects || {};
    this.needsUpdate = true;
  }

  // 更新特效参数
  updateEffects(effects: Partial<ShaderEffectOptions>) {
    this.shaderOption.effects = {
      ...this.shaderOption.effects,
      ...effects
    };
    this.needsUpdate = true;
  }

  // 动画循环
  private animate() {
    requestAnimationFrame(() => this.animate());
    this.time.value = this.clock.getElapsedTime();
    if (this.startTime.value < 1.0) {
      this.startTime.value += 0.01;
    }
  }
}