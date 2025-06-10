import { Vector2, Vector3, BufferGeometry, BufferAttribute, Points, PointsMaterial, SpriteMaterial, Sprite, Color, Group, MeshBasicMaterial, Mesh, BackSide, DoubleSide, FrontSide, ShaderMaterial, RepeatWrapping, TextureLoader, Shape, ShapeGeometry, MeshStandardMaterial, CanvasTexture, MathUtils, NearestFilter, LinearMipmapLinearFilter, Texture, NormalBlending } from 'three';

import { Line2, LineMaterial, LineGeometry, Water } from 'three-stdlib';
import { ModelLoader } from '../loaders/ModelLoader';
import { Map } from '../map';
import { BasicPointStyle, BaseLineStyle, IconPointStyle, ModelStyle, BasePolygonStyle, ExtrudeStyle, WaterStyle, CloudStyle, LabelStyle, IconLabelStyle, Style } from '../style';
import { Cloud as vanillaCloud } from "@pmndrs/vanilla";


interface CanvasResult {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    center: [number, number];
}

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
        color: new Color(config.color ?? 0xffffff).getHex(),
        linewidth: config.width ?? 2, // 增加默认线宽
        transparent: config.opacity !== undefined && config.opacity < 1,
        opacity: config.opacity ?? 1,
        dashed: !!config.dashArray,
        dashScale: config.dashArray?.[0] ?? 1,
        dashSize: config.dashArray?.[0] ?? 1,
        gapSize: config.dashArray?.[1] ?? 0,
        resolution: new Vector2(window.innerWidth, window.innerHeight), // 设置正确分辨率
        alphaToCoverage: true // 启用 alpha 到覆盖
    });

    // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
        material.resolution.set(window.innerWidth, window.innerHeight);
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


