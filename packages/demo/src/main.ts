
import * as terra from "terra-gl";
// import * as vanilla from "@pmndrs/vanilla";
// import * as THREE from "three";

import { PrecomputedTexturesLoader } from '@takram/three-atmosphere'

const authkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoienpzdyIsImFpZCI6IjY3ZjMzNDg5NDIxYWE5MGU2MDE1ZTNiOCIsImNpZCI6IjVlOGZmMDg4MzRmNmFjMGQxNGUzMzBhMSIsImNvbXBhbnkiOnsiaWQiOiI2N2YzMzZjMDQyMWFhOTBlNjA0NGQ2NjQiLCJuYW1lIjoi6YOR5bee5biC5rC05Yqh5YWs5Y-4IiwiY29kZSI6bnVsbH0sImV4cCI6MTc3OTI2MzMwNCwiZ3JvdXAiOiI2N2YzMzZjMDQyMWFhOTBlNjA0NGQ2NjQiLCJpYXQiOjE3NDc3MjczMDQsImlwIjoiMTAuODAuMC4xMDIiLCJqd3RJZCI6IjY4MmMzM2M4NDIxYWE5MGU2MDQ1NTIyYiIsIm1vYmlsZSI6IiIsIm5hbWUiOiLpg5Hlt57msLTliqHnrqHnkIblkZgiLCJyb2xlcyI6WyI2N2YzM2I3MTQyMWFhOTBlNjAxNWU2YzEiXSwic24iOiIwMSIsInRva2VuZnJvbSI6InVuaXdhdGVyIiwidWlkIjoiNjdmMzNhYTU0MjFhYTkwZTYwNDRkN2EwIn0.gj3lBni0MLG7IE_QhqTcoEXtx3Qtfiqfo050cKznTVQ";

const tdttk = "baa4de006b9c36080686fb99885177a9";
const MAPBOXKEY = "pk.eyJ1IjoiY3Jpc2thIiwiYSI6ImNsOGZjZW5oMzAzMWozbm1sejgxZXBpMnUifQ.6Q2QsN4FXSPxO7XbNDvikw"
let map: any = null;



declare global {
	interface Window {
		dat: any;
	}
}
// 初始化 dat.gui
// const gui = new window.dat.GUI();
// console.log(gui, 'gui-------------------');


// 


function initMap(id: string, options: any) {
	map = new terra.Map(id, options);
	// 监听地图加载事件
	// map.on("loaded", (eventData: any) => {
	// 	console.log("地图初始化完成 --- 简单的事件", eventData);
	// });

	// function mousermovefun(eventData: any) {
	// 	console.log("鼠标移动事件", eventData);
	// }
	// // // 监听 playerJump 事件
	// // map.on('loaded', mousermovefun);

	// map.on('mousemove', mousermovefun);

	// setTimeout(() => {
	// 	alert('移除监听');
	// 	map.off('mousemove', mousermovefun);
	// }, 20000);


	// map.on('pointermove', (evt: any) => {
	// 	console.log('收到 DOM 事件2222:', evt);
	// });


	// let layer = new terra.Layer({
	// 	visible: true,
	// });
}

