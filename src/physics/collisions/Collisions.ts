import { Vector } from '../Vector'
import { Transform } from '../Transform'
import { Colliders } from './Colliders'
import { FMath } from '../../utility/FMath'
import { CollisionPoints } from './CollisionManifold'
import { Pair } from '../../index'

export namespace Collisions {
    export type Projection = [min: number, max: number]

    export function projectPolygon(vertices: Vector[], axis: Vector): Projection {
        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (let vertex of vertices) {
            let projection = FMath.dot(vertex, axis)

            if (projection < min) min = projection
            if (projection > max) max = projection
        }

        return [min, max]
    }
    export function projectCircle(center: Vector, radius: number, axis: Vector): Projection {
        let direction = axis.normalized
        let pointToEdge = Vector.multiply(direction, radius)

        let start = Vector.add(center, pointToEdge)
        let end = Vector.subtract(center, pointToEdge)

        let min = FMath.dot(start, axis)
        let max = FMath.dot(end, axis)

        if (min >= max) [min, max] = [max, min]

        return [min, max]
    }

    export function findClosestPolygonPoint(point: Vector, polygonVertices: Vector[]): Vector {
        let closestPoint = Vector.ZERO
        let minDistance = Number.POSITIVE_INFINITY

        for (let vertex of polygonVertices) {
            let distance = FMath.distance(vertex, point)

            if (distance < minDistance) [minDistance, closestPoint] = [distance, vertex]
        }

        return closestPoint
    }
    export function findClosestLineSegmentPoint(point: Vector, start: Vector, end: Vector): Vector {
        let closestPoint = Vector.ZERO

        let ab = Vector.subtract(end, start)
        let ap = Vector.subtract(point, start)

        let projection = FMath.dot(ap, ab)
        let distanceSq = projection / ab.magnitudeSq

        if (distanceSq < 0) closestPoint = start
        else if (distanceSq > 1) closestPoint = end
        else closestPoint = Vector.add(start, Vector.multiply(ab, distanceSq))

        return closestPoint
    }

    export function findCircleCollisionPoints(
        colliderA: Colliders.CircleCollider, transformA: Transform,
        colliderB: Colliders.CircleCollider, transformB: Transform
    ): CollisionPoints | undefined {
        let delta = Vector.subtract(transformB.position, transformA.position)
        let totalRadius = colliderA.radius + colliderB.radius
        let distance = delta.magnitude

        if (distance > totalRadius) return

        let normal = delta.normalized
        
        let pointA = Vector.add(transformA.position, Vector.multiply(normal, colliderA.radius))
        let pointB = Vector.subtract(transformB.position, Vector.multiply(normal, colliderB.radius))

        return {
            contacts: new Pair(pointA, pointB),
            normal, depth: totalRadius - distance
        }
    }
    export function findPolygonCollisionPoints(
        colliderA: Colliders.PolygonCollider, transformA: Transform,
        colliderB: Colliders.PolygonCollider, transformB: Transform
    ): CollisionPoints | undefined {
        let verticesA = colliderA.getTransformedVertices(transformA)
        let verticesB = colliderB.getTransformedVertices(transformB)

        let depth = Number.POSITIVE_INFINITY
        let normal = Vector.ZERO

        let minDistanceSq = Number.POSITIVE_INFINITY
        let pointA = Vector.ZERO
        let pointB = Vector.ZERO

        for (let i = 0; i < verticesA.length; i++) {
            let start = verticesA[i]
            let end = verticesA[(i + 1) % verticesA.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = projectPolygon(verticesA, axis)
            let [minB, maxB] = projectPolygon(verticesB, axis)

            if (minA > maxB || minB > maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) [depth, normal] = [overlap, axis]

            let closestPoint = findClosestLineSegmentPoint(transformB.position, start, end)
            let distanceSq = FMath.distanceSq(transformB.position, closestPoint)

            if (distanceSq < minDistanceSq) [minDistanceSq, pointA] = [distanceSq, closestPoint]
        }

        minDistanceSq = Number.POSITIVE_INFINITY
        
        for (let i = 0; i < verticesB.length; i++) {
            let start = verticesB[i]
            let end = verticesB[(i + 1) % verticesB.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = projectPolygon(verticesA, axis)
            let [minB, maxB] = projectPolygon(verticesB, axis)

            if (minA > maxB || minB > maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) [depth, normal] = [overlap, axis]

            let closestPoint = findClosestLineSegmentPoint(transformA.position, start, end)
            let distanceSq = FMath.distanceSq(transformA.position, closestPoint)

            if (distanceSq < minDistanceSq) [minDistanceSq, pointB] = [distanceSq, closestPoint]
        }

        let direction = Vector.subtract(transformB.position, transformA.position)

        if (FMath.dot(direction, normal) < 0) normal = normal.negative

        return {
            contacts: new Pair(pointA, pointB),
            normal, depth
        }
    }
    export function findCirclePolygonCollisionPoints(
        circleCollider: Colliders.CircleCollider, circleTransform: Transform,
        polygonCollider: Colliders.PolygonCollider, polygonTransform: Transform
    ): CollisionPoints | undefined {
        let polygonVertices = polygonCollider.getTransformedVertices(polygonTransform)

        let depth = Number.POSITIVE_INFINITY
        let normal = Vector.ZERO

        let minDistanceSq = Number.POSITIVE_INFINITY
        let pointA = Vector.ZERO

        for (let i = 0; i < polygonVertices.length; i++) {
            let start = polygonVertices[i]
            let end = polygonVertices[(i + 1) % polygonVertices.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = projectPolygon(polygonVertices, axis)
            let [minB, maxB] = projectCircle(circleTransform.position, circleCollider.radius, axis)

            if (minA > maxB || minB > maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) [depth, normal] = [overlap, axis]

            let closestPoint = findClosestLineSegmentPoint(circleTransform.position, start, end)
            let distanceSq = FMath.distanceSq(circleTransform.position, closestPoint)

            if (distanceSq < minDistanceSq) [minDistanceSq, pointA] = [distanceSq, closestPoint]
        }

        let closestPoint = findClosestPolygonPoint(circleTransform.position, polygonVertices)
        let axis = Vector.subtract(closestPoint, circleTransform.position).normalized

        let [minA, maxA] = projectPolygon(polygonVertices, axis)
        let [minB, maxB] = projectCircle(circleTransform.position, circleCollider.radius, axis)

        if (minA > maxB || minB > maxA) return

        let overlap = Math.min(maxB - minA, maxA - minB)

        if (overlap < depth) [depth, normal] = [overlap, axis]

        let direction = Vector.subtract(polygonTransform.position, circleTransform.position)

        if (FMath.dot(direction, normal) < 0) normal = normal.negative

        let pointB = Vector.add(circleTransform.position, Vector.multiply(normal, circleCollider.radius))

        return {
            contacts: new Pair(pointA, pointB),
            normal, depth
        }
    }
}