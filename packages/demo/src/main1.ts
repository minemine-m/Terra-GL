// import { Mesh } from "three";
import * as terra from "terra-gl";
// import * as dat from 'dat.gui';
// import Stats from 'three/addons/libs/stats.module.js';
// const stats = new Stats();
// document.body.appendChild(stats.dom);



const authkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoienpzdyIsImFpZCI6IjY3ZjMzNDg5NDIxYWE5MGU2MDE1ZTNiOCIsImNpZCI6IjVlOGZmMDg4MzRmNmFjMGQxNGUzMzBhMSIsImNvbXBhbnkiOnsiaWQiOiI2N2YzMzZjMDQyMWFhOTBlNjA0NGQ2NjQiLCJuYW1lIjoi6YOR5bee5biC5rC05Yqh5YWs5Y-4IiwiY29kZSI6bnVsbH0sImV4cCI6MTc3OTI2MzMwNCwiZ3JvdXAiOiI2N2YzMzZjMDQyMWFhOTBlNjA0NGQ2NjQiLCJpYXQiOjE3NDc3MjczMDQsImlwIjoiMTAuODAuMC4xMDIiLCJqd3RJZCI6IjY4MmMzM2M4NDIxYWE5MGU2MDQ1NTIyYiIsIm1vYmlsZSI6IiIsIm5hbWUiOiLpg5Hlt57msLTliqHnrqHnkIblkZgiLCJyb2xlcyI6WyI2N2YzM2I3MTQyMWFhOTBlNjAxNWU2YzEiXSwic24iOiIwMSIsInRva2VuZnJvbSI6InVuaXdhdGVyIiwidWlkIjoiNjdmMzNhYTU0MjFhYTkwZTYwNDRkN2EwIn0.gj3lBni0MLG7IE_QhqTcoEXtx3Qtfiqfo050cKznTVQ";

const tdttk = "baa4de006b9c36080686fb99885177a9";
const MAPBOXKEY = "pk.eyJ1IjoiY3Jpc2thIiwiYSI6ImNsOGZjZW5oMzAzMWozbm1sejgxZXBpMnUifQ.6Q2QsN4FXSPxO7XbNDvikw"
let map: any = null;


// 添加模块声明
declare global {
	interface Window {
		dat: any;
	}
}
// 初始化 dat.gui
const gui = new window.dat.GUI();
console.log(gui, 'gui-------------------');


function initMap(id: string, options: any) {
	map = new terra.Map(id, options);
	// 监听地图加载事件
	// map.on("loaded", (eventData: any) => {
	// 	console.log("地图初始化完成 --- 简单的事件", eventData);
	// });

	// 监听 playerJump 事件
	map.on('loaded', (eventData: any) => {
		console.log("地图初始化完成 --- 简单的事件", eventData);
	});

	// let layer = new terra.Layer({
	// 	visible: true,
	// });
}

function main() {

	initMap("#map", {
		// (86.95, 27.98
		center: [113.55175280557246, 34.793170730802366, 1000],
		viewer: {
			// 天空盒配置
			// skybox: {
			// 	path: "./image/skyboxall/bak1/",
			// 	files: ["right.jpg", "left.jpg", "top.jpg", "down.jpg", "back.jpg", "front.jpg"],
			// 	defaultColor: 0xffffff
			// },
			// skybox: {
			// 	path: "./image/skybox/",
			// 	files: ["px.png", "nx.png", "top.jpg", "top.jpg", "pz.png", "nz.png"],
			// 	defaultColor: 0xffffff
			// },
			// 图片顺序对着的夜空1（有山） -------
			skybox: {
				path: "./image/skyboxall/SkyBox8/",
				files: ["back.jpg", "front.jpg", "down.jpg", "top.jpg", "right.jpg", "left.jpg"],
				defaultColor: '#121E3A'
			},
			// 图片顺序对着的夜空2（星空） -------
			// skybox: {
			// 	path: "./image/skyboxall/skyBox1/",
			// 	files: [  "posx.jpg", // 原 px.png → +X 右
			// 		"negx.jpg", // 原 nx.png → -X 左
			// 		"posz.jpg", // 原 top.jpg → +Y 上（天空）
			// 		"negz.jpg", // 需另提供 -Y 下（地面）
			// 		"negy.jpg", // 原 pz.png → +Z 后
			// 		"posy.jpg"],  // 原 nz.png → -Z 前],
			// 	defaultColor: '#212B63'
			// },
			// skybox: {
			// 	path: "./image/skyboxall/yewan/",
			// 	files: ["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"],
			// 	defaultColor: '#2D3E5C'
			// },
		},
		// 地图配置
		meshmap: {
			// 切片数据源
			imgSource: [
				// new terra.TDTSource({
				// 	style: "img_w",
				// 	token: "baa4de006b9c36080686fb99885177a9",
				// 	url: `https://t1.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdttk}`
				// }),
				// new terra.TDTSource({
				// 	style: "cia_w",
				// 	token: "baa4de006b9c36080686fb99885177a9",
				// 	url: `https://t1.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdttk}`
				// }),
				new terra.MapBoxSource({
					token: MAPBOXKEY,
					dataType: "image",
					style: "mapbox.satellite",
				}),
				// https://api.mapbox.com/styles/v1/criska/cm2myr6qx001t01pi0sf7estf.html?title=view&access_token=pk.eyJ1IjoiY3Jpc2thIiwiYSI6ImNsOGZjZW5oMzAzMWozbm1sejgxZXBpMnUifQ.6Q2QsN4FXSPxO7XbNDvikw&zoomwheel=true&fresh=true#13.72/30.82036/120.85454/0/64
				new terra.WMTSSource({
					urlTemplate: `http://192.168.88.205:8085/geoserver/zzgis/gwc/service/wmts?layer=zzgis%3Ahdgs_pipe_bs&style=&tilematrixset=EPSG%3A3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG:3857:{z}&TileCol={x}&TileRow={y}&authkey=${authkey}`,
					isTMS: false // 非TMS
				})
			],
			// imgSource:new terra.ArcGisSource(),
			// 地形数据源
			// demSource: new terra.ArcGisDemSource(),

			minLevel: 1,
			maxLevel: 21,
		}
	});

	// mapLayerManage();
	// addFeature();
	addLineFeature();
	// addPointFeature();
	// addPolygon();
	// addWater();
	// addModelBuild();
	// loadgeojsonpolygon('/geojson/水系面.json', '#ccccc')
}