function main() {


	initMap("#map", {
		// (86.95, 27.98
		center: [113.55175280557246, 34.793170730802366, 1000],
		viewer: {
			antialias: true,
			// 图片顺序对着的夜空1（有山） -------
			skybox: {
				// path: "./image/skyboxall/SkyBox8/",
				// files: ["back.jpg", "front.jpg", "down.jpg", "top.jpg", "right.jpg", "left.jpg"],
				// defaultColor: '#121E3A'

				hdr: './image/hdr/宇宙4K.hdr',
				hdrExposure: 1,
				defaultColor: '#010206'
			},

			cloudsparams: {
				enabled: true,
				texture: './image/cloud.png'
			}
		},
		//
		meshmap: {
			// 切片数据源
			imgSource: [
				// new terra.TDTSource({
				// 	style: "img_w",
				// 	token: "baa4de006b9c36080686fb99885177a9",
				// 	// url: `https://t1.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdttk}`
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
				// new terra.WMTSSource({
				// 	urlTemplate: `http://192.168.88.205:8085/geoserver/zzgis/gwc/service/wmts?layer=zzgis%3Ahdgs_pipe_bs&style=&tilematrixset=EPSG%3A3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG:3857:{z}&TileCol={x}&TileRow={y}&authkey=${authkey}`,
				// 	isTMS: false // 非TMS
				// })
			],
			// imgSource:new terra.ArcGisSource(),
			// // 地形数据源
			// demSource: new terra.ArcGisDemSource(),

			minLevel: 1,
			maxLevel: 21,
		}
	});

	addline();
	addModelBuild();
	loadgeojsonpolygon('/geojson/水系.json', '#ccccc');
	addCloud();
	// loadEqu();
	// console.log(vanilla, 'vanilla-------------------');
	// setTimeout(() => {
	loadgeojsonLabel('/geojson/public.gsss_fireplug.json', 'labellayer')
	// }, 2000);

}



// 测试大批量管线的性能优化
function addline() {

	loadgeojsonpipe('/geojson/public.gsgx_pipe.json', '#0068F8');
	loadgeojsonpipe('/geojson/public.wsgx_pipe.json', '#f85700');
	// loadgeojsonpipe('/geojson/public.ysgx_pipe.json', '#057826');

}


function loadEqu() {

	let points = [
		"public.gsbz_pumpstation.json",
		"public.gssc_wfactory.json",
		"public.gssc_evalve.json",
		"public.gssc_fireplug.json",
		"public.gsss_flowmeter.json",
		"public.gsss_mainmeter.json",
		"public.gsss_manhole.json",
		// "public.gsss_node.json",
		"public.gsss_riser.json",
		"public.gsss_valve.json",
		"public.gsss_waterp.json",
		"public.gsss_vmeter.json",
		"public.wsszb_pumpstation.json",
		"public.wssc_sewagefarm.json",
		"public.wsss_comb.json",
		"public.wsss_discharger.json",
		"public.wsss_infall.json",
		// "public.wsss_node.json",
		"public.wsss_outfall.json",
		"public.wsss_prepro.json",
		"public.wsss_valve.json",
		"public.wsss_well.json",
		"public.ysbz_pumpstation.json",
		"public.ysqx_pipe.json",
		"public.ysss_comb.json",
		"public.ysss_infall.json",
		// "public.ysss_node.json",
		"public.ysss_outfall.json",
		"public.ysss_valve.json",
		"public.ysss_well.json"
	]

	for (let i = 0; i < points.length; i++) {
		const element = points[i];
		loadgeojsonpoint('/geojson/' + element, '/image/point/fxd.png', element)
	}



	// loadgeojsonpoint('/geojson/public.gsss_fireplug.json', '/image/point/供水设施_消防栓.png');
	// loadgeojsonpoint('/geojson/public.gsss_fireplug.json', '/image/point/供水设施_消防栓.png');
}




