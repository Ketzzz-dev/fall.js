import { Common } from '@Math/Common'
import { Vector } from '@Math/Vector'
import { Transform } from '@Physics/Transform'
import { CollisionPoints } from './CollisionManifold'
export abstract class BaseCollider {

    public abstract testCircleCollision(transform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | void
}

export class CircleCollider extends BaseCollider {
    public readonly radius: number
    
    public constructor (radius: number) {
        super()
        
        this.radius = radius
    }
    
    public testCircleCollision(transform: Transform, otherCollider: CircleCollider, otherTransform: Transform): CollisionPoints | void {
        let radii = this.radius + otherCollider.radius
        let delta = Vector.subtract(otherTransform.position, transform.position)
        let distance = Common.magnitude(delta)

        if (distance > radii) return

        let depth = radii - distance
        let normal = Common.normalize(delta)

        return {
            a: Vector.multiply(normal, this.radius),
            b: Vector.multiply(normal.negative, otherCollider.radius),
            normal, depth
        }
    }
}