/**
 * 图层管理 相关功能
 */
function mapLayerManage() {
	// 生成和添加图层
	// let linelayer = new terra.LineLayer('test');
	// map.addLayer(linelayer);
	// let linelayer2 = new terra.LineLayer('test');
	// map.addLayer(linelayer2);

	// 清除所有图层
	// map.clearLayers();
	// console.log("清除所有图层后", map.getLayers());

}


function addFeature() {

	// 生成和添加图层
	let pointLayer = new terra.PointLayer('ponitlayer1');
	map.addLayer(pointLayer);

	// // // 生成和添加Feature
	// let feature = new terra.Maker({
	// 	geometry: {
	// 		"coordinates": [
	// 			113.54095, 34.794409,
	// 			100
	// 		],
	// 		"type": "Point"
	// 	},
	// 	// style: {
	// 	// 	type: 'icon-point',
	// 	// 	url: 'https://threejs.org/examples/textures/sprites/snowflake1.png',      // 图标路径
	// 	// 	size: [1000, 1000],            // 宽1米，高1.5米
	// 	// 	// color: 0xFF0000,           // 红色叠加
	// 	// 	rotation: Math.PI / 4,       // 45度旋转
	// 	// 	anchor: [0.5, 0.8],        // 锚点位置
	// 	// 	zIndex: 10                 // 显示层级

	// 	// }
	// 	style: {
	// 		type: 'basic-point',
	// 		color: '#FF0000',
	// 		size: 10,

	// 	}
	// 	// feature.setStyle({
	// 	// 	type: 'basic-point',
	// 	// 	color: '#0B31A0',
	// 	// 	size: 50
	// 	// })
	// }
	// )
	// feature.addTo(pointLayer);




	// // 连续的setStyle 测试

	// feature.setStyle({
	// 	type: 'basic-point',
	// 	color: '#23FF00',
	// 	size: 100
	// })
	// feature.setStyle({
	// 	type: 'icon-point',
	// 	url: 'https://threejs.org/examples/textures/sprite.png',      // 图标路径
	// 	size: [100, 100],            // 宽1米，高1.5米
	// 	color: '#FDFF00',           // 红色叠加
	// 	rotation: Math.PI / 4,       // 45度旋转
	// 	anchor: [0.5, 0.8],        // 锚点位置
	// 	sizeAttenuation: true
	// })

	// // feature.setStyle({
	// // 	type: 'basic-point',
	// // 	color: '#C600FF',
	// // 	size: 100
	// // })
	// console.log("当前的feature", feature);





	// console.log("所有Feature", pointLayer);

	// 生成和添加图层
	// let lineLayer = new terra.LineLayer('lineLayer1');
	// map.addLayer(lineLayer);

	// // 生成和添加Feature
	// let featureline = new terra.LineString({
	// 	geometry: {
	// 		"coordinates": [
	// 			[
	// 				113.54490494842486,
	// 				34.776172475236905,
	// 				10
	// 			],
	// 			[
	// 				113.5999700431521,
	// 				34.70990474101569,
	// 				10
	// 			],
	// 			[
	// 				113.62984802389565,
	// 				34.74896792712262,
	// 				10
	// 			],
	// 			[
	// 				113.59179167751267,
	// 				34.773210042478624,
	// 				10
	// 			],
	// 			[
	// 				113.59177525445273,
	// 				34.746273063651984,
	// 				10
	// 			],
	// 			[
	// 				113.5803073852735,
	// 				34.7562388902592,
	// 				10
	// 			],
	// 			[
	// 				113.56949991141386,
	// 				34.79206600253366,
	// 				10
	// 			],
	// 			[
	// 				113.5983728355074,
	// 				34.80716079124889,
	// 				10
	// 			],
	// 			[
	// 				113.63970377324813,
	// 				34.78642204184915,
	// 				10
	// 			],
	// 			[
	// 				113.65511084226472,
	// 				34.7543578148407,
	// 				10
	// 			],
	// 			[
	// 				113.66133796718009,
	// 				34.729293625912575,
	// 				10
	// 			],
	// 			[
	// 				113.63179558164268,
	// 				34.70827614344314,
	// 				10
	// 			],
	// 			[
	// 				113.5655364054196,
	// 				34.6926862467991,
	// 				10
	// 			],
	// 			[
	// 				113.51540857043028,
	// 				34.72904006754857,
	// 				10
	// 			],
	// 			[
	// 				113.52654634451454,
	// 				34.7497750887386,
	// 				10
	// 			],
	// 			[
	// 				113.52621674445072,
	// 				34.76782282861893,
	// 				10
	// 			],
	// 			[
	// 				113.50687489088995,
	// 				34.7742846000187,
	// 				10
	// 			],
	// 			[
	// 				113.53572453433014,
	// 				34.768360802862404,
	// 				10
	// 			],
	// 			[
	// 				113.54981783817084,
	// 				34.74142586995447,
	// 				10
	// 			],
	// 			[
	// 				113.54981771688722,
	// 				34.72876657118644,
	// 				10
	// 			]
	// 		],
	// 		"type": "LineString"
	// 	},
	// 	style: {
	// 		type: 'basic-line',
	// 		color: '#0B31A0',
	// 		width: 10,
	// 		// dashArray: [10, 10]
	// 	}

	// })

	// featureline.addTo(lineLayer);

	// featureline.setStyle({
	// 	type: 'basic-line',
	// 	color: '#FDFF00',
	// 	width: 10,
	// })

	let featuremodel = new terra.Model({
		geometry: {
			"coordinates": [
				113.55175280557246, 34.793170730802366,
				100
			],
			"type": "Point"
		},
		style: {
			type: 'fbx',
			url: '/model/shenshui.FBX',
			scale: {
				x: 5,
				y: 5,
				z: 5
			},
			shadows: {
				cast: true,
				receive: true
			},
			// dracoOptions: {
			// 	enable: true,
			// 	decoderPath: '/draco/'
			// }
		}
	})


	// let featuremodel1 = new terra.Model({
	// 	geometry: {
	// 		"coordinates": [
	// 			113.54095, 34.794409,
	// 			0.1
	// 		],
	// 		"type": "Point"
	// 	},
	// 	style: {
	// 		type: 'gltf',
	// 		url: '/model/RobotExpressive.glb',
	// 		scale: {
	// 			x: 150,
	// 			y: 150,
	// 			z: 150
	// 		},
	// 		shadows: {
	// 			cast: true,
	// 			receive: true
	// 		},
	// 		dracoOptions: {
	// 			enable: true,
	// 			decoderPath: '/draco/'
	// 		}
	// 	}
	// })


	// featuremodel1.addTo(pointLayer);


	// featuremodel1.setShadows({
	// 	cast: true,
	// 	receive: true
	// }); // 开启阴影

	// 设置自发光
	// featuremodel.setEmission(true, 0.5, '#00ff00'); // 启用，强度1.5，绿色
	// console.log("当前的featuremodel", featuremodel);

	// 关闭阴影
	featuremodel.setShadows({
		cast: true,
		receive: true
	}); // 开启阴影


	// featuremodel.translateX(200)


	featuremodel.addTo(pointLayer);

	featuremodel.playAnimation({
		name: 'Running',
		loop: true,
		speed: 1.5,
		fadeInDuration: 0.5,
		fadeOutDuration: 0.3
	});

	setTimeout(() => {
		featuremodel.playAnimation({
			name: 'Running',
			loop: true,
			speed: 1.5,
			fadeInDuration: 0.5,
			fadeOutDuration: 0.3
		});

	}, 2000); // 5秒后禁用自发光


	featuremodel.setShadows(true, true); // 关闭阴影




	// 获取所有图层
	let layers = map.getLayers();
	console.log("所有图层", layers);
	// 缺少图层加载完成事件,暂时用setTimeout 模拟
	// setTimeout(() => {
	// 	// todo 加载完成事件 缺失
	// 	// 获取指定 ID 的图层
	// 	// let layer = map.getLayerById('ponitlayer1');
	// 	// 设置图层透明度
	// 	// layer.setOpacity(0.5);
	// 	// console.log("layer ------- 基本功能测试");
	// 	// console.log("指定 ID 的图层:", layer);
	// 	// console.log("获取透明度:", layer.getOpacity());
	// 	// console.log("获取图层ID:", layer.getId());
	// 	// console.log("获取图层的所有features:", layer.getFeatures());
	// 	// console.log("获取图层的features的个数:", layer.getCount());
	// 	// 隐藏和显示图层
	// 	// setTimeout(() => {
	// 	// 	layer.hide();
	// 	// 	setTimeout(() => {
	// 	// 		layer.show();
	// 	// 		setTimeout(() => {
	// 	// 			// console.log(featuremodel.parent === layer); // 必须是 true
	// 	// 			// console.log(featuremodel.getLayer(),'featuremodel.getLayer()');
	// 	// 			// featuremodel.removeFromParent();
	// 	// 			// layer.remove(featuremodel)
	// 	// 			layer.removeFeature(featuremodel)
	// 	// 		}, 2000);
	// 	// 	}, 2000);
	// 	// }, 2000);


	// }, 1000); // 5秒后禁用自发光
}

