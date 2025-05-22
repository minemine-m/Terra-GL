import { Vector2, Vector3, BufferGeometry, BufferAttribute, Points, PointsMaterial, SpriteMaterial, Sprite, Color, Group, MeshBasicMaterial, Mesh, BackSide, DoubleSide, FrontSide, ShaderMaterial, RepeatWrapping, TextureLoader, Shape, ShapeGeometry } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Water } from 'three/addons/objects/Water.js';
import { ModelLoader } from '../loaders/ModelLoader';
import { Map } from '../map';
import { BasicPointStyle, BaseLineStyle, IconPointStyle, ModelStyle, BasePolygonStyle, ExtrudeStyle, WaterStyle, Style } from '../style';

// import earcut from 'earcut'; // 导入 earcut 库

export function _createBasicPoint(config: BasicPointStyle, positions: Vector3): Points {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0]), 3));

    const points = new Points(geometry, new PointsMaterial({
        size: config.size,
        color: config.color || 0xffffff,
        sizeAttenuation: !config.glow
    }));

    points.position.copy(positions);
    return points;
}


export async function _createIconPoint(config: IconPointStyle, positions: Vector3): Promise<Sprite> {
    const texture = await Style._loadTexture(config.url);
    const sprite = new Sprite(new SpriteMaterial({
        map: texture,
        color: config.color || 0xffffff,
        transparent: true,
        opacity: config.opacity ?? 1,
        sizeAttenuation: config.sizeAttenuation ?? true,
        //sizeAttenuation: false,
    }));

    sprite.scale.set(config.size[0], config.size[1], 1);
    if (config.rotation) sprite.rotation.z = config.rotation;
    if (config.anchor) sprite.center.set(config.anchor[0], config.anchor[1]);
    sprite.position.copy(positions);

    return sprite;
}

export function _createBasicLine(
    config: BaseLineStyle,
    positions: Vector3[] | number[] | Float32Array
): Line2 {
    // 1. 统一转换为平面数字数组 [x1,y1,z1, x2,y2,z2, ...]
    let flatPositions: number[];
    if (positions instanceof Float32Array) {
        flatPositions = Array.from(positions); // Float32Array 转普通数组
    } else if (Array.isArray(positions) && typeof positions[0] === 'number') {
        flatPositions = positions as number[]; // 已经是平面数组
    } else {
        // Vector3[] 情况：展开为 [x1,y1,z1, x2,y2,z2, ...]
        flatPositions = (positions as Vector3[]).flatMap(v => [v.x, v.y, v.z]);
    }

    // 2. 创建几何体并设置坐标
    const geometry = new LineGeometry();
    geometry.setPositions(flatPositions);

    // 3. 创建材质（支持虚线样式）
    const material = new LineMaterial({
        color: new Color(config.color ?? 0xffffff), // 默认白色
        linewidth: config.width ?? 1,              // 默认线宽1
        transparent: config.opacity !== undefined && config.opacity < 1,
        opacity: config.opacity ?? 1,              // 默认不透明
        dashed: !!config.dashArray,                // 是否虚线
        dashScale: config.dashArray?.[0] ?? 1,     // 虚线比例
        dashSize: config.dashArray?.[0] ?? 1,      // 虚线长度
        gapSize: config.dashArray?.[1] ?? 0,       // 虚线间隔
        resolution: config.resolution || new Vector2(1, 1) // 必须设置分辨率
    });

    // 4. 创建线对象
    return new Line2(geometry, material);
}

/**
 * 创建并加载3D模型
 * @param style 模型样式配置
 * @param position 模型位置
 * @returns  加载完成的模型组
 */
