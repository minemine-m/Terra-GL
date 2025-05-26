
import * as terra from "terra-gl";

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
			antialias:true,
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
				// 	style: "vec_w",
				// 	token: "baa4de006b9c36080686fb99885177a9",
				// 	url: `https://t1.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdttk}`
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
}



// 测试大批量管线的性能优化
function addline() {

	// let linelayer = new terra.LineLayer('line');
	// map.addLayer(linelayer);
	// let pipeline = new terra.MultiLineString({
	// 	"geometry": {
	// 		"type": "MultiLineString",
	// 		"coordinates": [
	// 			[
	// 				[113.5505121, 34.8025465],
	// 				[112.5502125, 34.8025465]
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
	// console.log(pipeline, 'pipeline-------------------');
	// pipeline.addTo(linelayer);

	loadgeojsonpipe('/geojson/public.gsgx_pipe.json', '#0068F8');
	loadgeojsonpipe('/geojson/public.wsgx_pipe.json', '#f85700');
	// loadgeojsonpipe('/geojson/public.ysgx_pipe.json', '#057826');

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
			url: '/model/52602.FBX',
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

function loadglbline() {

}

main();


