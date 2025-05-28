
import * as terra from "terra-gl";
import * as vanilla from "@pmndrs/vanilla";
import * as THREE from "three";



let viewer = new terra.Viewer('#map', {
  antialias: true,
  // 图片顺序对着的夜空1（有山） -------
  skybox: {
    path: "./image/skyboxall/SkyBox8/",
    files: ["back.jpg", "front.jpg", "down.jpg", "top.jpg", "right.jpg", "left.jpg"],
    // defaultColor: '#121E3A'
  }
})


// 创建立方体
const geometry = new THREE.BoxGeometry(100000, 1100000, 1100000);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// viewer.scene.add(cube);


const setupCloud = async () => {
  const textureLoader = new THREE.TextureLoader()
  textureLoader.loadAsync('./image/cloud.png').then((texture)=>{
    console.log(texture,'cloudTexture')
    const clouds = new vanilla.Clouds({ texture: texture })
    viewer.scene.add(clouds)
  
    // create first cloud
    const cloud0 = new vanilla.Cloud()
    clouds.add(cloud0)
    cloud0.scale.setScalar(100000)
  
    // addCloudGui(cloud0)
    // clouds.scale.addScalar(100000)
    // clouds.scale.setScalar(100000)
    cloud0.position.set(
      2000,1000,0
     )
    viewer.addAnimationCallback((delta, elapsedtime) => {
      clouds.update(viewer.camera, elapsedtime,delta)
    })
  })



  // create main clouds group

}
// setupCloud();
main()
async function main() {
  setupCloud();
}