export async function _createBaseWaterSurface(
    config: WaterStyle,
    vertices: number[]
): Promise<Mesh> {
    const {
        geometry,
        center,
        avgY
    } = _createPolygongeometry(vertices);

    // 加载纹理并设置平铺
    const texture = await Style._loadTexture(config.normalMap);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(0.01, 0.01);
    texture.needsUpdate = true;

    // 创建材质
    const waterMaterial = new MeshStandardMaterial({
        color: new Color(config.color).multiplyScalar(2.0),
        roughness: 0.0,
        metalness: 0.6,
        transparent: true,
        opacity: 0.9,
        fog: false,
        bumpMap: texture,
        bumpScale: 0.6,
        ...({})
    });

    // 创建水面网格
    const water = new Mesh(geometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(center.x, avgY, center.z);
    water.castShadow = false;
    water.receiveShadow = true;

    let lastTime = 0;
    const animationSpeed = 2.5; // 可调整动画速度


    water.onBeforeRender = () => {
        const time = performance.now();
        const delta = lastTime ? (time - lastTime) / 1000 : 0.016; // 计算时间差（秒）

        // 动态移动纹理（产生水流效果）
        texture.offset.x += delta * animationSpeed * 0.1;
        texture.offset.y += delta * animationSpeed * 0.05;

        lastTime = time;
    };

    // // 方法二：如果需要更复杂的控制，可以暴露API
    // (water as any).setAnimationSpeed = (speed: number) => {
    //     animationSpeed = speed;
    // };

    return water;
}


export function _createClouds(
    config: CloudStyle, positions: Vector3
) {
    // clouds.add(cloud)
    // let vanillacloudfonfig = config;
    config.color = new Color(config.hexcolor);
    if (config.boundstext) {
        config.bounds = new Vector3(config.boundstext.x, config.boundstext.y, config.boundstext.z); // 调整云的大小
        // config.scale = new Vector3(1, 0.01, 1); // 调整云的大小
    }

    // console.log('---------------云朵样式', config)

    const cloud = new vanillaCloud(config);
    cloud.castShadow = true; // 允许云投射阴影
    cloud.scale.setScalar(50);

    cloud.position.copy(positions);

    // clouds.add(cloud)
    return cloud;
}


// 添加 canvas的文字标注
export async function _createTextSprite(config: LabelStyle, positions: Vector3): Promise<Sprite> {
    // 默认配置
    const textStyleConfig = {
        fontSize: 48,
        fontFamily: "'Microsoft YaHei', sans-serif",
        fontWeight: 'bold',
        fontStyle: 'normal',
        textColor: '#ffffff',
        strokeColor: '#000000',    // 文字描边颜色
        strokeWidth: 2,            // 文字描边宽度
        showBackground: true,      // 是否显示背景框
        bgStyle: 1,                // 背景样式：1=圆角矩形，2=气泡
        bgColor: '#3498db',
        bgOpacity: 0.8,            // 背景透明度
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 5,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        roundRectRadius: 20,
        bubblePointerHeight: 10,
        bubblePointerWidth: 15,
        bubbleBorderColor: '#ffffff',
        bubbleBorderWidth: 3,
        fixedSize: 50,             // 固定大小值（世界坐标单位）
    };

    // 合并配置
    const finalConfig = { ...textStyleConfig, ...config };
    finalConfig.fontSize = Math.min(Math.max(finalConfig.fontSize, 8), 128);

    // 创建canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas context is null');

    // 设置字体和计算尺寸
    const fontString = `${finalConfig.fontStyle} ${finalConfig.fontWeight} ${finalConfig.fontSize}px ${finalConfig.fontFamily}`;
    ctx.font = fontString;

    const padding = finalConfig.showBackground ? 20 : 0;
    const minWidth = 100;
    const minHeight = 50;

    const textMetrics = ctx.measureText(finalConfig.text);
    const textWidth = Math.max(minWidth, textMetrics.width + padding * 2);
    const textHeight = Math.max(minHeight, finalConfig.fontSize * 1.5 + padding * 2);

    canvas.width = Math.min(textWidth, 2048);
    canvas.height = Math.min(textHeight, 2048);

    // 重新设置上下文
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontString;

    // 绘制背景（如果启用）
    if (finalConfig.showBackground) {
        if (finalConfig.bgStyle === 1) {
            // 圆角矩形背景
            ctx.fillStyle = finalConfig.bgColor;
            ctx.globalAlpha = finalConfig.bgOpacity;
            ctx.beginPath();
            roundRect(ctx, padding / 2, padding / 2, canvas.width - padding, canvas.height - padding, finalConfig.roundRectRadius);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // 阴影效果
            ctx.shadowColor = finalConfig.shadowColor;
            ctx.shadowBlur = finalConfig.shadowBlur;
            ctx.shadowOffsetX = finalConfig.shadowOffsetX;
            ctx.shadowOffsetY = finalConfig.shadowOffsetY;
        } else {
            // 气泡背景
            ctx.fillStyle = finalConfig.bgColor;
            ctx.globalAlpha = finalConfig.bgOpacity;
            ctx.beginPath();
            drawSpeechBubble(
                ctx,
                canvas.width / 2,
                canvas.height / 2,
                canvas.width * 0.8,
                canvas.height * 0.8,
                finalConfig.roundRectRadius,
                finalConfig.bubblePointerHeight,
                finalConfig.bubblePointerWidth
            );
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // 气泡边框
            ctx.strokeStyle = finalConfig.bubbleBorderColor;
            ctx.lineWidth = finalConfig.bubbleBorderWidth;
            ctx.stroke();
        }
    }

    // 绘制文字（带描边）
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 先绘制描边
    if (finalConfig.strokeWidth > 0) {
        ctx.strokeStyle = finalConfig.strokeColor;
        ctx.lineWidth = finalConfig.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(finalConfig.text, canvas.width / 2, canvas.height / 2);
    }

    // 再绘制填充文字
    ctx.fillStyle = finalConfig.textColor;
    ctx.fillText(finalConfig.text, canvas.width / 2, canvas.height / 2);

    // 重置阴影
    ctx.shadowColor = 'transparent';

    // 创建sprite
    const texture = new CanvasTexture(canvas);
    texture.magFilter = NearestFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.anisotropy = 16;

    const material = new SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        fog: false
    });

    const sprite = new Sprite(material);

    // 设置固定大小
    const fixedScale = finalConfig.fixedSize;
    sprite.scale.set(
        canvas.width * fixedScale / 100,
        canvas.height * fixedScale / 100,
        1
    );

    if (positions) {
        sprite.position.copy(positions);
    }

    sprite.renderOrder = 9999;

    return sprite;
}

