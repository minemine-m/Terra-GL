import * as THREE from "three";

// 定义着色器选项的接口
interface ShaderOption {
  maxHight: number;
  minRate: number;
  maxRate: number;
}

// 定义材质选项的接口
interface MaterialOptions {
  color?: string | THREE.Color;
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  envMapIntensity?: number;
  shaderOption?: ShaderOption;
}

export class MeshBuildGradientMaterial extends THREE.MeshStandardMaterial {
  // 声明着色器选项属性
  shaderOption: ShaderOption;

  constructor(option: MaterialOptions = {
    color: 'rgb(58,126,182)',
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 0.8,
    shaderOption: {
      maxHight: 30,
      minRate: 0.3,
      maxRate: 1.5,
    }
  }) {
    // 复制选项并删除着色器选项
    const MeshStandardMaterialOption = { ...option };
    delete MeshStandardMaterialOption.shaderOption;
    
    // 调用父类构造函数
    super(MeshStandardMaterialOption);
    
    // 设置着色器选项，如果未提供则使用默认值
    this.shaderOption = option.shaderOption || {
      maxHight: 30,
      minRate: 0.3,
      maxRate: 1.5
    };
  }

  // 重写onBeforeCompile方法
  onBeforeCompile(shader: any) {
    const shaderOption = this.shaderOption;
    
    // 定义片元着色器代码
    const fragmentShader = `
      vec3 color = gl_FragColor.rgb;
      float rateHight = (vWorldPosition.y) / (${shaderOption.maxHight.toFixed(2)}); 
      gl_FragColor.rgb *= (mix(${shaderOption.minRate.toFixed(2)},${shaderOption.maxRate.toFixed(2)},rateHight));
      gl_FragColor.rgb *= 1.0;
    `;

    // 1. 添加varying变量到顶点着色器
    shader.vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float isTopFace;
      ${shader.vertexShader}
    `;

    // 2. 替换顶点着色器中的#include语句
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vUv = uv;
      vPosition = position;
      isTopFace = float(normal.z > 0.5);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      `
    );

    // 3. 添加varying变量到片元着色器
    shader.fragmentShader = `
      varying vec2 vUv;   
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      uniform float time;
      uniform bool fleeting;
      varying float isTopFace;
      ${shader.fragmentShader}
    `;

    // 4. 替换片元着色器中的#include语句
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `
      #include <output_fragment>
      ${fragmentShader}
      `
    );
  }
}