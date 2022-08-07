import { distance, distanceSqrd, dot, lengthSqrd, normalize } from "@FMath/Common"
import { Vector } from "@FMath/Vector"
import { AABB } from '@Geometry/AABB'
import { Body, ShapeType } from "./Body"

// THIS CODE IS VERY UGLY, PLEASE IGNORE FOR NOW AS I WILL REFORMAT AND OPTIMISE EVERYTHING

export type Intersection = [collision: boolean, normal: Vector, depth: number]
export type Projection = [min: number, max: number]
export type ContactPoints = [contactA: Vector, contactB: Vector, contactCount: number]

function getClosestPointOnPolygon(center: Vector, vertices: Vector[]): Vector {
    let point = Vector.ZERO
    let minDistance = Number.MAX_VALUE

    for (let vertex of vertices) {
        let dist = distance(vertex, center)

        if (dist < minDistance) {
            minDistance = dist
            point = vertex
        }
    }

    return point
}
function projectVertices(vertices: Vector[], axis: Vector): Projection {
    let min = Number.MAX_VALUE
    let max = Number.MIN_VALUE

    vertices.forEach(vertex => {
        let proj = dot(vertex, axis)

        if (proj < min) min = proj
        if (proj > max) max = proj
    })

    return [min, max]
}
function projectCircle(center: Vector, radius: number, axis: Vector): Projection {
    let direction = normalize(axis)
    let pointToEdge = Vector.mul(direction, radius)

    let pointA = Vector.add(center, pointToEdge)
    let pointB = Vector.sub(center, pointToEdge)

    let min = dot(pointA, axis)
    let max = dot(pointB, axis)

    if (min >= max)
        [min, max] = [max, min]

    return [min, max]
}
function pointSegmentDistance(p: Vector, a: Vector, b: Vector): [distanceSqrd: number, closestPoint: Vector] {
    let closestPoint = Vector.ZERO

    let ab = Vector.sub(b, a)
    let ap = Vector.sub(p, a)

    let proj = dot(ap, ab)
    let d = proj / lengthSqrd(ab)

    if (d <= 0)
        closestPoint = a
    else if (d >= 1)
        closestPoint = b
    else
        closestPoint = Vector.add(a, Vector.mul(ab, d))

    return [distanceSqrd(p, closestPoint), closestPoint]
}

export function collide(bodyA: Body, bodyB: Body): Intersection {
    let typeA = bodyA.type
    let typeB = bodyB.type

    if (typeA == ShapeType.Rectangle) {
        if (typeB == ShapeType.Rectangle) {
            return intersectPolygons(bodyA.position, bodyA.getTransformedVertices(), bodyB.position, bodyB.getTransformedVertices())
        } else if (typeB == ShapeType.Circle) {
            let [collision, normal, depth] = intersectCirclePolygon(bodyB.position, bodyB.radius, bodyA.position, bodyA.getTransformedVertices())
            
            return [collision, normal.negative, depth]
        }
    } else if (typeA == ShapeType.Circle) {
        if (typeB == ShapeType.Rectangle) {
            return intersectCirclePolygon(bodyA.position, bodyA.radius, bodyB.position, bodyB.getTransformedVertices())
        } else if (typeB == ShapeType.Circle) {
            return intersectCircles(bodyA.position, bodyA.radius, bodyB.position, bodyB.radius)
        }
    }

    return [false, Vector.ZERO, 0]
}
export function getContactPoints(bodyA: Body, bodyB: Body): ContactPoints {
    let contactA = Vector.ZERO
    let contactB = Vector.ZERO
    let contactCount = 0

    let typeA = bodyA.type
    let typeB = bodyB.type

    if (typeA == ShapeType.Rectangle) {
        if (typeB == ShapeType.Rectangle) {
            [contactA, contactB, contactCount] = getPolygonsContactPoints(bodyA.getTransformedVertices(), bodyB.getTransformedVertices())
        } else if (typeB == ShapeType.Circle) {
            contactA = getCirclePoygonContactPoint(bodyB.position, bodyB.radius, bodyA.position, bodyA.getTransformedVertices())
            contactCount = 1
        }
    } else if (typeA == ShapeType.Circle) {
        if (typeB == ShapeType.Rectangle) {
            contactA = getCirclePoygonContactPoint(bodyA.position, bodyA.radius, bodyB.position, bodyB.getTransformedVertices())
            contactCount = 1
        } else if (typeB == ShapeType.Circle) {
            contactA = getCirclesContactPoint(bodyA.position, bodyA.radius, bodyB.position)
            contactCount = 1
        }
    }

    return [contactA, contactB, contactCount]
}
export function intersectCircles(centerA: Vector, radiusA: number, centerB: Vector, radiusB: number): Intersection {
    let normal = Vector.ZERO
    let depth = 0
    
    let dist = distance(centerA, centerB)
    let radii = radiusA + radiusB

    if (dist >= radii)
        return [false, normal, depth]

    normal = normalize(Vector.sub(centerB, centerA))
    depth = radii - dist

    return [true, normal, depth]
}
export function intersectPolygons(centerA: Vector, verticesA: Vector[], centerB: Vector, verticesB: Vector[]): Intersection {
    let normal = Vector.ZERO
    let depth = Number.MAX_VALUE
    
    for (let i = 0; i < verticesA.length; i++) {
        let vertexA = verticesA[i]
        let vertexB = verticesA[(i + 1) % verticesA.length]

        let edge = Vector.sub(vertexB, vertexA)
        let axis = normalize(new Vector(-edge.y, edge.x))

        let [minA, maxA] = projectVertices(verticesA, axis)
        let [minB, maxB] = projectVertices(verticesB, axis)

        if (minA >= maxB || minB >= maxA)
            return [false, normal, depth]

        let axisDepth = Math.min(maxB - minA, maxA - minB)

        if (axisDepth < depth) {
            depth = axisDepth
            normal = axis
        }
    }
    for (let i = 0; i < verticesB.length; i++) {
        let vertexA = verticesB[i]
        let vertexB = verticesB[(i + 1) % verticesB.length]

        let edge = Vector.sub(vertexB, vertexA)
        let axis = normalize(new Vector(-edge.y, edge.x))

        let [minA, maxA] = projectVertices(verticesA, axis)
        let [minB, maxB] = projectVertices(verticesB, axis)

        if (minA >= maxB || minB >= maxA)
            return [false, normal, depth]
        
        let axisDepth = Math.min(maxB - minA, maxA - minB)

        if (axisDepth < depth) {
            depth = axisDepth
            normal = axis
        }
    }

    let direction = Vector.sub(centerB, centerA)

    if (dot(direction, normal) < 0)
        normal = normal.negative

    return [true, normal, depth]
}
export function intersectCirclePolygon(circleCenter: Vector, circleRadius: number, polygonCenter: Vector, polygonVertices: Vector[]): Intersection {
    let normal = Vector.ZERO
    let depth = Number.MAX_VALUE
    
    for (let i = 0; i < polygonVertices.length; i++) {
        let vertexA = polygonVertices[i]
        let vertexB = polygonVertices[(i + 1) % polygonVertices.length]

        let edge = Vector.sub(vertexB, vertexA)
        let axis = normalize(new Vector(-edge.y, edge.x))

        let [minA, maxA] = projectVertices(polygonVertices, axis)
        let [minB, maxB] = projectCircle(circleCenter, circleRadius, axis)

        if (minA >= maxB || minB >= maxA)
            return [false, normal, depth]

        let axisDepth = Math.min(maxB - minA, maxA - minB)

        if (axisDepth < depth) {
            depth = axisDepth
            normal = axis
        }
    }

    let closestPoint = getClosestPointOnPolygon(circleCenter, polygonVertices)
    let axis = normalize(Vector.sub(closestPoint, circleCenter))

    let [minA, maxA] = projectVertices(polygonVertices, axis)
    let [minB, maxB] = projectCircle(circleCenter, circleRadius, axis)

    if (minA >= maxB || minB >= maxA)
        return [false, normal, depth]

    let axisDepth = Math.min(maxB - minA, maxA - minB)

    if (axisDepth < depth) {
        depth = axisDepth
        normal = axis
    }

    let direction = Vector.sub(polygonCenter, circleCenter)

    if (dot(direction, normal) < 0)
        normal = normal.negative

    return [true, normal, depth]
}
export function intersectAABBs(a: AABB, b: AABB): boolean {
    return a.max.x > b.min.x && a.min.x < b.max.x &&
        a.max.y > b.min.y && a.min.y < b.max.y
}

