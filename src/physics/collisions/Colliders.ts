import { AABB } from '../../geometry/AABB'
import { MathF } from '../../utility/MathF'
import { Transform } from '../Transform'
import { Vector } from '../Vector'
import { CollisionPoints } from './CollisionManifold'
import { Collisions } from './Collisions'

export namespace Colliders {
    export abstract class BaseCollider {
        public testCollision(thisTransform: Transform, otherCollider: BaseCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            if (!AABB.overlaps(this.getBounds(thisTransform), otherCollider.getBounds(otherTransform)))
                return

            if (otherCollider instanceof CircleCollider) {
                return this.testCircleCollision(thisTransform, otherCollider, otherTransform)
            } else if (otherCollider instanceof PolygonCollider) {
                return this.testPolygonCollision(thisTransform, otherCollider, otherTransform)
            } else return otherCollider.testCollision(otherTransform, this, thisTransform)
        }

        public abstract getBounds(thisTransform: Transform): AABB
    
        public abstract testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | undefined | null
        public abstract testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | undefined | null
    }
    
    export class CircleCollider extends BaseCollider {
        public readonly radius: number
        
        public constructor (radius: number) {
            super()
            
            this.radius = radius
        }

        public getBounds(thisTransform: Transform): AABB {
            let { position } = thisTransform

            return new AABB(
                new Vector(position.x - this.radius, position.y - this.radius),
                new Vector(position.x + this.radius, position.y + this.radius)
            )
        }
        
        public testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            return Collisions.findCircleCollisionPoints(this, thisTransform, otherCollider, otherTransform)
        }
        public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            return Collisions.findCirclePolygonCollisionPoints(this, thisTransform, otherCollider, otherTransform)
        }
    }
    export class PolygonCollider extends BaseCollider {
        public static readonly MIN_SIDES = 3
        public static readonly MAX_SIDES = 25
    
        public readonly originVertices: Vector[]
    
        public constructor (vertices: Vector[]) {
            super()
    
            this.originVertices = vertices
        }
    
        public getTransformedVertices(thisTransform: Transform): Vector[] {
            return this.originVertices.map(v => Vector.add(
                MathF.rotate(v, thisTransform.rotation),
                thisTransform.position
            ))
        }
        public getBounds(thisTransform: Transform): AABB {
            let minX = Number.MAX_VALUE
            let minY = Number.MAX_VALUE
            let maxX = Number.MIN_VALUE
            let maxY = Number.MIN_VALUE

            let thisVertices = this.getTransformedVertices(thisTransform)

            for (let vertex of thisVertices) {
                if (vertex.x < minX) minX = vertex.x
                if (vertex.y < minY) minY = vertex.y
                if (vertex.x > maxX) maxX = vertex.x
                if (vertex.y > maxY) maxY = vertex.y
            }

            return new AABB(new Vector(minX, minY), new Vector(maxX, maxY))
        }
    
        public testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            let points = Collisions.findCirclePolygonCollisionPoints(otherCollider, otherTransform, this, thisTransform)
    
            if (points)
                points.normal = points.normal.negative
    
            return points
        }
        public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            return Collisions.findPolygonCollisionPoints(this, thisTransform, otherCollider, otherTransform)
        }
    }
}