export async function _createModel(style: ModelStyle, position: Vector3): Promise<Group> {
    // 自动推断类型（如果未指定）
    const type = style.type || (style.url.toLowerCase().endsWith('.fbx') ? 'fbx' : 'gltf');

    // 使用ModelLoader加载模型
    const model = await ModelLoader.init().load({
        ...style,
        type,
        position
    });

    return model;
}
/**
 * 创建基础多边形
 * @param config 多边形样式配置
 * @param positions 多边形顶点坐标数组
 * @returns 多边形Mesh对象
 */
export function _createBasePolygon(
    config: BasePolygonStyle,
    positions: number[] // 明确要求平面数组，避免类型混淆
): Mesh {
    // 1. 创建几何体
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(
        new Float32Array(positions),
        3
    ));

    // 2. 改进的三角剖分
    const indices = [];
    const vertexCount = positions.length / 3;

    // 简单实现：假设是单个凸多边形
    // 实际项目中应该使用更健壮的三角剖分库
    for (let i = 1; i < vertexCount - 1; i++) {
        indices.push(0, i, i + 1);
    }

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // 3. 创建材质
    const material = new MeshBasicMaterial({
        color: new Color(config.color ?? 0xffffff),
        transparent: config.opacity !== undefined && config.opacity < 1,
        opacity: config.opacity ?? 1,
        wireframe: config.wireframe ?? false,
        side: config.side === 'back' ? BackSide :
            config.side === 'double' ? DoubleSide : FrontSide,
        depthWrite: true, // 显式启用深度写入（即使半透明）
        polygonOffset: true, // 启用多边形偏移
        polygonOffsetFactor: 1, // 调整偏移量
        polygonOffsetUnits: 1
    });

    return new Mesh(geometry, material);
}




