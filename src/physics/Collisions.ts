import { FMath, Transform, Vector } from '../math'
import { Collider } from './Collider'
import { CollisionManifold } from './CollisionManifold'

export namespace Collisions {
    export function solve(manifold: CollisionManifold): boolean {
        let [bodyA, bodyB] = manifold.bodies

        if (bodyA.collider instanceof Collider.Circle) {
            if (bodyB.collider instanceof Collider.Circle) {
                return circleToCircle(manifold, bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
            } else if (bodyB.collider instanceof Collider.Polygon) {
                return circleToPolygon(manifold, bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
            }
        } else if (bodyA.collider instanceof Collider.Polygon) {
            if (bodyB.collider instanceof Collider.Circle) {
                return polygonToCircle(manifold, bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
            } else if (bodyB.collider instanceof Collider.Polygon) {
                return polygonToPolygon(manifold, bodyA.collider, bodyA.transform, bodyB.collider, bodyB.transform)
            }
        }

        return false
    }

    export type ProjectionInfo = [min: number, max: number]
    export type ClosestPointInfo = [closestPoint: Vector, distanceSq: number]

    export function projectPolygonOnAxis(polygonVertices: Vector[], axis: Vector): ProjectionInfo {
        let min = Infinity
        let max = -Infinity
        
        for (let vertex of polygonVertices) {
            let projection = FMath.dot(vertex, axis)
            
            if (projection < min) min = projection
            if (projection > max) max = projection
        }
        
        return [min, max]
    }
    export function projectCircleOnAxis(circleCenter: Vector, circleRadius: number, axis: Vector): ProjectionInfo {
        let pointToEdge = Vector.multiply(axis.normalized, circleRadius)
         
        let a = Vector.add(circleCenter, pointToEdge)
        let b = Vector.subtract(circleCenter, pointToEdge)

        let min = FMath.dot(a, axis)
        let max = FMath.dot(b, axis)

        if (min > max) [min, max] = [max, min]

        return [min, max]
    }

    export function closestPointOnSegment(point: Vector, start: Vector, end: Vector): ClosestPointInfo {
        let ab = Vector.subtract(end, start)
        let ap = Vector.subtract(point, start)

        let closestPoint = Vector.ZERO

        let projection = FMath.dot(ap, ab)
        let distanceSq = projection / ab.magnitudeSq

        if (distanceSq < 0) closestPoint = start
        else if (distanceSq > 1) closestPoint = end
        else closestPoint = Vector.add(start, Vector.multiply(ab, distanceSq))

        return [closestPoint, FMath.distanceSq(point, closestPoint)]
    }
    export function closestPointOnPolygon(point: Vector, polygonVertices: Vector[]): ClosestPointInfo {
        let closestPoint = Vector.ZERO
        let minDistanceSq = Infinity

        for (let vertex of polygonVertices) {
            let distanceSq = FMath.distanceSq(vertex, point)

            if (distanceSq < minDistanceSq) {
                closestPoint = vertex
                minDistanceSq = distanceSq
            }
        }

        return [closestPoint, minDistanceSq]
    }

    export function circleToCircle(
        manifold: CollisionManifold,
        colliderA: Collider.Circle, transformA: Transform,
        colliderB: Collider.Circle, transformB: Transform
    ): boolean {
        let delta = Vector.subtract(transformB.position, transformA.position)

        let distanceSq = delta.magnitudeSq
        let totalRadius = colliderA.radius + colliderB.radius

        if (distanceSq >= totalRadius * totalRadius) return false

        let distance = Math.sqrt(distanceSq)

        if (distance == 0) {
            manifold.depth = colliderA.radius
            manifold.normal = Vector.RIGHT
            manifold.points = [transformA.position]
        } else {
            manifold.depth = totalRadius - distance
            manifold.normal = Vector.divide(delta, distance)
            manifold.points = [Vector.add(
                Vector.multiply(manifold.normal, colliderA.radius),
                transformA.position
            )]
        }   
        
        return true
    }
    export function polygonToPolygon(
        manifold: CollisionManifold,
        colliderA: Collider.Polygon, transformA: Transform,
        colliderB: Collider.Polygon, transformB: Transform
    ): boolean {
        let { vertices: verticesA } = colliderA
        let { vertices: verticesB } = colliderB

        let depth = Infinity
        let normal = Vector.ZERO

        let minDistanceSq = Infinity
        let pointA = Vector.ZERO
        let pointB = Vector.ZERO
        let contactPoints = 0

        for (let i = 0; i < verticesA.length; i++) {
            let start = verticesA[i]
            let end = i + 1 < verticesA.length ? verticesA[i + 1] : verticesA[0]
            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = projectPolygonOnAxis(verticesA, axis)
            let [minB, maxB] = projectPolygonOnAxis(verticesB, axis)

            if (minA > maxB || minB > maxA) return false

            let axisDepth = Math.min(maxA - minB, maxB - minA)

            if (axisDepth < depth) {
                depth = axisDepth
                normal = axis
            }

            for (let vertex of verticesB) {
                let [closestPoint, distanceSq] = closestPointOnSegment(vertex, start, end)

                if (FMath.fuzzyEquals(distanceSq, minDistanceSq)) {
                    if (
                        !FMath.fuzzyEquals(closestPoint, pointA) &&
                        !FMath.fuzzyEquals(closestPoint, pointB)
                    ) {
                        pointB = closestPoint
                        contactPoints = 2
                    }
                } else if (distanceSq < minDistanceSq) {
                    minDistanceSq = distanceSq
                    pointA = closestPoint
                    contactPoints = 1
                }
            }
        }
        for (let i = 0; i < verticesB.length; i++) {
            let start = verticesB[i]
            let end = i + 1 < verticesB.length ? verticesB[i + 1] : verticesB[0]
            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = projectPolygonOnAxis(verticesA, axis)
            let [minB, maxB] = projectPolygonOnAxis(verticesB, axis)

            if (minA > maxB || minB > maxA) return false

            let axisDepth = Math.min(maxA - minB, maxB - minA)

            if (axisDepth < depth) {
                depth = axisDepth
                normal = axis
            }

            for (let vertex of verticesA) {
                let [closestPoint, distanceSq] = closestPointOnSegment(vertex, start, end)

                if (FMath.fuzzyEquals(distanceSq, minDistanceSq)) {
                    if (
                        !FMath.fuzzyEquals(closestPoint, pointA) &&
                        !FMath.fuzzyEquals(closestPoint, pointB)
                    ) {
                        pointB = closestPoint
                        contactPoints = 2
                    }
                } else if (distanceSq < minDistanceSq) {
                    minDistanceSq = distanceSq
                    pointA = closestPoint
                    contactPoints = 1
                }
            }
        }

        let direction = Vector.subtract(transformB.position, transformA.position)

        if (FMath.dot(direction, normal) < 0) normal = normal.negative

        manifold.depth = depth
        manifold.normal = normal
        manifold.points = contactPoints == 1 ? [pointA] : [pointA, pointB]
        
        return true
    }
    export function circleToPolygon(
        manifold: CollisionManifold,
        colliderA: Collider.Circle, transformA: Transform,
        colliderB: Collider.Polygon, transformB: Transform
    ): boolean {
        let { vertices: polygonVertices } = colliderB

        let depth = Infinity
        let normal = Vector.ZERO

        let minDistanceSq = Infinity
        let contactPoint = Vector.ZERO

        for (let i = 0; i < polygonVertices.length; i++) {
            let start = polygonVertices[i]
            let end = i + 1 < polygonVertices.length ? polygonVertices[i + 1] : polygonVertices[0]
            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = projectCircleOnAxis(transformA.position, colliderA.radius, axis)
            let [minB, maxB] = projectPolygonOnAxis(polygonVertices, axis)

            if (minA > maxB || minB > maxA) return false

            let axisDepth = Math.min(maxA - minB, maxB - minA)

            if (axisDepth < depth) {
                depth = axisDepth
                normal = axis
            }

            let [closestPoint, distanceSq] = closestPointOnSegment(transformA.position, start, end)

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq
                contactPoint = closestPoint
            }
        }

        let [closestPoint] = closestPointOnPolygon(transformA.position, polygonVertices)

        let axis = Vector.subtract(closestPoint, transformA.position)

        let [minA, maxA] = projectCircleOnAxis(transformA.position, colliderA.radius, axis)
        let [minB, maxB] = projectPolygonOnAxis(polygonVertices, axis)

        if (minA > maxB || minB > maxA) return false

        let axisDepth = Math.min(maxA - minB, maxB - minA)

        if (axisDepth < depth) {
            depth = axisDepth
            normal = axis
        }

        let direction = Vector.subtract(transformB.position, transformA.position)

        if (FMath.dot(direction, normal) < 0) normal = normal.negative

        manifold.depth = depth
        manifold.normal = normal
        manifold.points = [contactPoint]

        return true
    }
    export function polygonToCircle(
        manifold: CollisionManifold,
        colliderA: Collider.Polygon, transformA: Transform,
        colliderB: Collider.Circle, transformB: Transform
    ): boolean {
        let collision = circleToPolygon(manifold, colliderB, transformB, colliderA, transformA)

        manifold.normal = manifold.normal.negative

        return collision
    }
}