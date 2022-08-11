import { Vector } from '../Vector'
import { Transform } from '../Transform'
import { Colliders } from './Colliders'
import { CollisionPoints } from './CollisionManifold'
import { MathF } from '../../utility/MathF'

export namespace Collisions {
    export type Projection = [min: number, max: number]

    export function findClosestPointOnPolygon(center: Vector, polygonVertices: Vector[]): Vector {
        let point = Vector.ZERO
        let minDistance = Number.MAX_VALUE

        for (let vertex of polygonVertices) {
            let distance = MathF.distance(vertex, center)

            if (distance < minDistance) [minDistance, point] = [distance, vertex]
        }

        return point
    }

    export function projectPolygon(polygonVertices: Vector[], axis: Vector): Projection {
        let min = Number.MAX_VALUE
        let max = Number.MIN_VALUE

        for (let vertex of polygonVertices) {
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

        if (min > max) [min, max] = [max, min]

        return [min, max]
    }

    export function findCircleCollisionPoints(colliderA: Colliders.CircleCollider, transformA: Transform, colliderB: Colliders.CircleCollider, transformB: Transform): CollisionPoints | undefined | null {
        let radii = colliderA.radius + colliderB.radius
        let delta = Vector.subtract(transformB.position, transformA.position)
        let distance = delta.magnitude

        if (distance > radii) return

        let depth = radii - distance
        let normal = delta.normalized

        return {
            a: Vector.multiply(normal, colliderA.radius),
            b: Vector.multiply(normal.negative, colliderB.radius),
            normal, depth
        }
    }
    export function findPolygonCollisionPoints(colliderA: Colliders.PolygonCollider, transformA: Transform, colliderB: Colliders.PolygonCollider, transformB: Transform): CollisionPoints | undefined | null {
        let verticesA = colliderA.getTransformedVertices(transformA)
        let verticesB = colliderB.getTransformedVertices(transformB)

        let depth = Number.MAX_VALUE
        let normal = Vector.ZERO

        for (let i = 0; i < verticesA.length; i++) {
            let start = verticesA[i]
            let end = verticesA[(i + 1) % verticesA.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = Collisions.projectPolygon(verticesA, axis)
            let [minB, maxB] = Collisions.projectPolygon(verticesB, axis)

            if (minA >= maxB || minB >= maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) [depth, normal] = [overlap, axis]
        }
        for (let i = 0; i < verticesB.length; i++) {
            let start = verticesB[i]
            let end = verticesB[(i + 1) % verticesB.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = Collisions.projectPolygon(verticesA, axis)
            let [minB, maxB] = Collisions.projectPolygon(verticesB, axis)

            if (minA >= maxB || minB >= maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) [depth, normal] = [overlap, axis]
        }

        let direction = Vector.subtract(transformB.position, transformA.position)

        if (MathF.dot(direction, normal) < 0)
            normal = normal.negative

        return {
            a: Vector.ZERO, b: Vector.ZERO,
            normal, depth
        }
    }
    export function findCirclePolygonCollisionPoints(colliderA: Colliders.CircleCollider, transformA: Transform, colliderB: Colliders.PolygonCollider, transformB: Transform): CollisionPoints | undefined | null {
        let polygonVertices = colliderB.getTransformedVertices(transformB)

        let depth = Number.MAX_VALUE
        let normal = Vector.ZERO

        for (let i = 0; i < polygonVertices.length; i++) {
            let start = polygonVertices[i]
            let end = polygonVertices[(i + 1) % polygonVertices.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = Collisions.projectPolygon(polygonVertices, axis)
            let [minB, maxB] = Collisions.projectCircle(transformA.position, colliderA.radius, axis)

            if (minA >= maxB || minB >= maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) {
                depth = overlap
                normal = axis
            }
        }

        let closestPoint = findClosestPointOnPolygon(transformA.position, polygonVertices)
        let axis = Vector.subtract(closestPoint, transformA.position).normalized

        let [minA, maxA] = Collisions.projectPolygon(polygonVertices, axis)
        let [minB, maxB] = Collisions.projectCircle(transformA.position, colliderA.radius, axis)

        if (minA >= maxB || minB >= maxA) return

        let overlap = Math.min(maxB - minA, maxA - minB)

        if (overlap < depth) {
            depth = overlap
            normal = axis
        }

        let direction = Vector.subtract(transformB.position, transformA.position)

        if (MathF.dot(direction, normal) < 0)
            normal = normal.negative

        return {
            a: Vector.ZERO, b: Vector.ZERO,
            normal, depth
        }
    }
}