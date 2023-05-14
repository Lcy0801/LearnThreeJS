<script setup>
import * as THREE from "three";
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
const render = new THREE.WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app").append(render.domElement);
render.render(scene, camera);
</script>

<template>
</template>
<style scoped></style>
