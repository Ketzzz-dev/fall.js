import { AABB } from '../../geometry/AABB'
import { MathF } from '../../utility/MathF'
import { Transform } from '../Transform'
import { Vector } from '../Vector'
import { CollisionPoints } from './CollisionManifold'
import { Algorithms } from './Algorithms'

/**
 * The namespace of different shape colliders.
 */
export namespace Colliders {
    /**
     * An abstract base struct that can be stored, and tested for collision with other shape colliders.
     */
    export abstract class BaseCollider {
        /**
         * Returns the points of collision between the collider and an arbitrary collider if there was intersection.
         * 
         * @param thisTransform The transform of the collider's parent body.
         * @param otherCollider The collider to test collision with.
         * @param otherTransform The transform to test collision with.
         */
        public testCollision(thisTransform: Transform, otherCollider: BaseCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            if (!AABB.overlaps(this.getBounds(thisTransform), otherCollider.getBounds(otherTransform)))
                return

            // return Algorithms.gjk(this, thisTransform, otherCollider, otherTransform)

            if (otherCollider instanceof CircleCollider) {
                return this.testCircleCollision(thisTransform, otherCollider, otherTransform)
            } else if (otherCollider instanceof PolygonCollider) {
                return this.testPolygonCollision(thisTransform, otherCollider, otherTransform)
            } else return otherCollider.testCollision(otherTransform, this, thisTransform)
        }

        /**
         * Returns the bounding box of the collider.
         * 
         * @param thisTransform The transform of this collider's parent body.
         */
        public abstract getBounds(thisTransform: Transform): AABB
    
        /**
         * Returns the points of collision between the collider and a circle collider if there was intersection.
         * 
         * @param thisTransform The transform of the collider's parent body.
         * @param otherCollider The collider to test collision with.
         * @param otherTransform The transform to test collision with.
         */
        public abstract testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | undefined | null
        /**
         * Returns the points of collision between the collider and a polygon collider if there was intersection.
         * 
         * @param thisTransform The transform of the collider's parent body.
         * @param otherCollider The collider to test collision with.
         * @param otherTransform The transform to test collision with.
         */
        public abstract testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | undefined | null
    }
    
    /**
     * A struct that stores geometrical properties of a circle and can be tested for collision with other shape type colliders.
     */
    export class CircleCollider extends BaseCollider {
        /**
         * The radius of the circle.
         */
        public readonly radius: number
        
        /**
         * @param radius The radius of the circle
         */
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
            return Algorithms.findCircleCollisionPoints(this, thisTransform, otherCollider, otherTransform)
        }
        public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            return Algorithms.findCirclePolygonCollisionPoints(this, thisTransform, otherCollider, otherTransform)
        }
    }
    /**
     * A struct that stores geometrical properties of a polygon and can be tested for collision with other shape type colliders.
     */
    export class PolygonCollider extends BaseCollider {
        /**
         * A static constant that stores the minimum sides a polygon can have.
         */
        public static readonly MIN_SIDES = 3
        /**
         * A static constant that stores the maximum sides a polygon can have.
         */
        public static readonly MAX_SIDES = 25
    
        /**
         * The origin of the collider's vertices.
         */
        public readonly originVertices: Vector[]
    
        /**
         * @param vertices The vertices of the collider.
         */
        public constructor (vertices: Vector[]) {
            super()
    
            this.originVertices = vertices
        }
    
        /**
         * Returns the polygon's vertices translated and rotated to the collider's parent body's transform.
         * 
         * @param thisTransform The transform of the collider's parent body.
         * @returns 
         */
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
            let points = Algorithms.findCirclePolygonCollisionPoints(otherCollider, otherTransform, this, thisTransform)
    
            if (points)
                points.normal = points.normal.negative
    
            return points
        }
        public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): CollisionPoints | undefined | null {
            return Algorithms.findPolygonCollisionPoints(this, thisTransform, otherCollider, otherTransform)
        }
    }
}