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
function animate(time) {
    console.log(time);
	requestAnimationFrame(animate);
	// 先更新轨道控制器对相机的更改 然后重新渲染
    cube.position.x = time / 1000 * 0.5;
    if (cube.position.x > 5) { 
        cube.position.x = 0;
    }
    controls.update();
	renderer.render(scene, camera);
}
cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI/4);
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
