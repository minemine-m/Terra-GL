// import * as THREE from "three";

import {Color,Vector3, Clock, Mesh, Sphere ,Box3, MeshPhongMaterial}   from "three";



interface RenderCityOptions {
    materialColor?: string;
    topColor?: string;
    flowColor?: string;
    effectColor?: string;
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

export function renderCity(object:Mesh , options: RenderCityOptions = {}) {
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

    // Set default values
    const {
        materialColor = "#3F90D9",
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
        console.log(material,'---------------------------------------')
        material.transparent = true;
        material.color.setStyle(materialColor);

        material.onBeforeCompile = (shader: any) => {
            shader.uniforms.time = time;
            shader.uniforms.uStartTime = StartTime;

            // Geometry properties
            shader.uniforms.uCenter = { value: center };
            shader.uniforms.uSize = { value: size };
            shader.uniforms.uMax = { value: max };
            shader.uniforms.uMin = { value: min };
            shader.uniforms.uRadius = { value: radius };

            // Color properties
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
uniform vec3 uTopColor;
uniform vec3 uFlowColor;
uniform vec3 uDiffusion; 
uniform vec3 uDiffusionCenter;

void main() {
    `;

            const fragmentColor = `
vec3 distColor = outgoingLight;
float dstOpacity = diffuseColor.a;

float indexMix = vPosition.z / (uSize.z * 0.6);
distColor = mix(distColor, uTopColor, indexMix);

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

gl_FragColor = vec4(distColor, dstOpacity * uStartTime);
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
uniform float uStartTime;
void main() {
        vPositionMatrix = projectionMatrix * vec4(position, 1.0);
        vPosition = position;
        `;

            const vertexPosition = `
vec3 transformed = vec3(position.x, position.y, position.z * uStartTime);
        `;

            shader.vertexShader = shader.vertexShader.replace("void main() {", vertex);
            shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", vertexPosition);
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
    if (!callback || !materials) return ;
    if (Array.isArray(materials)) {
        materials.forEach((mat) => {
            callback(mat);
        });
    } else {
        callback(materials);
    }
}