function addLineFeature() {


	loadgeojsonpipe('/geojson/public.gsgx_pipe.json', '#12CEE9');
	// loadgeojsonpipe('/geojson/public.ysgx_pipe.json','#12E91F');

}

function addPointFeature() {
	// // 生成和添加图层
	// let lineLayer = new terra.LineLayer('pipeline');
	// map.addLayer(lineLayer);
	// // 生成和添加Feature
	// let featureline = new terra.LineString({
	// 	geometry: {
	// 		"coordinates": [
	// 			[
	// 				113.54490494842486,
	// 				34.776172475236905,
	// 				10
	// 			],
	// 			[
	// 				113.5999700431521,
	// 				34.70990474101569,
	// 				10
	// 			],
	// 			[
	// 				113.62984802389565,
	// 				34.74896792712262,
	// 				10
	// 			],
	// 			[
	// 				113.59179167751267,
	// 				34.773210042478624,
	// 				10
	// 			],
	// 			[
	// 				113.59177525445273,
	// 				34.746273063651984,
	// 				10
	// 			],
	// 			[
	// 				113.5803073852735,
	// 				34.7562388902592,
	// 				10
	// 			],
	// 			[
	// 				113.56949991141386,
	// 				34.79206600253366,
	// 				10
	// 			],
	// 			[
	// 				113.5983728355074,
	// 				34.80716079124889,
	// 				10
	// 			],
	// 			[
	// 				113.63970377324813,
	// 				34.78642204184915,
	// 				10
	// 			],
	// 			[
	// 				113.65511084226472,
	// 				34.7543578148407,
	// 				10
	// 			],
	// 			[
	// 				113.66133796718009,
	// 				34.729293625912575,
	// 				10
	// 			],
	// 			[
	// 				113.63179558164268,
	// 				34.70827614344314,
	// 				10
	// 			],
	// 			[
	// 				113.5655364054196,
	// 				34.6926862467991,
	// 				10
	// 			],
	// 			[
	// 				113.51540857043028,
	// 				34.72904006754857,
	// 				10
	// 			],
	// 			[
	// 				113.52654634451454,
	// 				34.7497750887386,
	// 				10
	// 			],
	// 			[
	// 				113.52621674445072,
	// 				34.76782282861893,
	// 				10
	// 			],
	// 			[
	// 				113.50687489088995,
	// 				34.7742846000187,
	// 				10
	// 			],
	// 			[
	// 				113.53572453433014,
	// 				34.768360802862404,
	// 				10
	// 			],
	// 			[
	// 				113.54981783817084,
	// 				34.74142586995447,
	// 				10
	// 			],
	// 			[
	// 				113.54981771688722,
	// 				34.72876657118644,
	// 				10
	// 			]
	// 		],
	// 		"type": "LineString"
	// 	},
	// 	style: {
	// 		type: 'basic-line',
	// 		color: '#0B31A0',
	// 		width: 10,
	// 		// dashArray: [10, 10]
	// 	}

	// })

	// let pipeline = new terra.MultiLineString({
	// 	"geometry" : {
	// 		"type" : "MultiLineString",
	// 		"coordinates" : [
	// 			[
	// 				[ 113.5505121, 34.8025465 ],
	// 				[ 112.5502125, 34.8025465 ]
	// 			]
	// 		]
	// 	},
	// 	style: {
	// 		type: 'basic-line',
	// 		color: '#0B31A0',
	// 		width: 100,
	// 		// dashArray: [10, 10]
	// 	}
	// })

	// featureline.addTo(lineLayer);
	// pipeline.addTo(lineLayer);

	// featureline.setStyle({
	// 	type: 'basic-line',
	// 	color: '#FDFF00',
	// 	width: 10,
	// })


	// 加载geojson的线
	// loadgeojsonpipe('/geojson/public.gsgx_pipe.json', '#12E9DA');

	loadgeojsonpoint('/geojson/public.gsss_fireplug.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_fireplug.png')

	loadgeojsonpoint('/geojson/public.gsss_valve.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_valve.png')

	// loadgeojsonpoint('/geojson/public.gsss_valve.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_valve.png')


	loadgeojsonpoint('/geojson/public.gsss_evalve.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_evalve.png')

	loadgeojsonpoint('/geojson/public.gsss_flowmeter.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_flowmeter.png')

	loadgeojsonpoint('/geojson/public.gsss_mainmeter.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_mainmeter.png')


	loadgeojsonpoint('/geojson/public.gsss_manhole.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_manhole.png')


	loadgeojsonpoint('/geojson/public.gsss_node.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_node.png')

	loadgeojsonpoint('/geojson/public.gsss_rvalve.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_rvalve.png')

	loadgeojsonpoint('/geojson/public.gsss_svalve.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_svalve.png')

	loadgeojsonpoint('/geojson/public.gsss_waterp.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_waterp.png')


	loadgeojsonpoint('/geojson/public.gsss_wmeter.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_wmeter.png')



	// loadgeojsonpoint('/geojson/public.gsss_wmeter.json', 'http://192.168.88.250:9001/geoserver/rest/resource/styles/gsss_wmeter.png')

	// loadgeojsonpipe('/geojson/public.wsgx_pipe.json','#E96112');
	// loadgeojsonpipe('/geojson/public.ysgx_pipe.json','#12E91F');

}

