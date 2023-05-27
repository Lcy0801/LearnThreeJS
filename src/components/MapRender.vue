<template>
	<div id="mapWrapper">
		<div id="mapPanel">
			<canvas
				@mousedown="startDrag"
				@mousemove="dragging"
				@mouseup="endDrag"
				@wheel="zoomMap"
			></canvas>
		</div>
	</div>
</template>
<script setup>
import { onMounted } from "vue";
const EARTHRADIUS = 6378137;
const TILESIZE = 256;
let initFlag = false;
let zoom = 16;
let pixelBound = {
	minPixelX: 0,
	maxPixelX: 0,
	minPixelY: 0,
	maxPixelY: 0,
};
let canvas;
// 经纬度坐标转web墨卡托坐标
const lonlatToxy = (lon, lat) => {
	const x = (lon / 180) * Math.PI * EARTHRADIUS;
	const y =
		Math.log(Math.tan(Math.PI / 4 + ((lat / 180) * Math.PI) / 2)) *
		EARTHRADIUS;
	return [x, y];
};
// web墨卡托坐标转像素坐标
const xyTopixel = (x, y, zoom) => {
	//计算比例尺
	const mapSize = TILESIZE * Math.pow(2, zoom);
	const scale = (2 * Math.PI * EARTHRADIUS) / mapSize;
	const pixelX = x / scale + mapSize / 2;
	const pixelY = mapSize / 2 - y / scale;
	return [pixelX, pixelY];
};
//基于像素坐标计算瓦片编号
const pixelToTileNo = (pixelX, pixelY) => {
	return [
		Number.parseInt(pixelY / TILESIZE),
		Number.parseInt(pixelX / TILESIZE),
	];
};
//影像地图瓦片
const drawImage = (ctx, row, col, zoom) => {
	const url = `https://khms3.google.com/kh/v=947?x=${col}&y=${row}&z=${zoom}`;
	const tileImg = new Image();
	tileImg.setAttribute('crossOrigin', 'anonymous');
	tileImg.onload = () => {
		const leftTopX = col * TILESIZE;
		const leftTopY = row * TILESIZE;
		const sx = leftTopX - pixelBound.minPixelX;
		const sy = leftTopY - pixelBound.minPixelY;
		ctx.drawImage(tileImg, sx, sy);
	};
	tileImg.src = url;
};

const drawMap = () => {
	//计算行列号的范围
	const [minRow, minCol] = pixelToTileNo(
		pixelBound.minPixelX,
		pixelBound.minPixelY
	);
	const [maxRow, maxCol] = pixelToTileNo(
		pixelBound.maxPixelX,
		pixelBound.maxPixelY
	);
	//绘制视口范围内的地图瓦片
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = minRow; i <= maxRow; i++) {
		for (let j = minCol; j <= maxCol; j++) {
			drawImage(ctx, i, j, Number.parseInt(zoom));
		}
	}
};

onMounted(() => {
	canvas = document.getElementsByTagName("canvas")[0];
	canvas.style.letf = "0px";
	canvas.style.top = "0px";
	canvas.height = canvas.clientHeight;
	canvas.width = canvas.clientWidth;
	const getPosition = (position) => {
		const lat = position.coords.latitude;
		const lon = position.coords.longitude;
		const [x, y] = lonlatToxy(116.411455,39.918255);
		const [pixelX, pixelY] = xyTopixel(x, y, zoom);
		//计算像素坐标的四至
		pixelBound.minPixelX = pixelX - canvas.clientWidth / 2;
		pixelBound.maxPixelX = pixelX + canvas.clientWidth / 2;
		pixelBound.minPixelY = pixelY - canvas.clientHeight / 2;
		pixelBound.maxPixelY = pixelY + canvas.clientHeight / 2;
		drawMap();
		initFlag = true;
	};
	navigator.geolocation.getCurrentPosition(getPosition, (error) => {
		console.log(error.code);
	});
});

//鼠标拖动地图事件
let startX, startY;
const startDrag = (e) => {
	if (!initFlag || e.button != 0) {
		return;
	}
	startX = e.x;
	startY = e.y;
};
const dragging = (e) => {
	if (!initFlag || e.buttons != 1) {
		return;
	}
	const currentX = e.x;
	const currentY = e.y;
	const dx = currentX - startX;
	const dy = currentY - startY;
	canvas.style.left = `${dx}px`;
	canvas.style.top = `${dy}px`;
};
const endDrag = (e) => {
	if (!initFlag || e.button!=0) {
		return;
	}
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	let endX = e.x;
	let endY = e.y;
	const dx = endX - startX;
	const dy = endY - startY;
	pixelBound.minPixelX -= dx;
	pixelBound.minPixelY -= dy;
	pixelBound.maxPixelX -= dx;
	pixelBound.maxPixelY -= dy;
	drawMap();
};
const zoomMap = (e) => { 
	console.log(e.offsetX, e.offsetY);
}
</script>

<style scoped>
#mapWrapper {
	width: 100%;
	height: 100%;
	position: relative;
}
#mapPanel {
	width: 1200px;
	height: 800px;
	position: absolute;
	left: calc(50% - 600px);
	top: calc(50% - 400px);
	overflow: hidden;
	background-color: #bbffaa;
}
canvas{
	width: 100%;
	height: 100%;
	position: absolute;
}
</style>
