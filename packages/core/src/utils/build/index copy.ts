// import * as THREE from "three";

import { Color, Vector3, Clock, Mesh, Sphere, Box3, MeshPhongMaterial } from "three";



interface RenderCityOptions {
    BaseColor?: string | Color;
    topColor?: string | Color;
    flowColor?: string | Color;
    effectColor?: string | Color;
    opacity?: number;
    modRange?: number;
    modWidth?: number;
    diffusionParams?: {
        enabled: boolean;
        range: number;
        speed: number;
        center?: Vector3;
    };
    flowParams?: {
        enabled: boolean;
        range: number;
        speed: number;
    };
    animationSpeed?: number;
    switches?: {
        diffusion: boolean;
        sweep: boolean;
        upwardScan: boolean;
    };
}

export function renderCity(object: Mesh, options: RenderCityOptions = {}) {
    // Determine object's geometry box size
    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();

    const { geometry } = object;

    // Get geometry dimensions and center point
    const { center, radius } = geometry.boundingSphere as Sphere;
    const { max, min } = geometry.boundingBox as Box3;



    console.log(center, '模型中心点--------------------------')

    const size = new Vector3(
        max.x - min.x,
        max.y - min.y,
        max.z - min.z
    );
    // 在 JavaScript 中计算整个 Mesh 的世界高度
    const box = new Box3().setFromObject(object);
    const uMinWorldY = box.min.y + 1; // 最低点（可能是地面）
    const uMaxWorldHeight = box.max.y - uMinWorldY; // 实际建筑高度范围

    console.log(uMaxWorldHeight, '模型最大高度--------------------------')
    console.log(uMinWorldY, '模型最小高度--------------------------')
    // material.uniforms.uMaxWorldHeight = { value: uMaxWorldHeight };


    console.log("模型尺寸 uSize:", size); // 打印 uSize 的值
    console.log("模型最小点 min:", min);  // 打印 min 坐标
    console.log("模型最大点 max:", max);  // 打印 max 坐标

    // Set default values
    const {
        BaseColor = "#3F90D9",
        topColor = "#00F6E5",
        flowColor = "#00E4FF",
        effectColor = "#9ECDEC",
        opacity = 1,
        modRange = 10,
        modWidth = 1.5,
        diffusionParams = { enabled: true, range: 120, speed: 600 },
        flowParams = { enabled: true, range: 10, speed: 20 },
        animationSpeed = 0.01,
        switches = { diffusion: false, sweep: false, upwardScan: false }
    } = options;

    const time = { value: 0 };
    const StartTime = { value: 0 };

    forMaterial(object.material, (material: MeshPhongMaterial) => {
        console.log(material, '---------------------------------------')
        material.transparent = true;
        // @ts-ignore
        // material.color = materialColor;


        material.onBeforeCompile = (shader: any) => {
            shader.uniforms.time = time;
            shader.uniforms.uStartTime = StartTime;

            // Geometry properties
            shader.uniforms.uCenter = { value: center };
            shader.uniforms.uSize = { value: size };
            shader.uniforms.uMax = { value: max };
            shader.uniforms.uMin = { value: min };
            shader.uniforms.uRadius = { value: radius };
            shader.uniforms.uMaxWorldHeight = { value: uMaxWorldHeight };
            shader.uniforms.uMinWorldY = { value: uMinWorldY };


            // Color properties
            shader.uniforms.uBaseColor = { value: new Color(BaseColor) };
            shader.uniforms.uTopColor = { value: new Color(topColor) };
            shader.uniforms.uColor = { value: new Color(effectColor) };
            shader.uniforms.uFlowColor = { value: new Color(flowColor) };

            // Effect properties
            shader.uniforms.uOpacity = { value: opacity };
            shader.uniforms.uModRange = { value: modRange };
            shader.uniforms.uModWidth = { value: modWidth };



            // Effect switches
            shader.uniforms.uSwitch = {
                value: new Vector3(
                    switches.diffusion ? 1 : 0,
                    switches.sweep ? 1 : 0,
                    switches.upwardScan ? 1 : 0
                )
            };

            // Diffusion parameters
            shader.uniforms.uDiffusion = {
                value: new Vector3(
                    diffusionParams.enabled ? 1 : 0,
                    diffusionParams.range,
                    diffusionParams.speed
                )
            };
            shader.uniforms.uDiffusionCenter = {
                value: diffusionParams.center || new Vector3(0, 0, 0)
            };

            // Flow parameters
            shader.uniforms.uFlow = {
                value: new Vector3(
                    flowParams.enabled ? 1 : 0,
                    flowParams.range,
                    flowParams.speed
                )
            };


            const fragment = `
float distanceTo(vec2 src, vec2 dst) {
    float dx = src.x - dst.x;
    float dy = src.y - dst.y;
    float dv = dx * dx + dy * dy;
    return sqrt(dv);
}

float lerp(float x, float y, float t) {
    return (1.0 - t) * x + t * y;
}

vec3 getGradientColor(vec3 color1, vec3 color2, float index) {
    float r = lerp(color1.r, color2.r, index);
    float g = lerp(color1.g, color2.g, index);
    float b = lerp(color1.b, color2.b, index);
    return vec3(r, g, b);
}

varying vec4 vPositionMatrix;
varying vec3 vPosition;
varying float vWorldY;

uniform float time;
uniform float uRadius;
uniform float uOpacity;
uniform float uModRange;
uniform float uModWidth;
uniform float uStartTime; 
uniform vec3 uMin;
uniform vec3 uMax;
uniform vec3 uSize;
uniform vec3 uFlow;
uniform vec3 uColor;
uniform vec3 uCenter;
uniform vec3 uSwitch;
uniform vec3 uBaseColor;
uniform vec3 uTopColor;
uniform vec3 uFlowColor;
uniform vec3 uDiffusion; 
uniform vec3 uDiffusionCenter;
uniform float uMaxWorldHeight; // 整个场景的最高点 Y 值
uniform float uMinWorldY; // 整个场景的最低点 Y 值


void main() {
    `;
            const fragmentColor = `
vec3 distColor = outgoingLight * uBaseColor; // 将基础色与原始颜色相乘
float dstOpacity = diffuseColor.a;

// // 片元着色器：修正Y轴计算（减去地面偏移）
// float normalizedY = (vWorldY - uMinWorldY) / uMaxWorldHeight;
// // float indexMix = clamp(normalizedY, 0.0, 1.0);
// float indexMix = pow(normalizedY, 0.5); // 0.5降低高光区，提升暗部
// distColor = mix(distColor, uTopColor, indexMix);



// 1. 保持你的原始高度计算
float normalizedY = (vWorldY - uMinWorldY) / (uMaxWorldHeight - uMinWorldY);
normalizedY = clamp(normalizedY, 0.0, 1.0);

// 2. 恢复矮建筑渐变（关键修改）
float indexMix = log(normalizedY * 15.0 + 1.0) / log(11.0); // 完全恢复你的原始对数拉伸

// 3. 仅对高建筑做温和限制（新增逻辑）
if (normalizedY > 0.92) {                       // 仅针对顶部8%高度
    float compression = smoothstep(0.92, 1.0, normalizedY);
    indexMix = mix(indexMix, 0.65, compression); // 最高亮度降至65%
}

// 4. 强制矮建筑基础亮度（你的原始逻辑）
float minTopMix = 0.3;
if (normalizedY > 0.01) {
    indexMix = max(indexMix, minTopMix * (1.0 - exp(-normalizedY * 5.0)));
}


distColor = mix(distColor, uTopColor, indexMix); // 应用渐变

// Diffusion wave
vec2 position2D = vec2(vPosition.x, vPosition.y);
float mx = mod(vPosition.x, uModRange);
float my = mod(vPosition.y, uModRange);
float mz = mod(vPosition.z, uModRange);

if (uDiffusion.x > 0.5) {
    float dTime = mod(time * uDiffusion.z, uRadius * 2.0);
    float uLen = distanceTo(position2D, vec2(uCenter.x, uCenter.z));

    if (uLen < dTime && uLen > dTime - uDiffusion.y) {
        float dIndex = sin((dTime - uLen) / uDiffusion.y * PI);
        distColor = mix(uColor, distColor, 1.0 - dIndex);
    }
}

// Flow effect
if (uFlow.x > 0.5) {
    float dTime = mod(time * uFlow.z, uSize.z); 
    float topY = vPosition.z + uFlow.y;
    if (dTime > vPosition.z && dTime < topY) {
        float dIndex = sin((topY - dTime) / uFlow.y * PI);
        distColor = mix(distColor, uFlowColor, dIndex); 
    }
}


// gl_FragColor = vec4(distColor, uOpacity);

// 检查 vWorldY 的分布
 gl_FragColor = vec4(vec3(distColor), uOpacity);


    `;

            shader.fragmentShader = shader.fragmentShader.replace("void main() {", fragment);
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                ${fragmentColor}`
            );


            const vertex = `
varying vec4 vPositionMatrix;
varying vec3 vPosition;
varying float vWorldY;
uniform float uStartTime;
void main() {
        vWorldY = (modelMatrix * vec4(position, 1.0)).y;
        vPositionMatrix = projectionMatrix * vec4(position, 1.0);
        vPosition = position;
        `;

            const vertexPosition = `
vec3 transformed = vec3(position.x, position.y, position.z * uStartTime);
        `;

            shader.vertexShader = shader.vertexShader.replace("void main() {", vertex);
            shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", vertexPosition);

            material.shininess = 30;  // 增加高光锐度
            material.specular.set(0xffffff);  // 设置高光颜色
            material.flatShading = true;


            // material.emissive.set(0x222222); // 基础自发光
            // material.emissiveIntensity = 0.5;
            // material.shininess = 30; // 更锐利高光


        }


    });

    // Create clock for time tracking
    const clock = new Clock();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        time.value = clock.getElapsedTime();
        if (StartTime.value < 1.0) {
            StartTime.value += animationSpeed;
        }
    }

    animate();
}

function forMaterial(materials: any, callback: Function): void {
    if (!callback || !materials) return;
    if (Array.isArray(materials)) {
        materials.forEach((mat) => {
            callback(mat);
        });
    } else {
        callback(materials);
    }
}