function loadgeojsonpipe(url: any, color: any) {
	let lineLayer = new terra.LineLayer('pipeline' + Math.random());
	map.addLayer(lineLayer);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			data.features.forEach((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {

					feature.geometry.coordinates = feature.geometry.coordinates.map(
						(coordArray: any) => {
							if (typeof coordArray[0] === 'number') {
								return [...coordArray, 1];
							}
							return coordArray.map((coord: any) => {
								if (typeof coord[0] === 'number') {
									return [...coord, 1];
								}
								return coord.map((c: any) => [...c, 1]);
							});
						}
					);
				}
				console.log(feature, 'modified geojson data ------------');

				let pipeline = new terra.MultiLineString({
					"geometry": feature.geometry,
					style: {
						type: 'basic-line',
						color: color,
						width: 5,
						// dashArray: [10, 10]
					}
				})

				pipeline.addTo(lineLayer);

			});
			return data;
		})
		.catch(err => {
			console.error('加载geojson失败:', err);
		});


		// setTimeout(()=>{
		// 	lineLayer.simplerender();
		// },5000)
	
}


function loadgeojsonpoint(url: any, color: any) {
	let pointLayer = new terra.PointLayer('pointlayer' + Math.random());
	map.addLayer(pointLayer);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			data.features.forEach((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {

					feature.geometry.coordinates = [...feature.geometry.coordinates, 1];
				}
				console.log(feature, 'modified geojson data ------------');

				let featurepoint = new terra.Maker({
					geometry: feature.geometry,
					style: {
						type: 'icon-point',
						url: color,      // 图标路径
						size: [0.02, 0.02],            // 宽1米，高1.5米
						// color: 0xFF0000,           // 红色叠加
						rotation: Math.PI / 4,       // 45度旋转
						anchor: [0, 0],        // 锚点位置
						zIndex: 10,               // 显示层级
						sizeAttenuation: false

					}
					// style: {
					// 	type: 'basic-point',
					// 	color: '#FF0000',
					// 	size: 10,

					// }
					// feature.setStyle({
					// 	type: 'basic-point',
					// 	color: '#0B31A0',
					// 	size: 50
					// })
				})

				featurepoint.addTo(pointLayer);

			});
			return data;
		})
		.catch(err => {
			console.error('加载geojson失败:', err);
		});
}