function getCirclesContactPoint(centerA: Vector, radiusA: number, centerB: Vector): Vector {
    let direction = Vector.sub(centerB, centerA)

    direction = normalize(direction)

    return Vector.add(centerA, Vector.mul(direction, radiusA))
}
function getCirclePoygonContactPoint(circleCenter: Vector, circleRadius: number, polygonCenter: Vector, polygonVertices: Vector[]): Vector {
    let minDistance = Number.MAX_VALUE
    let contactPoint = Vector.ZERO

    for (let i = 0; i < polygonVertices.length; i++) {
        let vertexA = polygonVertices[i]
        let vertexB = polygonVertices[(i + 1) % polygonVertices.length]

        let [distSqrd, contact] = pointSegmentDistance(circleCenter, vertexA, vertexB)

        if (distSqrd < minDistance) {
            minDistance = distSqrd
            contactPoint = contact
        }
    }

    return contactPoint
}
function getPolygonsContactPoints(verticesA: Vector[], verticesB: Vector[]): ContactPoints {
    let contactA = Vector.ZERO
    let contactB = Vector.ZERO
    let contactCount = 0

    let minDistance = Number.MAX_VALUE

    for (let i = 0; i < verticesA.length; i++) {
        let p = verticesA[i]

        for (let j = 0; j < verticesB.length; j++) {
            let vertexA = verticesB[j]
            let vertexB = verticesB[(j + 1) % verticesB.length]

            let [distSqrd, contact] = pointSegmentDistance(p, vertexA, vertexB)

            if (Math.abs(distSqrd - minDistance) < 0.00005) {
                if (Math.abs(contact.x - contactA.x) >= 0.00005 || Math.abs(contact.y - contactA.y) >= 0.00005) {
                    contactB = contact
                    contactCount = 2
                }
            } else if (distSqrd < minDistance) {
                minDistance = distSqrd
                contactA = contact
                contactCount = 1
            }
        }
    }
    for (let i = 0; i < verticesB.length; i++) {
        let p = verticesB[i]

        for (let j = 0; j < verticesA.length; j++) {
            let vertexA = verticesA[j]
            let vertexB = verticesA[(j + 1) % verticesA.length]

            let [distSqrd, contact] = pointSegmentDistance(p, vertexA, vertexB)

            if (Math.abs(distSqrd - minDistance) < 0.0005) {
                if (Math.abs(contact.x - contactA.x) >= 0.0005 || Math.abs(contact.y - contactA.y) >= 0.0005) {
                    contactB = contact
                    contactCount = 2
                }
            } else if (distSqrd < minDistance) {
                minDistance = distSqrd
                contactA = contact
                contactCount = 1
            }
        }
    }

    return [contactA, contactB, contactCount]
}