export async function _createFixedSizeTextSprite(
    config: LabelStyle,
    position: Vector3,
    map: Map,
): Promise<Sprite> {
    // 默认配置
    const defaults = {
        fontSize: 48,
        fontFamily: "'Microsoft YaHei', sans-serif",
        fontWeight: 'bold',
        fontStyle: 'normal',
        textColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        showBackground: true,
        bgStyle: 1,
        bgColor: '#3498db',
        bgOpacity: 0.8,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 5,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        roundRectRadius: 20,
        bubblePointerHeight: 10,
        bubblePointerWidth: 15,
        bubbleBorderColor: '#ffffff',
        bubbleBorderWidth: 3,
        screenSpaceSize: 20, // 固定像素大小
        maxVisibleDistance: Infinity // 最大可见距离
    };

    // 合并配置
    const finalConfig = { ...defaults, ...config };
    finalConfig.fontSize = Math.min(Math.max(finalConfig.fontSize, 8), 128);

    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // 设置字体和计算尺寸
    const fontString = `${finalConfig.fontStyle} ${finalConfig.fontWeight} ${finalConfig.fontSize}px ${finalConfig.fontFamily}`;
    ctx.font = fontString;

    const padding = finalConfig.showBackground ? 20 : 0;
    const minWidth = 100;
    const minHeight = 50;

    const textMetrics = ctx.measureText(finalConfig.text);
    const textWidth = Math.max(minWidth, textMetrics.width + padding * 2);
    const textHeight = Math.max(minHeight, finalConfig.fontSize * 1.5 + padding * 2);

    canvas.width = Math.min(textWidth, 2048);
    canvas.height = Math.min(textHeight, 2048);

    // 绘制背景和文字（与之前相同）
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontString;

    if (finalConfig.showBackground) {
        if (finalConfig.bgStyle === 1) {
            // 圆角矩形背景
            ctx.fillStyle = finalConfig.bgColor;
            ctx.globalAlpha = finalConfig.bgOpacity;
            ctx.beginPath();
            roundRect(ctx, padding / 2, padding / 2, canvas.width - padding, canvas.height - padding, finalConfig.roundRectRadius);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            ctx.shadowColor = finalConfig.shadowColor;
            ctx.shadowBlur = finalConfig.shadowBlur;
            ctx.shadowOffsetX = finalConfig.shadowOffsetX;
            ctx.shadowOffsetY = finalConfig.shadowOffsetY;
        } else {
            // 气泡背景
            ctx.fillStyle = finalConfig.bgColor;
            ctx.globalAlpha = finalConfig.bgOpacity;
            ctx.beginPath();
            drawSpeechBubble(
                ctx,
                canvas.width / 2,
                canvas.height / 2,
                canvas.width * 0.8,
                canvas.height * 0.8,
                finalConfig.roundRectRadius,
                finalConfig.bubblePointerHeight,
                finalConfig.bubblePointerWidth
            );
            ctx.fill();
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = finalConfig.bubbleBorderColor;
            ctx.lineWidth = finalConfig.bubbleBorderWidth;
            ctx.stroke();
        }
    }

    // 绘制文字（带描边）
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (finalConfig.strokeWidth > 0) {
        ctx.strokeStyle = finalConfig.strokeColor;
        ctx.lineWidth = finalConfig.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(finalConfig.text, canvas.width / 2, canvas.height / 2);
    }

    ctx.fillStyle = finalConfig.textColor;
    ctx.fillText(finalConfig.text, canvas.width / 2, canvas.height / 2);
    ctx.shadowColor = 'transparent';

    // 创建Sprite
    const texture = new CanvasTexture(canvas);
    // texture.magFilter = NearestFilter;
    // texture.minFilter = LinearMipmapLinearFilter;
    const material = new SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        fog: false
    });

    const sprite = new Sprite(material);
    sprite.position.copy(position);
    sprite.renderOrder = 9999;
    sprite.userData.isLabel = true; // 标记为文字标注

    // 核心：动态更新大小的函数
    const updateSize = () => {
        if (!sprite.visible) return;

        // 计算相机距离
        const distance = map.viewer.camera.position.distanceTo(sprite.position);

        // 距离裁剪
        if (distance > finalConfig.maxVisibleDistance) {
            sprite.visible = false;
            return;
        }
        sprite.visible = true;
        // 正确获取渲染器尺寸的方式
        const size = new Vector2();
        map.viewer.renderer.getSize(size); // 传入Vector2对象接收结果
        // 计算屏幕空间缩放因子
        const viewportHeight = size.height;
        const scale = (finalConfig.screenSpaceSize / canvas.height) *
            (distance / Math.tan(MathUtils.degToRad(map.viewer.camera.fov) / 2)) *
            (2 / viewportHeight);

        sprite.scale.set(scale * canvas.width, scale * canvas.height, 1);

        // 可选：使文字始终面向相机（类似CSS2D）
        sprite.lookAt(map.viewer.camera.position);
    };

    // 初始化和绑定事件
    updateSize();
    const onBeforeRender = () => updateSize();
    sprite.addEventListener('dispose', () => {
        map.viewer.renderer.domElement.removeEventListener('resize', updateSize);
    });

    // 监听渲染器和窗口事件
    map.viewer.renderer.domElement.addEventListener('resize', updateSize);
    map.viewer.camera.addEventListener('change', updateSize);
    sprite.onBeforeRender = onBeforeRender;

    return sprite;
}