function addPolygon() {
	// addLineFeature();
	let geometry: any = {
		"coordinates": [
			[
				[
					113.60764654191092,
					34.75865733314838,
					1
				],
				[
					113.60764654191092,
					34.73324726668184,
					1
				],
				[
					113.64131533605462,
					34.73324726668184,
					1
				],
				[
					113.64131533605462,
					34.75865733314838,
					1
				],
				[
					113.60764654191092,
					34.75865733314838,
					1
				]
			]
		],
		"type": "Polygon"
	}
	// 1. 创建多边形
	// const polygon = new terra.Polygon({
	// 	geometry: geometry,
	// 	style: {
	// 		type: 'basic-polygon',
	// 		color: '#FF44D5',
	// 		opacity: 0.5,
	// 		side:'double'
	// 	}
	// });

	let polygonLayer = new terra.PolygonLayer('polygonlayer' + Math.random());
	console.log(polygonLayer, 'polygonLayer');

	map.addLayer(polygonLayer);
	// polygon.addTo(polygonLayer);


	// 创建拉伸多边形
	// 1. 创建多边形
	const expolygon = new terra.Polygon({
		geometry: geometry,
		style: {
			type: 'extrude-polygon',
			color: '#FF44D5',
			opacity: 0.8,
			side: 'double',
			extrude: {
				height: 1000,          // 拉伸高度
				bevelEnabled: true  // 启用边缘斜角
			},

		}
	});

	expolygon.addTo(polygonLayer);



}

