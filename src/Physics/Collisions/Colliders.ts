import { Common } from '@Math/Common'
import { Vector } from '@Math/Vector'
import { Transform } from '@Physics/Transform'
import { CollisionPoints } from './CollisionManifold'

export abstract class BaseCollider {

    public testCollision(thisTransform: Transform, otherCollider: BaseCollider, otherTransform: Transform): CollisionPoints | void {
        if (otherCollider instanceof CircleCollider) {
            return this.testCircleCollision(thisTransform, otherCollider, otherTransform)
        } else if (otherCollider instanceof PolygonCollider) {
            return this.testPolygonCollision(thisTransform, otherCollider, otherTransform)
        }
    }

    public abstract testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | void
    public abstract testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | void
}

export class CircleCollider extends BaseCollider {
    public readonly radius: number
    
    public constructor (radius: number) {
        super()
        
        this.radius = radius
    }
    
    public testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | void {
        let radii = this.radius + otherCollider.radius
        let delta = Vector.subtract(otherTransform.position, thisTransform.position)
        let distance = delta.magnitude

        if (distance > radii) return

        let depth = radii - distance
        let normal = delta.normalized

        return {
            a: Vector.multiply(normal, this.radius),
            b: Vector.multiply(normal.negative, otherCollider.radius),
            normal, depth
        }
    }
    public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): void | CollisionPoints {
        
    }
}
export class PolygonCollider extends BaseCollider {
    public readonly originVertices: Vector[]

    public constructor (vertices: Vector[]) {
        super()

        this.originVertices = vertices
    }

    public getTransformedVertices(thisTransform: Transform): Vector[] {
        return this.originVertices.map(v => Vector.add(
            Common.rotate(v, thisTransform.rotation),
            thisTransform.position
        ))
    }
    public projectVertices(vertices: Vector[], axis: Vector): [min: number, max: number] {
        let min = Number.MAX_VALUE
        let max = Number.MIN_VALUE

        for (let vertex of vertices) {
            let projection = Common.dot(vertex, axis)

            if (projection < min) min = projection
            if (projection > max) max = projection
        }

        return [min, max]
    } 

    public testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): void | CollisionPoints {
        
    }
    public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): void | CollisionPoints {
        let thisVertices = this.getTransformedVertices(thisTransform)
        let otherVertices = otherCollider.getTransformedVertices(otherTransform)

        let depth = Number.MAX_VALUE
        let normal = Vector.ZERO

        for (let i = 0; i < thisVertices.length; i++) {
            let start = thisVertices[i]
            let end = thisVertices[(i + 1) % thisVertices.length]

            let edge = Vector.subtract(end, start)
            let axis = new Vector(-edge.y, edge.x).normalized

            let [minA, maxA] = this.projectVertices(thisVertices, axis)
            let [minB, maxB] = this.projectVertices(otherVertices, axis)

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

            let [minA, maxA] = this.projectVertices(thisVertices, axis)
            let [minB, maxB] = this.projectVertices(otherVertices, axis)

            if (minA > maxB || minB > maxA) return

            let overlap = Math.min(maxB - minA, maxA - minB)

            if (overlap < depth) {
                depth = overlap
                normal = axis
            }
        }

        let direction = Vector.subtract(otherTransform.position, thisTransform.position)

        if (Common.dot(direction, normal) < 0)
            normal = normal.negative

        return {
            a: Vector.ZERO, b: Vector.ZERO,
            normal, depth
        }
    }
}