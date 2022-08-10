import { MathF } from '../../utility/MathF'
import { Transform } from '../Transform'
import { Vector } from '../Vector'
import { CollisionPoints } from './CollisionManifold'
import { Collisions } from './Collisions'

export abstract class BaseCollider {

    public testCollision(thisTransform: Transform, otherCollider: BaseCollider, otherTransform: Transform): CollisionPoints | void {
        if (otherCollider instanceof CircleCollider) {
            return this.testCircleCollision(thisTransform, otherCollider, otherTransform)
        } else if (otherCollider instanceof PolygonCollider) {
            return this.testPolygonCollision(thisTransform, otherCollider, otherTransform)
        } else return otherCollider.testCollision(otherTransform, this, thisTransform)
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
        return Collisions.findCircleCollisionPoints(this, thisTransform, otherCollider, otherTransform)
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
            MathF.rotate(v, thisTransform.rotation),
            thisTransform.position
        ))
    }

    public testCircleCollision(thisTransform: Transform, otherCollider: CircleCollider, otherTransform: Transform): void | CollisionPoints {
        
    }
    public testPolygonCollision(thisTransform: Transform, otherCollider: PolygonCollider, otherTransform: Transform): void | CollisionPoints {
        return Collisions.findPolygonCollisionPoints(this, thisTransform, otherCollider, otherTransform)
    }
}