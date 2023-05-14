<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted } from "vue";
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
function animate() {
	requestAnimationFrame(animate);
	// 先更新轨道控制器对相机的更改 然后重新渲染
    controls.update();
    // 更改物体的位置
    cube.position.x += 0.01;
    cube.position.x = cube.position.x > 5 ? 0 : cube.position.x;
	renderer.render(scene, camera);
}
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
