import { Body } from './Body'
import { Vector2 } from '../Math/Vector2'
import { Collider } from './Collider'
import { Transform } from './Transform'

export namespace Collisions {
	import Circle = Collider.Circle
	import Polygon = Collider.Polygon
	import Capsule = Collider.Capsule
	export interface CollisionInfo {
		contactPoints: Vector2[]
		normal: Vector2
		penetration: number
	}

	export function testCollision(bodyA: Body, bodyB: Body): CollisionInfo | null {
		if (bodyA.collider instanceof Circle) {
			if (bodyB.collider instanceof Circle) {
				return testCircleToCircle(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			} else if (bodyB.collider instanceof Polygon) {
				return testCircleToPolygon(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			} else if (bodyB.collider instanceof Capsule) {
				// return testCircleToCapsule(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			}
		} else if (bodyA.collider instanceof Polygon) {
			if (bodyB.collider instanceof Circle) {
				return testPolygonToCircle(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			} else if (bodyB.collider instanceof Polygon) {
				return testPolygonToPolygon(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			} else if (bodyB.collider instanceof Capsule) {

			}
		} else if (bodyA.collider instanceof Capsule) {
			if (bodyB.collider instanceof Circle) {
				// return testCapsuleToCircle(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			} else if (bodyB.collider instanceof Polygon) {

			} else if (bodyB.collider instanceof Capsule) {
				// return testCapsuleToCapsule(bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
			}
		}

		return null
	}

	export function testCircleToCircle(
		colliderA: Circle, transformA: Transform,
		colliderB: Circle, transformB: Transform
	): CollisionInfo | null {
		const delta = Vector2.subtract(transformB.position, transformA.position)
		const distanceSquared = delta.magnitudeSquared
		const radii = colliderA.radius + colliderB.radius

		// ||C_b - P_a|| > r_b + r_a means they're not intersecting
		if (distanceSquared > radii * radii) return null

		// no need to Vector2.normalize() since the distance is already calculated
		const distance = Math.sqrt(distanceSquared)
		const normal = Vector2.divide(delta, distance)
		const penetration = radii - distance
		const contactPoints = [] as Vector2[]

		// would add a 2nd contact point, but it doesn't make sense
		contactPoints[0] = Vector2.add(transformA.position, Vector2.multiply(normal, colliderA.radius))

		return { normal, penetration, contactPoints }
	}

	// Separating-Axis Theorem (SAT)
	export function testPolygonToPolygon(
		colliderA: Polygon, transformA: Transform,
		colliderB: Polygon, transformB: Transform
	): CollisionInfo | null {
		const verticesA = colliderA.getTransformedVertices(transformA)
		const verticesB = colliderB.getTransformedVertices(transformB)
		const edgesA = [] as [Vector2, Vector2][]
		const edgesB = [] as [Vector2, Vector2][]

		for (let i = 0; i < verticesA.length; i++) {
			const j = i + 1 < verticesA.length ? i + 1 : 0

			edgesA.push([verticesA[i], verticesA[j]])
		}
		for (let i = 0; i < verticesB.length; i++) {
			const j = i + 1 < verticesB.length ? i + 1 : 0

			edgesB.push([verticesB[i], verticesB[j]])
		}

		let minOverlap = Infinity
		let smallestAxis = Vector2.ZERO

		// loop through every single edge
		for (const [start, end] of [...edgesA, ...edgesB]) {
			// normal (perpendicular) of the edge
			const axis = Vector2.normalize(Vector2.subtract(end, start).perpendicular)

			// projecting the polygons onto the axis
			const [minA, maxA] = projectPolygonOntoAxis(verticesA, axis)
			const [minB, maxB] = projectPolygonOntoAxis(verticesB, axis)

			// projections aren't overlapping means there is separation, and we can carry on with our lives
			if (minA > maxB || minB > maxA) return null

			const overlap = Math.min(maxA, maxB) - Math.max(minA, minB)

			// save the smallest overlap and axis to be used as our normal and penetration
			if (overlap < minOverlap) {
				minOverlap = overlap
				smallestAxis = axis
			}
		}

		const direction = Vector2.subtract(transformB.position, transformA.position)

		// making sure the normal is pointing at the right direction (A to B)
		if (Vector2.dot(direction, smallestAxis) < 0) smallestAxis = smallestAxis.negative

		const contactPoints = [] as Vector2[]

		// polygon clipping, might need a better way to calculate the contact points
		for (const edgeA of edgesA) {
			for (const edgeB of edgesB) {
				const intersectionPoint = intersectionPointOnEdges(...edgeA, ...edgeB)

				if (intersectionPoint) contactPoints.push(intersectionPoint)
			}
		}

		return { penetration: minOverlap, normal: smallestAxis, contactPoints }
	}
	// TODO: fix this
	// export function testCapsuleToCapsule(
	// 	colliderA: Capsule, transformA: Transform,
	// 	colliderB: Capsule, transformB: Transform
	// ): CollisionInfo | null {
	// 	const [startA, endA] = colliderA.getTransformedEdge(transformA)
	// 	const [startB, endB] = colliderB.getTransformedEdge(transformB)
	//
	// 	const pointEdgePairs = [
	// 		[startA, startB, endB, false], [endA, startB, endB, false],
	// 		[startB, startA, endA, true], [endB, startA, endA, true]
	// 	] as [point: Vector2, start: Vector2, end: Vector2, opposite: boolean][]
	//
	// 	let closestPointA = Vector2.ZERO
	// 	let closestPointB!: Vector2
	// 	let minDelta!: Vector2
	// 	let isOpposite = false
	// 	let minDistanceSquared = Infinity
	//
	// 	for (const [point, start, end, opposite] of pointEdgePairs) {
	// 		const closestPoint = closestPointOnEdge(point, start, end)
	// 		const delta = Vector2.subtract(closestPoint, point)
	// 		const distanceSquared = delta.magnitudeSquared
	//
	// 		if (fuzzyEquals(distanceSquared, minDistanceSquared)) {
	// 			if (!Vector2.fuzzyEquals(closestPoint, closestPointA)) {
	// 				closestPointB = closestPoint
	// 			}
	// 		} else if (distanceSquared < minDistanceSquared) {
	// 			minDistanceSquared = distanceSquared
	// 			minDelta = delta
	// 			isOpposite = opposite
	// 			closestPointA = closestPoint
	// 		}
	// 	}
	//
	// 	const radii = colliderA.radius + colliderB.radius
	//
	// 	if (minDistanceSquared <= radii * radii) {
	// 		const distance = Math.sqrt(minDistanceSquared)
	// 		const direction = Vector2.subtract(transformB.position, transformA.position)
	//
	// 		let normal = Vector2.divide(minDelta, distance)
	//
	// 		if (Vector2.dot(direction, normal) <= 0) normal = normal.negative
	//
	// 		const penetration = radii - distance
	// 		const contactPoints = [] as Vector2[]
	//
	// 		contactPoints[0] = Vector2.add(closestPointA, Vector2.multiply(isOpposite ? normal : normal.negative, colliderA.radius))
	//
	// 		if (closestPointB) {
	// 			contactPoints[1] = Vector2.add(closestPointB, Vector2.multiply(isOpposite ? normal : normal.negative, colliderB.radius))
	// 		}
	//
	// 		return { normal, penetration, contactPoints }
	// 	}
	//
	// 	return null
	// }

	// SAT again
	export function testCircleToPolygon(
		colliderA: Circle, transformA: Transform,
		colliderB: Polygon, transformB: Transform
	): CollisionInfo | null {
		const vertices = colliderB.getTransformedVertices(transformB)
		const edges = [] as [Vector2, Vector2][]

		for (let i = 0; i < vertices.length; i++) {
			const j = i + 1 < vertices.length ? i + 1 : 0

			edges.push([vertices[i], vertices[j]])
		}

		let minOverlap = Infinity
		let smallestAxis = Vector2.ZERO

		for (const [start, end] of edges) {
			const edge = Vector2.subtract(end, start)
			const axis = Vector2.normalize(edge.perpendicular)

			const [minA, maxA] = projectPolygonOntoAxis(vertices, axis)
			const [minB, maxB] = projectCircleOntoAxis(transformA.position, colliderA.radius, axis)

			if (minA > maxB || minB > maxA) return null

			const overlap = Math.min(maxA, maxB) - Math.max(minA, minB)

			if (overlap < minOverlap) {
				minOverlap = overlap
				smallestAxis = axis
			}
		}

		// using the closest vertex from the circle center as the axis
		const closestVertex = closestVertexOnPolygon(transformA.position, vertices)
		const axis = Vector2.normalize(Vector2.subtract(closestVertex, transformA.position))

		const [minA, maxA] = projectPolygonOntoAxis(vertices, axis)
		const [minB, maxB] = projectCircleOntoAxis(transformA.position, colliderA.radius, axis)

		if (minA > maxB || minB > maxA) return null

		const overlap = Math.min(maxA, maxB) - Math.max(minA, minB)

		if (overlap < minOverlap) {
			minOverlap = overlap
			smallestAxis = axis
		}

		const direction = Vector2.subtract(transformB.position, transformA.position)

		// making sure that the normal is pointing at the right direction, again
		if (Vector2.dot(direction, smallestAxis) < 0) smallestAxis = smallestAxis.negative

		const contactPoints = [] as Vector2[]
		let minDistanceSquared = Infinity

		// loop over the edges and finding the closest point from the circle center
		for (const [start, end] of edges) {
			const closestPoint = closestPointOnEdge(transformA.position, start, end)
			const distanceSquared = Vector2.subtract(closestPoint, transformA.position).magnitudeSquared

			if (distanceSquared < minDistanceSquared) {
				minDistanceSquared = distanceSquared
				contactPoints[0] = closestPoint
			}
		}

		return { penetration: minOverlap, normal: smallestAxis, contactPoints }
	}
	export function testPolygonToCircle(
		colliderA: Polygon, transformA: Transform,
		colliderB: Circle, transformB: Transform
	): CollisionInfo | null {
		const collisionInfo = testCircleToPolygon(colliderB, transformB, colliderA, transformA)

		// reversing since normal needs to be pointing from A to B
		if (collisionInfo) {
			collisionInfo.normal = collisionInfo.normal.negative

			return collisionInfo
		} else return null
	}

	// no TODOs, this works fine
	// export function testCircleToCapsule(
	// 	colliderA: Circle, transformA: Transform,
	// 	colliderB: Capsule, transformB: Transform
	// ): CollisionInfo | null {
	// 	const [start, end] = colliderB.getTransformedEdge(transformB)
	//
	// 	const closestPoint = closestPointOnEdge(transformA.position, start, end)
	// 	const delta = Vector2.subtract(closestPoint, transformA.position)
	// 	const distanceSquared = delta.magnitudeSquared
	// 	const radii = colliderA.radius + colliderB.radius
	//
	// 	if (distanceSquared <= radii * radii) {
	// 		const distance = Math.sqrt(distanceSquared)
	// 		const normal = Vector2.divide(delta, distance)
	// 		const penetration = radii - distance
	// 		const contactPoints = [] as Vector2[]
	//
	// 		contactPoints[0] = Vector2.add(transformA.position, Vector2.multiply(normal, colliderA.radius))
	//
	// 		return { normal, penetration, contactPoints }
	// 	}
	//
	// 	return null
	// }
	// export function testCapsuleToCircle(
	// 	colliderA: Capsule, transformA: Transform,
	// 	colliderB: Circle, transformB: Transform
	// ): CollisionInfo | null {
	// 	const collisionInfo = testCircleToCapsule(colliderB, transformB, colliderA, transformA)
	//
	// 	if (collisionInfo) {
	// 		collisionInfo.normal = collisionInfo.normal.negative
	//
	// 		return collisionInfo
	// 	} else return null
	// }

	// helper functions
	function projectPolygonOntoAxis(vertices: Vector2[], axis: Vector2): [min: number, max: number] {
		let min = Infinity
		let max = -Infinity

		for (const vertex of vertices) {
			const projection = Vector2.dot(vertex, axis)

			if (projection < min) min = projection
			if (projection > max) max = projection
		}

		return [min, max]
	}
	function projectCircleOntoAxis(center: Vector2, radius: number, axis: Vector2): [min: number, max: number] {
		const direction = Vector2.multiply(axis, radius)

		let min = Vector2.dot(Vector2.add(center, direction), axis)
		let max = Vector2.dot(Vector2.subtract(center, direction), axis)

		if (min > max) [min, max] = [max, min]

		return [min, max]
	}

	function closestVertexOnPolygon(point: Vector2, vertices: Vector2[]): Vector2 {
		let closestVertex!: Vector2
		let minDistanceSquared = Infinity

		for (const vertex of vertices) {
			const distanceSquared = Vector2.subtract(vertex, point).magnitudeSquared

			if (distanceSquared < minDistanceSquared) {
				closestVertex = vertex
				minDistanceSquared = distanceSquared
			}
		}

		return closestVertex
	}

	// point to line segment
	// side note: I'm using edge and line segment interchangeably
	function closestPointOnEdge(point: Vector2, start: Vector2, end: Vector2): Vector2 {
		const delta = Vector2.subtract(point, start)
		const edge = Vector2.subtract(end, start)

		const projection = Vector2.dot(delta, edge)
		const distance = projection / edge.magnitudeSquared

		let closestPoint: Vector2

		if (distance <= 0) {
			closestPoint = start
		} else if (distance >= 1) {
			closestPoint = end
		} else {
			closestPoint = Vector2.add(start, Vector2.multiply(edge, distance))
		}

		return closestPoint
	}
	function intersectionPointOnEdges(startA: Vector2, endA: Vector2, startB: Vector2, endB: Vector2): Vector2 | null {
		const edgeA = Vector2.subtract(endA, startA)
		const edgeB = Vector2.subtract(endB, startB)

		const determinant = Vector2.cross(edgeA, edgeB)

		if (Math.abs(determinant) < 1e-6) return null // parallel/collinear

		const delta = Vector2.subtract(startB, startA)
		const t = Vector2.cross(delta, edgeB) / determinant
		const u = Vector2.cross(delta, edgeA) / determinant

		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return Vector2.add(startA, Vector2.multiply(edgeA, t))

		return null // not intersecting
	}
}