// 加载建筑
function addModelBuild() {
	let modelLayer = new terra.PointLayer('modelLayer');
	map.addLayer(modelLayer);
	let featuremodel1 = new terra.Model({
		geometry: {
			"coordinates": [
				113.55175280557246, 34.793170730802366,
				1
			],
			"type": "Point"
		},
		iscity: true,
		style: {
			type: 'fbx',
			url: '/model/52603.FBX',
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
	featuremodel1.setShadows({
		cast: true,
		receive: true
	});


}


function loadgeojsonpipe(url: any, color: any) {
	let lineLayer = new terra.LineLayer('pipeline' + Math.random());
	map.addLayer(lineLayer);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			data.features.forEach((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {

					// 只处理MultiLineString类型的几何体
					if (feature.geometry && feature.geometry.type === 'MultiLineString') {
						const coordinates = feature.geometry.coordinates;

						// 检查是否实际上只有一条线（只有一个坐标数组）
						if (coordinates.length === 1) {
							// 转换为LineString
							feature = {
								...feature,
								geometry: {
									type: 'LineString',
									coordinates: coordinates[0]
								}
							}
						}
					}

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
				// console.log(feature, 'modified geojson data ------------');

				let pipeline = new terra.MultiLineString({
					"geometry": feature.geometry,
					style: {
						type: 'basic-line',
						color: color,
						width: 2,
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

	// setTimeout(() => {
	// 	let allfeatures = lineLayer.getFeatures();
	// 	console.log(lineLayer.simplerender(), 'allfeatures-------------------');
	// }, 1000);


}


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
				const water = new terra.Polygon({
					geometry: feature.geometry,
					style: {
						type: 'base-water',
						normalMap: './image/waternormals.jpg',
						color: '#0c99e5',         // 水面颜色
						sunColor: '#FFB905', // 阳光颜色
						opacity: 1             // 透明度


					}
				});

				water.addTo(waterpolygonLayer);
			});
			return data;
		})
		.catch(err => {
			console.error('加载geojson失败:', err);
		});
}

function addCloud() {
	let cloudsLayer = new terra.CloudsLayer('cloudsLayer', { texture: './image/cloud.png' });
	map.addLayer(cloudsLayer);
	// console.log(cloudsLayer, 'cloudsLayer-------------------');
	let cloud = new terra.ICloud({
		geometry: {
			"coordinates": [
				113.55175280557246, 34.793170730802366,
				1000
			],
			"type": "Point"
		},
		// iscity: true,
		style: {
			type: 'cloud',
			hexcolor: '#FFFFFF',
			growth: 11,
			segments: 90,
			speed: 0.2,
			// volume:1,
			boundstext: {
				x: 50,
				y: 2,
				z: 30
			},
			opacity: 0.25
			// speed: 0.8,
			// seed: 50,
		}
	})
	// 不优雅，需要等cloudsLayer加载完成后再添加cloud
	setTimeout(() => {
		cloud.addTo(cloudsLayer);
	}, 1000);


	console.log(map.viewer.scene, 'cloud-------------------');
	// console.log(cloud, 'cloud-------------------');
}

function loadgeojsonpoint(url: any, icon: any, layername?: any) {
	let pointLayer = new terra.PointLayer(layername);
	map.addLayer(pointLayer);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			data.features.forEach((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {

					feature.geometry.coordinates = [...feature.geometry.coordinates, 1];
				}
				// console.log(feature, 'modified geojson data ------------');

				let featurepoint = new terra.Maker({
					geometry: feature.geometry,
					style: {
						type: 'icon-point',
						url: icon,      // 图标路径
						size: [0.03, 0.03],            // 宽1米，高1.5米
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
			console.log(data.features.length, '长度')
			return data;
		})
		.catch(err => {
			console.error('加载geojson失败:', err);
		});
}


function loadgeojsonLabel(url: any, layername?: any) {
	let pointLayer = new terra.PointLayer(layername);
	map.addLayer(pointLayer);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			data.features.forEach((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {

					feature.geometry.coordinates = [...feature.geometry.coordinates, 1];
				}
				// console.log(feature, 'modified geojson data ------------');

				let featurepoint = new terra.Label({
					geometry: feature.geometry,
					style: {
						type: 'canvas-label-fixed',
						text: feature.properties.lane_way,
						textColor:'#E5521B',
						showBackground:false,
						strokeColor: '#FFFFFF',
						strokeWidth: 3,
						fontSize: 20,
						fixedSize:1,
						// screenSpaceSize:16
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
			console.log(data.features.length, '长度')
			return data;
		})
		.catch(err => {
			console.error('加载geojson失败:', err);
		});
}


main();