function addWater() {
	// addLineFeature();
	let geometry: any = {
		"coordinates": [
			[
				[
					113.60764654191092,
					34.75865733314838,
					1
				],
				[
					113.60764654191092,
					34.73324726668184,
					1
				],
				[
					113.64131533605462,
					34.73324726668184,
					1
				],
				[
					113.64131533605462,
					34.75865733314838,
					1
				],
				[
					113.60764654191092,
					34.75865733314838,
					1
				]
			]
		],
		"type": "Polygon"
	}

	let polygonLayer = new terra.PolygonLayer('polygonlayer' + Math.random());
	console.log(polygonLayer, 'polygonLayer');

	map.addLayer(polygonLayer);
	// polygon.addTo(polygonLayer);


	// 创建拉伸多边形
	// 1. 创建多边形
	const water = new terra.Polygon({
		geometry: geometry,
		style: {
			type: 'water',
			normalMap: './img/normalMap.jpg',


		}
	});

	water.addTo(polygonLayer);



}



// 加载建筑
function addModelBuild() {
	let modelLayer = new terra.PointLayer('modelLayer');
	map.addLayer(modelLayer);
	// let featuremodelsh = new terra.Model({
	// 	geometry: {
	// 		"coordinates": [
	// 			121.499718, 31.239703,
	// 			-20
	// 		],
	// 		"type": "Point"
	// 	},
	// 	style: {
	// 		type: 'fbx',
	// 		url: '/model/shanghai.FBX',
	// 		scale: {
	// 			x: 1,
	// 			y: 1,
	// 			z: 1,
	// 		},
	// 		shadows: {
	// 			cast: true,
	// 			receive: true
	// 		},
	// 		dracoOptions: {
	// 			enable: true,
	// 			decoderPath: '/draco/'
	// 		}
	// 		// dracoOptions: {
	// 		// 	enable: true,
	// 		// 	decoderPath: '/draco/'
	// 		// }
	// 	},
	// 	iscity: true
	// })
	// featuremodelsh.addTo(modelLayer);
	// 郑州glb 暂时注释
	// console.log(featuremodel, 'featuremodel');
	// setTimeout(() => {
	// 	featuremodel.traverse(child => {
	// 		if (child instanceof Mesh && child.material) {
	// 			child.material.color.setStyle('#E61818')
	// 		}
	// 	});
	// },1000)


	// 处理模型材质
	// material.color.setStyle('#040912')


	let featuremodel1 = new terra.Model({
		geometry: {
			"coordinates": [
				113.55175280557246, 34.793170730802366,
				100
			],
			"type": "Point"
		},
		iscity: true,
		style: {
			type: 'fbx',
			url: '/model/04.FBX',
			scale: {
				x: 0.01,
				y: 0.01,
				z: 0.01
			},
			shadows: {
				cast: true,
				receive: true
			},
			dracoOptions: {
				enable: true,
				decoderPath: '/draco/'
			}
		}
	})

	featuremodel1.addTo(modelLayer);



	// 初始化位置
	// setTimeout(() => {
	// 	// 获取目标模型
	// 	const targetModel = featuremodelsh.children[0];

	// 	// 保存初始状态
	// 	const initialState = {
	// 		position: targetModel.position.clone(),
	// 		scale: targetModel.scale.clone(),
	// 		rotation: targetModel.rotation.clone()
	// 	};
	// 	// 控制对象
	// 	const modelControls1 = {
	// 		// 平移控制
	// 		offsetX: -2612.5,
	// 		offsetY: 0,
	// 		offsetZ: -240.1,

	// 		// 缩放控制
	// 		scaleX: 1,
	// 		scaleY: 1,
	// 		scaleZ: 1,
	// 		uniformScale: 0.6,

	// 		// 旋转控制（使用弧度）
	// 		rotateX: 0,
	// 		rotateY: 1.95,
	// 		rotateZ: 0,

	// 		// 更新所有变换
	// 		updateModel: function () {
	// 			// 应用平移
	// 			targetModel.position.x = initialState.position.x + this.offsetX;
	// 			targetModel.position.y = initialState.position.y + this.offsetY;
	// 			targetModel.position.z = initialState.position.z + this.offsetZ;

	// 			// 应用缩放
	// 			if (this.uniformScale !== 1) {
	// 				// 统一缩放模式
	// 				targetModel.scale.x = initialState.scale.x * this.uniformScale;
	// 				targetModel.scale.y = initialState.scale.y * this.uniformScale;
	// 				targetModel.scale.z = initialState.scale.z * this.uniformScale;
	// 				// 同步缩放控制值
	// 				this.scaleX = this.scaleY = this.scaleZ = this.uniformScale;
	// 			} else {
	// 				// 独立轴缩放模式
	// 				targetModel.scale.x = initialState.scale.x * this.scaleX;
	// 				targetModel.scale.y = initialState.scale.y * this.scaleY;
	// 				targetModel.scale.z = initialState.scale.z * this.scaleZ;
	// 			}

	// 			// 应用旋转（基于初始旋转状态）
	// 			targetModel.rotation.x = initialState.rotation.x + this.rotateX;
	// 			targetModel.rotation.y = initialState.rotation.y + this.rotateY;
	// 			targetModel.rotation.z = initialState.rotation.z + this.rotateZ;
	// 		},

	// 		// 重置所有变换
	// 		resetAll: function () {
	// 			this.offsetX = this.offsetY = this.offsetZ = 0;
	// 			this.scaleX = this.scaleY = this.scaleZ = this.uniformScale = 1;
	// 			this.rotateX = this.rotateY = this.rotateZ = 0;
	// 			this.updateModel();
	// 		},

	// 		// 将弧度转换为角度显示（可选）
	// 		// getRotateDegrees: function () {
	// 		// 	return {
	// 		// 		x: THREE.MathUtils.radToDeg(this.rotateX),
	// 		// 		y: THREE.MathUtils.radToDeg(this.rotateY),
	// 		// 		z: THREE.MathUtils.radToDeg(this.rotateZ)
	// 		// 	};
	// 		// }
	// 	};

	// 	modelControls1.updateModel();
	// }, 200)




	// 生成控制器
	// setTimeout(() => {
	// 	// 获取目标模型
	// 	const targetModel = featuremodelsh.children[0];

	// 	// 保存初始状态
	// 	const initialState = {
	// 		position: targetModel.position.clone(),
	// 		scale: targetModel.scale.clone(),
	// 		rotation: targetModel.rotation.clone()
	// 	};


	// 	// // 设置真实的位置和缩放以及角度
	// 	// targetModel.position.x = initialState.position.x + modelControls1.offsetX;
	// 	// targetModel.position.y = initialState.position.y + modelControls1.offsetY;
	// 	// targetModel.position.z = initialState.position.z + modelControls1.offsetZ;



	// 	// 控制对象
	// 	const modelControls = {
	// 		// 平移控制
	// 		offsetX: -2602.5,
	// 		offsetY: 0,
	// 		offsetZ: -235.1,

	// 		// 缩放控制
	// 		scaleX: 1,
	// 		scaleY: 1,
	// 		scaleZ: 1,
	// 		uniformScale: 0.6,

	// 		// 旋转控制（使用弧度）
	// 		rotateX: 0,
	// 		rotateY: 1.95,
	// 		rotateZ: 0,

	// 		// 更新所有变换
	// 		updateModel: function () {
	// 			// 应用平移
	// 			targetModel.position.x = initialState.position.x + this.offsetX;
	// 			targetModel.position.y = initialState.position.y + this.offsetY;
	// 			targetModel.position.z = initialState.position.z + this.offsetZ;

	// 			// 应用缩放
	// 			if (this.uniformScale !== 1) {
	// 				// 统一缩放模式
	// 				targetModel.scale.x = initialState.scale.x * this.uniformScale;
	// 				targetModel.scale.y = initialState.scale.y * this.uniformScale;
	// 				targetModel.scale.z = initialState.scale.z * this.uniformScale;
	// 				// 同步缩放控制值
	// 				this.scaleX = this.scaleY = this.scaleZ = this.uniformScale;
	// 			} else {
	// 				// 独立轴缩放模式
	// 				targetModel.scale.x = initialState.scale.x * this.scaleX;
	// 				targetModel.scale.y = initialState.scale.y * this.scaleY;
	// 				targetModel.scale.z = initialState.scale.z * this.scaleZ;
	// 			}

	// 			// 应用旋转（基于初始旋转状态）
	// 			targetModel.rotation.x = initialState.rotation.x + this.rotateX;
	// 			targetModel.rotation.y = initialState.rotation.y + this.rotateY;
	// 			targetModel.rotation.z = initialState.rotation.z + this.rotateZ;
	// 		},

	// 		// 重置所有变换
	// 		resetAll: function () {
	// 			this.offsetX = this.offsetY = this.offsetZ = 0;
	// 			this.scaleX = this.scaleY = this.scaleZ = this.uniformScale = 1;
	// 			this.rotateX = this.rotateY = this.rotateZ = 0;
	// 			this.updateModel();
	// 		},

	// 		// 将弧度转换为角度显示（可选）
	// 		// getRotateDegrees: function () {
	// 		// 	return {
	// 		// 		x: THREE.MathUtils.radToDeg(this.rotateX),
	// 		// 		y: THREE.MathUtils.radToDeg(this.rotateY),
	// 		// 		z: THREE.MathUtils.radToDeg(this.rotateZ)
	// 		// 	};
	// 		// }
	// 	};

	// 	// 创建GUI
	// 	// const gui = new dat.GUI();

	// 	// 1. 平移控制文件夹
	// 	const positionFolder = gui.addFolder('位置控制');
	// 	positionFolder.add(modelControls, 'offsetX', -10000, 10000, 0.1).name('X轴偏移').onChange(() => modelControls.updateModel());
	// 	positionFolder.add(modelControls, 'offsetY', -10000, 10000, 0.1).name('Y轴偏移').onChange(() => modelControls.updateModel());
	// 	positionFolder.add(modelControls, 'offsetZ', -10000, 10000, 0.1).name('Z轴偏移').onChange(() => modelControls.updateModel());

	// 	// 2. 缩放控制文件夹
	// 	const scaleFolder = gui.addFolder('缩放控制');
	// 	scaleFolder.add(modelControls, 'uniformScale', 0.1, 3, 0.1).name('统一缩放').onChange((value) => {
	// 		modelControls.uniformScale = value;
	// 		modelControls.updateModel();
	// 	});
	// 	scaleFolder.add(modelControls, 'scaleX', 0.1, 3, 0.1).name('X轴缩放').onChange((value) => {
	// 		modelControls.uniformScale = 1;
	// 		modelControls.scaleX = value;
	// 		modelControls.updateModel();
	// 	});
	// 	scaleFolder.add(modelControls, 'scaleY', 0.1, 3, 0.1).name('Y轴缩放').onChange((value) => {
	// 		modelControls.uniformScale = 1;
	// 		modelControls.scaleY = value;
	// 		modelControls.updateModel();
	// 	});
	// 	scaleFolder.add(modelControls, 'scaleZ', 0.1, 3, 0.1).name('Z轴缩放').onChange((value) => {
	// 		modelControls.uniformScale = 1;
	// 		modelControls.scaleZ = value;
	// 		modelControls.updateModel();
	// 	});

	// 	// 3. 旋转控制文件夹（使用弧度）
	// 	const rotationFolder = gui.addFolder('旋转控制');
	// 	rotationFolder.add(modelControls, 'rotateX', -Math.PI, Math.PI, 0.01).name('X轴旋转').onChange(() => modelControls.updateModel());
	// 	rotationFolder.add(modelControls, 'rotateY', -Math.PI, Math.PI, 0.01).name('Y轴旋转').onChange(() => modelControls.updateModel());
	// 	rotationFolder.add(modelControls, 'rotateZ', -Math.PI, Math.PI, 0.01).name('Z轴旋转').onChange(() => modelControls.updateModel());

	// 	// 添加角度显示（可选）
	// 	rotationFolder.add({
	// 		getDegrees: () => {
	// 			// const deg = modelControls.getRotateDegrees();
	// 			// return `X: ${deg.x.toFixed(1)}°, Y: ${deg.y.toFixed(1)}°, Z: ${deg.z.toFixed(1)}°`;
	// 		}
	// 	}, 'getDegrees').name('当前角度');

	// 	// 4. 重置按钮
	// 	gui.add(modelControls, 'resetAll').name('重置所有变换');

	// 	// 默认打开所有文件夹
	// 	positionFolder.open();
	// 	scaleFolder.open();
	// 	rotationFolder.open();

	// 	// 初始更新
	// 	modelControls.updateModel();
	// }, 1000);




}

