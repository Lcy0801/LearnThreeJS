<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted } from "vue";
import EarCut from "../EarCut.js";
import Polygon from "../data/polygon.json";
// let polygon = {
// 	type: "Polygon",
// 	coordinates: [
// 		[
// 			[0.059701492537314, 0.388937664618086, 0],
// 			[-0.344161545215101, 0.013169446883231, 0],
// 			[0.370500438981563, -0.216856892010536, 0],
// 			[0.567164179104478, 0.515364354697103, 0],
// 			[0.012291483757682, 0.69622475856014, 0],
// 			[-0.528533801580333, 0.417032484635645, 0],
// 		],
// 	],
// };

// polygon = {
// 	type: 'Feature',
// 	properties: {},
// 	geometry: polygon
// };

let polygon = Polygon.features[0];
const earcut = new EarCut(polygon);
earcut.triangulate();
console.log(earcut.getTriangleFaces());
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(0, 0, 10);
scene.add(camera);
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xbbffaa });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame(animate);
	const time = clock.getDelta();
	cube.position.x += 0.5 * time;
	// 先更新轨道控制器对相机的更改 然后重新渲染
	controls.update();
	renderer.render(scene, camera);
}
cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 4);
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);
animate();
onMounted(() => {
	document.getElementById("container").append(renderer.domElement);
});
</script>

<template>
	<div id="container"></div>
</template>
<style scoped></style>
