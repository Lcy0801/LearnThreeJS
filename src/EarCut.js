// 向量叉乘
const vectorCross = (v1, v2) => {
	let a = v1[1] * v2[2] - v1[2] * v2[1];
	let b = v2[0] * v1[2] - v1[0] * v2[2];
	let c = v1[0] * v2[1] - v2[0] * v1[1];
	return [a, b, c];
};
// 向量点乘
const vectorDot = (v1, v2) => {
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};
// 判断point是否在point1 point2 point3 组成的三角形内部
const isInTriangle = (point1, point2, point3, point) => {
	let v1 = [point[0] - point1[0], point[1] - point1[1], point[2] - point1[2]];
	let v2 = [point[0] - point2[0], point[1] - point2[1], point[2] - point2[2]];
	let v3 = [point[0] - point3[0], point[1] - point3[1], point[2] - point3[2]];
	let v1_2 = vectorCross(v1, v2);
	let v2_3 = vectorCross(v2, v3);
	let v3_1 = vectorCross(v3, v1);
	if (
		vectorDot(v1_2, v2_3) > 0 &&
		vectorDot(v1_2, v3_1) > 0 &&
		vectorDot(v2_3, v3_1) > 0
	) {
		return true;
	}
	return false;
};

// 判断一组点组成的环是顺时针方向还是逆时针方向：基于多边形面积公式进行计算
const isAnticlockwise = (points) => {
	// todo
	let S = 0;
	points.forEach((point, index) => {
		let next = null;
		if (index === points.length - 1) {
			next = points[0];
		} else {
			next = points[index + 1];
		}
		S += ((point[1] + next[1]) * (point[0] - next[0])) / 2;
	});
	return S > 0;
};

// 计算向量的方位角：从正北方向顺时针
const getAzimuth = (x, y) => {
	let angle = Math.atan2(x, y);
	if (angle < 0) {
		angle = Math.PI * 2 + angle;
	}
	return angle;
};

// 向量单位化
const vectorNormalize = (v) => {
	let l = v.length();
	let dist = 0;
	v.forEach((vc) => {
		dist += vc * vc;
	});
	dist = Math.sqrt(dist);
	let vNormal = [];
	v.forEach((vc) => {
		vNormal.push(vc / dist);
	});
	return vNormal;
};

// 求射线与线段的交点
/**
 *
 * @param {*} point 射线起点
 * @param {*} normal 射线方向
 * @param {*} start 线段起点
 * @param {*} end 线段终点
 */
const rayIntersectionLineSegment = (point, rayNormal, start, end) => {
	let lineSegmentV = [end[0] - start[0], end[1] - start[1]];
	let lsNormal = vectorNormalize(lineSegmentV);
	if (rayNormal[0] * lsNormal[1] === lsNormal[0] * rayNormal[1]) {
		// 射线和线段平行
		return null;
	}
	// 参数方程通解
	let t0 =
		(lsNormal[1] * (start[0] - point[0]) -
			lsNormal[0] * (start[1] - point[1])) /
		(rayNormal[0] * lsNormal[1] - lsNormal[0] * rayNormal[1]);
	let t1 =
		(rayNormal[1] * (start[0] - point[0]) -
			rayNormal[0] * (start[1] - point[1])) /
		(rayNormal[0] * lsNormal[1] === lsNormal[0] * rayNormal[1]);
	if (t0 < 0) {
		return null;
	}
	let lsDist = Math.sqrt(
		(end[0] - start[0]) * (end[0] - start[0]) +
			(end[1] - start[1]) * (end[1] - start[1])
	);
	if (t1 < 0 || t1 > lsDist) {
		// 交点不在线段内部
		return null;
	}
	let res = [point[0] + t0 * rayNormal[0], point[1] + t0 * rayNormal[1]];
	return [res, t0, t1 / lsDist];
};