// 加载geojson水系面

function loadgeojsonpolygon(url: any, color: any) {
	let waterpolygonLayer = new terra.PolygonLayer('waterpolygon');
	map.addLayer(waterpolygonLayer);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			data.features.forEach((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {
					const geometry = feature.geometry;

					// 计算当前要素的高度值（支持函数动态获取）
					const currentZ = 1;

					// 处理Polygon类型
					if (geometry.type === 'Polygon') {
						// 显式指定 ring 的类型为 any[]，解决隐式 any 类型问题
						geometry.coordinates = geometry.coordinates.map((ring: any[]) =>
							// 显式指定 coord 的类型为数组，元素类型为 any
							ring.map((coord: any[]) => [coord[0], coord[1], currentZ])
						);
					}
				}
				// console.log(feature, 'modified geojson data ------------');

				// let pipeline = new terra.MultiLineString({
				// 	"geometry": feature.geometry,
				// 	style: {
				// 		type: 'basic-line',
				// 		color: color,
				// 		width: 5,
				// 		// dashArray: [10, 10]
				// 	}
				// })

				// pipeline.addTo(lineLayer);

				const water = new terra.Polygon({
					geometry: feature.geometry,
					style: {
						type: 'water',
						normalMap: './image/waternormals.jpg',
						color: '#0081FF',         // 水面颜色
						sunColor: '#FFB905', // 阳光颜色
						opacity: 1             // 透明度


					}
				});

				water.addTo(waterpolygonLayer);


				// const polygon = new terra.Polygon({
				// 	geometry: feature.geometry,
				// 	style: {
				// 		type: 'basic-polygon',
				// 		color: '#FF44D5',
				// 		opacity: 0.5,
				// 		side: 'double'
				// 	}
				// });

				// polygon.addTo(waterpolygonLayer);






			});
			return data;
		})
		.catch(err => {
			console.error('加载geojson失败:', err);
		});
}

main();