export function _createExtrudedPolygon(
    config: ExtrudeStyle,
    flatPositions: number[] // 平面坐标[x,y,z,x,y,z...]
): Mesh {
    // 1. 参数处理
    const height = config.extrude?.height || 2000;
    // const isWireframe = config.wireframe ?? false;




    // 创建原始形状和拉伸后形状的顶点
    const vertices = [];
    const baseVertices = [];
    const topVertices = [];

    // 处理每个顶点
    for (let i = 0; i < flatPositions.length; i += 3) {
        const x = flatPositions[i];
        const y = flatPositions[i + 1]; // 保留原始Y值
        const z = flatPositions[i + 2];

        // 底面顶点（保持原始Y值）
        baseVertices.push(new Vector3(x, y, z));
        // 顶面顶点（Y值增加拉伸高度）
        topVertices.push(new Vector3(x, y + height, z));
    }

    // 合并所有顶点
    vertices.push(...baseVertices, ...topVertices);

    // 创建几何体
    const geometry = new BufferGeometry();
    geometry.setFromPoints(vertices);

    // 创建索引
    const indices = [];
    const len = baseVertices.length;

    // 侧面
    for (let i = 0; i < len; i++) {
        const next = (i + 1) % len;

        // 侧面四边形（两个三角形）
        indices.push(i, i + len, next);
        indices.push(next, i + len, next + len);
    }

    // 底面和顶面
    for (let i = 2; i < len; i++) {
        // 底面
        indices.push(0, i - 1, i);
        // 顶面
        indices.push(len, len + i - 1, len + i);
    }

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    if (!geometry.attributes.normal) {
        geometry.computeVertexNormals(); // 确保法线存在且正确
    }

    // const material = new MeshPhongMaterial({
    //     color: new Color(config.color ?? 0xffffff),
    //     transparent: config.opacity !== undefined && config.opacity < 1,
    //     opacity: config.opacity ?? 1,
    //     wireframe: isWireframe,
    //     side: config.side === 'back' ? BackSide :
    //         config.side === 'double' ? DoubleSide : FrontSide,
    //     depthWrite: true, // 显式启用深度写入（即使半透明）
    //     polygonOffset: true, // 启用多边形偏移
    //     polygonOffsetFactor: 4, // 调整偏移量
    //     polygonOffsetUnits: 2
    // });



    const material = new ShaderMaterial({
        uniforms: {
            uColor: { value: new Color(config.color ?? 0xffffff) }, // 粉红色
            uOpacity: { value: config.opacity ?? 1 },                      // 透明度
            uBrightness: { value: 1.2 }                   // 内部折角增亮系数
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal); // 法线转换到世界坐标
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uBrightness;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
      
          void main() {
            // 1. 计算菲涅尔效应（边缘高光）
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            
            // 2. 内部折角增亮（根据位置模拟凹陷效果）
            float innerGlow = smoothstep(0.3, 0.8, length(vWorldPosition - vec3(0.0))) * uBrightness;
            
            // 3. 混合颜色
            vec3 finalColor = uColor * (1.0 + fresnel * 0.5 + innerGlow);
            
            // 4. 强制透明度排序（深度测试后混合）
            gl_FragColor = vec4(finalColor, uOpacity);
            
            // 5. 深度写入控制（保持与不透明物体正确交互）
            if (uOpacity >= 0.99) gl_FragDepthEXT = gl_FragCoord.z;
          }
        `,
        transparent: true,
        side: DoubleSide, // 必须双面渲染
        depthWrite: true,      // 关闭深度写入避免冲突
        // extensions: {
        //   derivatives: true     // 启用GLSL扩展
        // }
    });


    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = 5000;
    return mesh;
}




export function _createWaterSurface(
    config: WaterStyle,
    map: Map,
    vertices: number[]
): Water {

    const {
        geometry,
        center,
        avgY
    } = _createPolygongeometry(vertices);

    const water = new Water(geometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new TextureLoader().load(config.normalMap, function (texture) {
            texture.wrapS = texture.wrapT = RepeatWrapping;
        }),
        waterColor: config.color || '#19AAEE',
        sunColor: config.sunColor || '#05FFF8',
        distortionScale: 1,
        alpha: config.opacity || 0.8,
    });

    const before = water.onBeforeRender;
    const after = water.onAfterRender;
    water.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
        map.tilemap.autoUpdate = false;
        before.call(water, renderer, scene, camera, geometry, material, group);
    };
    water.onAfterRender = (renderer, scene, camera, geometry, material, group) => {
        map.tilemap.autoUpdate = true;
        after.call(water, renderer, scene, camera, geometry, material, group);
    };
    water.material.uniforms["size"].value = 0.1;

    // 6. 关键调整：旋转和定位
    water.rotation.x = -Math.PI / 2;  // 旋转到XZ平面
    water.position.set(center.x, avgY, center.z);

    // 7. 动画更新
    map.viewer.addEventListener("update", () => {
        water.material.uniforms["time"].value += 1.0 / 60.0;
    });

    return water;
}

/**
 *  创建多边形几何体
 * @param vertices 
 * @returns 
 */
export function _createPolygongeometry(
    vertices: number[]
) {

    // 1. 计算平均 Y 值
    let avgY = 0;
    for (let i = 1; i < vertices.length; i += 3) {
        avgY += vertices[i];
    }
    avgY /= (vertices.length / 3);

    // 2. 计算形状的局部坐标（相对于中心点）
    const center = { x: 0, z: 0 };
    const shapePoints = [];

    // 计算中心点
    for (let i = 0; i < vertices.length; i += 3) {
        center.x += vertices[i];
        center.z += vertices[i + 2];
    }
    center.x /= (vertices.length / 3);
    center.z /= (vertices.length / 3);

    // 转换为相对于中心的局部坐标（注意Z轴取反）
    for (let i = 0; i < vertices.length; i += 3) {
        shapePoints.push(new Vector2(
            vertices[i] - center.x,    // 局部 X
            -(vertices[i + 2] - center.z)  // 局部 Z（取反）
        ));
    }

    // 3. 创建 Shape 和几何体
    const shape = new Shape(shapePoints);
    const geometry = new ShapeGeometry(shape);
    return {
        geometry,
        center,
        avgY
    }
}