class EarCut {
	constructor(polygon) {
		this._polygon = { ...polygon };
		this._init();
	}
	_init() {
		this._convertToSimplePolygon();
		// 初始化点集合
		// 默认只处理简单多边形
		this.points = [...this._simplePolygon.geometry.coordinates[0]];
		let pointsNum = this.points.length;
		this.currentIndexs = [...Array(pointsNum).keys()];
		// 判断多边形是逆时针方向还是顺时针方向
		this.dirFlag = isAnticlockwise(this.points);
		// 初始化凸点集合
		this.convexPoints = [];
		// 初始化凹点集合
		this.concavePoints = [];
		// 初始化耳朵集合
		this.ears = [];
		this.points.forEach((point, index) => {
			let last = null;
			let next = null;
			if (index === 0) {
				last = pointsNum - 1;
			} else {
				last = index - 1;
			}
			if (index === pointsNum - 1) {
				next = 0;
			} else {
				next = index + 1;
			}
			let convexFlag = this._isConvexPoint(last, index, next);
			if (convexFlag) {
				// 凸点
				this.convexPoints.push(index);
				// 判断改凸点是否为耳朵
				if (this._isEar(last, index, next)) {
					this.ears.push([last, index, next]);
				}
			} else {
				// 凹点
				this.concavePoints.push(index);
			}
		});
	}
	// 利用耳切法进行多边形三角化
	triangulate() {
		this.triangles = [];
		while (this.currentIndexs.length > 3) {
			let ear = this.ears.shift();
			this.triangles.push(ear[0], ear[1], ear[2]);
			// 更新当前顶点索引集合
			this.currentIndexs.splice(this.currentIndexs.indexOf(ear[1]), 1);
			// 更新凸点集合
			this.convexPoints.splice(this.convexPoints.indexOf(ear[1]), 1);
			// 维护上一顶点的属性
			this._updatePoint(ear[0]);
			// 维护下一顶点的属性
			this._updatePoint(ear[2]);
		}
		this.triangles.push(
			this.currentIndexs[0],
			this.currentIndexs[1],
			this.currentIndexs[2]
		);
		return;
	}
	getTriangleFaces() {
		let triangleFaces = {
			type: "FeatureCollection",
			features: [],
		};
		let index = 0;
		for (let i = 0; i <= this.triangles.length - 3; i += 3) {
			let feature = JSON.parse(JSON.stringify(this._polygon));
			let [index1, index2, index3] = this.triangles.slice(i, i + 3);
			feature.geometry.coordinates = [
				[this.points[index1], this.points[index2], this.points[index3]],
			];
			feature.properties.id = index;
			triangleFaces.features.push(feature);
			index++;
		}
		return triangleFaces;
	}
	// 判断三角形是否为改多边形的耳朵
	_isEar(index1, index2, index3) {
		let isFlag = true;
		let point1 = this.points[index1];
		let point2 = this.points[index2];
		let point3 = this.points[index3];
		for (let i = 0; i < this.currentIndexs.length; i++) {
			let index = this.currentIndexs[i];
			if (index === index1 || index === index2 || index === index3) {
				continue;
			}
			let point = this.points[index];
			isFlag = !isInTriangle(point1, point2, point3, point);
			if (!isFlag) {
				break;
			}
		}
		return isFlag;
	}
	// 当删除一个耳朵后需要更新相邻两个顶点的凹凸属性和耳朵属性
	_updatePoint(gIndex) {
		let lastgIndex;
		let nextgIndex;
		let lIndex = this.currentIndexs.indexOf(gIndex);
		if (lIndex === 0) {
			lastgIndex = this.currentIndexs[this.currentIndexs.length - 1];
		} else {
			lastgIndex = this.currentIndexs[lIndex - 1];
		}
		if (lIndex === this.currentIndexs.length - 1) {
			nextgIndex = this.currentIndexs[0];
		} else {
			nextgIndex = this.currentIndexs[lIndex + 1];
		}
		if (this.convexPoints.indexOf(gIndex) !== -1) {
			// 该点之前为凸点
			this.ears = this.ears.filter((ear) => {
				let index = ear[1];
				return index !== gIndex;
			});
			if (this._isEar(lastgIndex, gIndex, nextgIndex)) {
				// 是耳朵 加入ears
				this.ears.push([lastgIndex, gIndex, nextgIndex]);
			}
		} else {
			// 该点之前为凹点
			// 更新凹凸属性
			let convexFlag = this._isConvexPoint(
				lastgIndex,
				gIndex,
				nextgIndex
			);
			if (convexFlag) {
				this.concavePoints.splice(
					this.concavePoints.indexOf(gIndex),
					1
				);
				this.convexPoints.push(gIndex);
				// 更新耳朵属性
				let earFlag = this._isEar(lastgIndex, gIndex, nextgIndex);
				if (earFlag) {
					this.ears.push([lastgIndex, gIndex, nextgIndex]);
				}
			}
		}
	}
	// 判断该点是凹点还是凸点
	_isConvexPoint(lastgIndex, gIndex, nextgIndex) {
		let xLast = this.points[lastgIndex][0] - this.points[gIndex][0];
		let yLast = this.points[lastgIndex][1] - this.points[gIndex][1];
		let azimuthLast = getAzimuth(xLast, yLast);
		let xNext = this.points[nextgIndex][0] - this.points[gIndex][0];
		let yNext = this.points[nextgIndex][1] - this.points[gIndex][1];
		let azimuthNext = getAzimuth(xNext, yNext);
		let angle;
		if (this.dirFlag) {
			angle = azimuthNext - azimuthLast;
		} else {
			angle = azimuthLast - azimuthNext;
		}
		if (angle < 0) {
			angle += Math.PI * 2;
		}
		return angle < Math.PI;
	}

