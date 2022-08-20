import { AABB } from '../geometry/AABB'
import { MathF } from '../utility/MathF'
import { Pair } from '../utility/Pair'
import { CircleCollider, PolygonCollider } from './Colliders'
import { CollisionPoints } from './CollisionManifold'
import { RigidBody } from './RigidBody'
import { Transform } from './Transform'
import { Vector } from './Vector'

export namespace Collisions {
    export type Projection = [min: number, max: number]

    export function collides(a: RigidBody, b: RigidBody): CollisionPoints | undefined {
        let { collider: colliderA, transform: transformA } = a
        let { collider: colliderB, transform: transformB } = b

        if (!AABB.overlaps(colliderA.getBounds(transformA), colliderB.getBounds(transformB)))
            return

        if (colliderA instanceof CircleCollider) {
            if (colliderB instanceof CircleCollider) {
                return Collisions.findCircleCollisionPoints(colliderA, transformA, colliderB, transformB)
            } else if (colliderB instanceof PolygonCollider) {
                return Collisions.findCirclePolygonCollisionPoints(colliderA, transformA, colliderB, transformB)
            }
        } else if (colliderA instanceof PolygonCollider) {
            if (colliderB instanceof CircleCollider) {
                let points = Collisions.findCirclePolygonCollisionPoints(colliderB, transformB, colliderA, transformA)

                if (points) points.normal = points.normal.negative

                return points
            } else if (colliderB instanceof PolygonCollider) {
                return Collisions.findPolygonCollisionPoints(colliderA, transformA, colliderB, transformB)
            }
        }

        return
    }

    export function projectPolygon(vertices: Vector[], axis: Vector): Projection {
        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (let vertex of vertices) {
            let projection = MathF.dot(vertex, axis)

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

        let min = MathF.dot(start, axis)
        let max = MathF.dot(end, axis)

        if (min >= max) [min, max] = [max, min]

        return [min, max]
    }

    export function findClosestPolygonPoint(point: Vector, polygonVertices: Vector[]): Vector {
        let closestPoint = Vector.ZERO
        let minDistance = Number.POSITIVE_INFINITY

        for (let vertex of polygonVertices) {
            let distance = MathF.distance(vertex, point)

            if (distance < minDistance) [minDistance, closestPoint] = [distance, vertex]
        }

        return closestPoint
    }
    export function findClosestLineSegmentPoint(point: Vector, start: Vector, end: Vector): Vector {
        let closestPoint = Vector.ZERO

        let ab = Vector.subtract(end, start)
        let ap = Vector.subtract(point, start)

        let projection = MathF.dot(ap, ab)
        let distanceSq = projection / ab.magnitudeSq

        if (distanceSq < 0) closestPoint = start
        else if (distanceSq > 1) closestPoint = end
        else closestPoint = Vector.add(start, Vector.multiply(ab, distanceSq))

        return closestPoint
    }

    export function findCircleCollisionPoints(
        colliderA: CircleCollider, transformA: Transform,
        colliderB: CircleCollider, transformB: Transform
    ): CollisionPoints | undefined {
        let delta = Vector.subtract(transformB.position, transformA.position)
        let totalRadius = colliderA.radius + colliderB.radius
        let distance = delta.magnitude

        if (distance > totalRadius) return

        let normal = delta.normalized

        return {
            contact: Vector.add(transformA.position, Vector.multiply(normal, colliderA.radius)),
            normal, depth: totalRadius - distance
        }
    }
    export function findPolygonCollisionPoints(
        colliderA: PolygonCollider, transformA: Transform,
        colliderB: PolygonCollider, transformB: Transform
    ): CollisionPoints | undefined {
        let verticesA = colliderA.getTransformedVertices(transformA)
        let verticesB = colliderB.getTransformedVertices(transformB)

        let depth = Number.POSITIVE_INFINITY
        let normal = Vector.ZERO

        let minDistanceSq = Number.POSITIVE_INFINITY
        let contact = Vector.ZERO

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
            let distanceSq = MathF.distanceSq(transformB.position, closestPoint)

            if (distanceSq < minDistanceSq) [minDistanceSq, contact] = [distanceSq, closestPoint]
        }
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
            let distanceSq = MathF.distanceSq(transformA.position, closestPoint)

            if (distanceSq < minDistanceSq) [minDistanceSq, contact] = [distanceSq, closestPoint]
        }

        let direction = Vector.subtract(transformB.position, transformA.position)

        if (MathF.dot(direction, normal) < 0) normal = normal.negative

        return { contact, normal, depth }
    }
    export function findCirclePolygonCollisionPoints(
        circleCollider: CircleCollider, circleTransform: Transform,
        polygonCollider: PolygonCollider, polygonTransform: Transform
    ): CollisionPoints | undefined {
        let polygonVertices = polygonCollider.getTransformedVertices(polygonTransform)

        let depth = Number.POSITIVE_INFINITY
        let normal = Vector.ZERO

        let minDistanceSq = Number.POSITIVE_INFINITY
        let contact = Vector.ZERO

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
            let distanceSq = MathF.distanceSq(circleTransform.position, closestPoint)

            if (distanceSq < minDistanceSq) [minDistanceSq, contact] = [distanceSq, closestPoint]
        }

        let closestPoint = findClosestPolygonPoint(circleTransform.position, polygonVertices)
        let axis = Vector.subtract(closestPoint, circleTransform.position).normalized

        let [minA, maxA] = projectPolygon(polygonVertices, axis)
        let [minB, maxB] = projectCircle(circleTransform.position, circleCollider.radius, axis)

        if (minA > maxB || minB > maxA) return

        let overlap = Math.min(maxB - minA, maxA - minB)

        if (overlap < depth) [depth, normal] = [overlap, axis]

        let direction = Vector.subtract(polygonTransform.position, circleTransform.position)

        if (MathF.dot(direction, normal) < 0) normal = normal.negative


        return { contact, normal, depth }
    }
}