function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}


function drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    width: number,
    height: number,
    radius: number,
    pointerHeight?: number,
    pointerWidth?: number
): void {
    // 参数验证
    if (width <= 0) throw new Error("Width must be positive");
    if (height <= 0) throw new Error("Height must be positive");
    if (radius < 0) throw new Error("Radius cannot be negative");

    const bubbleWidth = width;
    const bubbleHeight = height;
    const bubbleRadius = Math.min(radius, width / 2, height / 2); // 确保半径不超过宽度/高度的一半
    const pointerHeightValue = pointerHeight ?? 10;
    const pointerWidthValue = pointerWidth ?? 15;

    ctx.beginPath();

    // 开始点：左上角+圆角
    ctx.moveTo(cx - bubbleWidth / 2 + bubbleRadius, cy - bubbleHeight / 2);

    // 顶部线条
    ctx.lineTo(cx + bubbleWidth / 2 - bubbleRadius, cy - bubbleHeight / 2);
    ctx.quadraticCurveTo(
        cx + bubbleWidth / 2, cy - bubbleHeight / 2,
        cx + bubbleWidth / 2, cy - bubbleHeight / 2 + bubbleRadius
    );

    // 右侧线条
    ctx.lineTo(cx + bubbleWidth / 2, cy + bubbleHeight / 2 - bubbleRadius);
    ctx.quadraticCurveTo(
        cx + bubbleWidth / 2, cy + bubbleHeight / 2,
        cx + bubbleWidth / 2 - bubbleRadius, cy + bubbleHeight / 2
    );

    // 底部线条（指针在底部中间）
    ctx.lineTo(cx + pointerWidthValue / 2, cy + bubbleHeight / 2);
    ctx.lineTo(cx, cy + bubbleHeight / 2 + pointerHeightValue);
    ctx.lineTo(cx - pointerWidthValue / 2, cy + bubbleHeight / 2);
    ctx.lineTo(cx - bubbleWidth / 2 + bubbleRadius, cy + bubbleHeight / 2);

    // 左侧线条
    ctx.quadraticCurveTo(
        cx - bubbleWidth / 2, cy + bubbleHeight / 2,
        cx - bubbleWidth / 2, cy + bubbleHeight / 2 - bubbleRadius
    );
    ctx.lineTo(cx - bubbleWidth / 2, cy - bubbleHeight / 2 + bubbleRadius);
    ctx.quadraticCurveTo(
        cx - bubbleWidth / 2, cy - bubbleHeight / 2,
        cx - bubbleWidth / 2 + bubbleRadius, cy - bubbleHeight / 2
    );

    ctx.closePath();
}

/**
 * 创建带有图标和文本的Sprite标签
 * @param options 配置选项
 * @returns 返回一个Three.js Sprite对象
 */