	_convertToSimplePolygon() {
		this._simplePolygon = JSON.parse(JSON.stringify(this._polygon));
		// 首尾点不重复存储
		let start = this._simplePolygon.geometry.coordinates[0][0];
		let end =
			this._simplePolygon.geometry.coordinates[0][
				this._simplePolygon.geometry.coordinates[0].length - 1
			];
		if (start[0] === end[0] && start[1] === end[1]) {
			// 首尾点重复存储 进行处理
			this._simplePolygon.geometry.coordinates.forEach((polygonRing) => {
				polygonRing.pop();
			});
		}
		// 当坐标缺少第三个维度时默认填充为0
		if (start.length === 2) {
			this._simplePolygon.geometry.coordinates.forEach((polygonRing) => {
				polygonRing.forEach((point) => {
					point.push(0);
				});
			});
		}
		// 当多边形含有岛洞时找出一对互相可见点 将其转化为简单多边形
		
	}
	// 在内环和外环上分别寻找一个点，组成一对相互可见点
	_getVisiblePoints(inRing, outRing) {
		let inVisiblePoint;
		let inVisibleIndex;
		// 找到内环最右侧的点
		inRing.forEach((point, index) => {
			if (index === 0) {
				inVisiblePoint = [...point];
				inVisibleIndex = index;
			} else if (point[0] > inVisiblePoint[0]) {
				inVisiblePoint = [...point];
				inVisibleIndex = index;
			}
		});
		// 求解以内环最右侧点为起点指向x轴正向的射线与外环的交点
		let nearestIntersection = null;
		outRing.forEach((point, index) => {
			let start = [...point];
			let indexNext = index === outRing.length - 1 ? 0 : index + 1;
			let end = outRing[indexNext];
			let intersection = rayIntersectionLineSegment(
				inVisiblePoint,
				[1, 0, 0],
				start,
				end
			);
			if (intersection) {
				if (nearestIntersection) {
					if (nearestIntersection[1] > intersection[1]) {
						nearestIntersection = [
							...intersection,
							index,
							indexNext,
						];
					}
				} else {
					nearestIntersection = [...intersection, index, indexNext];
				}
			}
		});
		let outVisiblePoint;
		let outVisibleIndex;
		if (nearestIntersection[2] === 0) {
			outVisiblePoint = outRing[nearestIntersection[3]];
			outVisibleIndex = nearestIntersection[3];
		} else if (nearestIntersection[2] === 1) {
			outVisiblePoint = outRing[nearestIntersection[4]];
			outVisibleIndex = nearestIntersection[4];
		} else {
			if (
				outRing[nearestIntersection[3]][0] >
				outRing[nearestIntersection[4]][0]
			) {
				outVisibleIndex = nearestIntersection[3];
			} else {
				outVisibleIndex = nearestIntersection[4];
			}
			outVisiblePoint = outRing[outVisibleIndex];
			// 判断是否有其它的外环点在outVisiblePoint inVisiblePoint nearestIntersection组成的三角形内部
			let angle = null;
			let vectorX = [
				nearestIntersection[0][0] - inVisiblePoint[0],
				nearestIntersection[0][1] - inVisiblePoint[1],
			];
			vectorX = vectorNormalize(vectorX);
			outRing.forEach((point, index) => {
				if (
					isInTriangle(
						inVisiblePoint,
						outVisiblePoint,
						nearestIntersection[0],
						point
					)
				) {
					if (!angle) {
						outVisibleIndex = index;
						outVisiblePoint = [...point];
						let vectorOut = [
							point[0] - inVisiblePoint[0],
							point[1] - inVisiblePoint[1],
						];
						vectorOut = vectorNormalize(vectorOut);
						angle = vectorDot(vectorX, vectorOut);
					} else {
						let vectorOut = [
							point[0] - inVisiblePoint[0],
							point[1] - inVisiblePoint[1],
						];
						vectorOut = vectorNormalize(vectorOut);
						let tmpAngle = vectorDot(vectorX, vectorOut);
						if (tmpAngle > angle) {
							outVisiblePoint = [...point];
							outVisibleIndex = index;
							angle = tmpAngle;
						}
					}
				}
			});
		}
		// outVisiblePoint inVisiblePoint 组成了一对相互可见的点
		// 返回相互可见点在内外环的索引
		return [inVisibleIndex, outVisibleIndex];
	}
}
export default EarCut;
