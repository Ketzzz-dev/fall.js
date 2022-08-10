import { Vector } from '../Vector'
import { Transform } from '../Transform'
import { CircleCollider, PolygonCollider } from './Colliders'
import { CollisionPoints } from './CollisionManifold'
import { MathF } from '../../utility/MathF'

export namespace Collisions {
    export function projectVertices(vertices: Vector[], axis: Vector): [min: number, max: number] {
        let min = Number.MAX_VALUE
        let max = Number.MIN_VALUE

        for (let vertex of vertices) {
            let projection = MathF.dot(vertex, axis)

            if (projection < min) min = projection
            if (projection > max) max = projection
        }

        return [min, max]
    } 

    export function findCircleCollisionPoints(colliderA: CircleCollider, transformA: Transform, colliderB: CircleCollider, transformB: Transform): CollisionPoints | void {
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
    export function findPolygonCollisionPoints(colliderA: PolygonCollider, transformA: Transform, colliderB: PolygonCollider, transformB: Transform): CollisionPoints | void {
        let colliderAVertices = colliderA.getTransformedVertices(transformA)
        let otherVertices = colliderB.getTransformedVertices(transformB)

        let depth = Number.MAX_VALUE
        let normal = Vector.ZERO

        for (let i = 0; i < colliderAVertices.length; i++) {
            let start = colliderAVertices[i]
            let end = colliderAVertices[(i + 1) % colliderAVertices.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = Collisions.projectVertices(colliderAVertices, axis)
            let [minB, maxB] = Collisions.projectVertices(otherVertices, axis)

            if (minA > maxB || minB > maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) {
                depth = overlap
                normal = axis
            }
        }
        for (let i = 0; i < otherVertices.length; i++) {
            let start = otherVertices[i]
            let end = otherVertices[(i + 1) % otherVertices.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = Collisions.projectVertices(colliderAVertices, axis)
            let [minB, maxB] = Collisions.projectVertices(otherVertices, axis)

            if (minA > maxB || minB > maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) {
                depth = overlap
                normal = axis
            }
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