export async function _createIconLabelSprite(options: IconLabelStyle, map: Map, positions: Vector3): Promise<Sprite> {
    // 设置默认值
    const {
        text,
        iconUrl,
        fontSize = 30,
        iconSize = 60,
        fontFamily = 'Arial',
        padding = {},
        bgColor = 'rgba(0,0,0,0.0)',
        textColor = 'rgb(255,255,255)',
        strokeColor = 'rgb(0,0,0)',
        strokeWidth = fontSize / 9,
        iconScale = 0.8,
        canvasScale = 1,
        renderbg = true
    } = options;

    // 合并padding默认值
    const mergedPadding = {
        top: 0,
        right: 1,
        bottom: 0,
        left: 0,
        ...padding,
    };

    // 加载图标（如果有）
    let iconImage: HTMLImageElement | null = null;
    if (iconUrl) {
        iconImage = await loadImage(iconUrl);
    }

    // 创建Canvas
    const { canvas, width, height, center } = await createLabelCanvas({
        text,
        iconImage,
        fontSize,
        iconSize,
        fontFamily,
        padding: mergedPadding,
        bgColor,
        textColor,
        strokeColor,
        strokeWidth,
        iconScale,
        canvasScale,
        renderbg,
    }, map);

    // 创建Three.js纹理和Sprite
    const texture = new Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true, // 禁用深度测试
        depthWrite: true, //禁止写入深度缓冲区
        blending:NormalBlending, // 使用标准混合模式
    });

    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(width, height, 1);
    sprite.center.set(center[0], center[1]);
    if (positions) {
        sprite.position.copy(positions);
    }

    sprite.renderOrder = 999;
    return sprite;
}

/**
 * 辅助函数：创建Canvas标签
 */
async function createLabelCanvas(
    options: {
        text: string;
        iconImage: HTMLImageElement | null;
        fontSize: number;
        iconSize: number;
        fontFamily: string;
        padding: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        renderbg: boolean;
        bgColor: string;
        textColor: string;
        strokeColor: string;
        strokeWidth: number;
        iconScale: number;
        canvasScale: number;
    },
    map: Map
): Promise<CanvasResult> {
    return new Promise((resolve) => {
        const {
            text,
            iconImage,
            fontSize,
            iconSize,
            fontFamily,
            padding,
            bgColor,
            textColor,
            strokeColor,
            strokeWidth,
            iconScale,
            canvasScale,
            renderbg
        } = options;

        // 计算Canvas尺寸
        const textWidth = text.length * fontSize;
        const canvasWidth = padding.left + iconSize + textWidth + padding.right;
        const canvasHeight =
            Math.max(iconSize, fontSize) + padding.top + padding.bottom;

        // 创建Canvas

        const canvas = map._getCanvas(canvasWidth, canvasHeight, text);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        debugger
        // 绘制背景
        if (renderbg) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }


        // 绘制图标
        if (iconImage) {
            const iconX = padding.left + (iconSize * (1 - iconScale)) * 0.5;
            const iconY = padding.top + (iconSize * (1 - iconScale)) * 0.5;
            const iconWidth = iconSize * iconScale;
            const iconHeight = iconSize * iconScale;

            ctx.drawImage(iconImage, iconX, iconY, iconWidth, iconHeight);
        }

        // 设置文本样式
        ctx.font = `500 ${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'middle';
        ctx.imageSmoothingEnabled = false;

        // 文本位置
        const textX = padding.left + (iconImage ? iconSize + 2 : 0);
        const textY = canvasHeight / 2;

        // 绘制文本描边
        if (strokeWidth > 0) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = strokeColor;
            ctx.strokeText(text, textX, textY);
        }


        // 绘制文本
        ctx.fillStyle = textColor;
        ctx.fillText(text, textX, textY);

        resolve({
            canvas,
            width: canvasWidth / canvasScale,
            height: canvasHeight / canvasScale,
            center: [
                iconSize * 0.5 / canvasWidth,
                (1 - iconScale) * 0.5,
            ],
        });
    });
}

/**
 * 辅助函数：加载图片
 */
function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${url} ${e}`));
        img.src = url;
    });
}










