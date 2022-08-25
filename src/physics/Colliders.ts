import { AABB } from '../geometry/AABB'
import { FMath } from '../utility/FMath'
import { Transform } from './Transform'
import { Vector } from './Vector'

export abstract class Collider {
    
    public abstract getBounds(parentTransform: Transform): AABB
}

export class CircleCollider extends Collider {
    public readonly radius: number
    
    public constructor (radius: number) {
        super()

        this.radius = radius
    }

    public getBounds(parentTransform: Transform): AABB {
        let { position } = parentTransform

        return new AABB(
            new Vector(position.x - this.radius, position.y - this.radius),
            new Vector(position.x + this.radius, position.y + this.radius)
        )
    }
}
export class PolygonCollider extends Collider {
    public static readonly MIN_VERTICES = 3
    public static readonly MAX_VERTICES = 25
    
    private _localVertices: Vector[]

    public constructor (vertices: Vector[]) {
        super()

        this._localVertices = vertices
    }

    public getTransformedVertices(parentTransform: Transform): Vector[] {
        let { position, rotation } = parentTransform

        return this._localVertices.map(v => Vector.add(
            FMath.rotate(v, rotation),
            position
        ))
    }

    public getBounds(parentTransform: Transform): AABB {
        let minX = Number.POSITIVE_INFINITY
        let minY = Number.POSITIVE_INFINITY
        let maxX = Number.NEGATIVE_INFINITY
        let maxY = Number.NEGATIVE_INFINITY

        let thisVertices = this.getTransformedVertices(parentTransform)

        for (let vertex of thisVertices) {
            if (vertex.x < minX) minX = vertex.x
            if (vertex.y < minY) minY = vertex.y
            if (vertex.x > maxX) maxX = vertex.x
            if (vertex.y > maxY) maxY = vertex.y
        }

        return new AABB(new Vector(minX, minY), new Vector(maxX, maxY))
    }
}
// export class CapsuleCollider extends Collider {
//     public readonly length: number
//     public readonly radius: number

//     public constructor (length: number, radius: number) {
//         super()
        
//         this.length = length
//         this.radius = radius
//     }

//     public getBounds(parentTransform: Transform): AABB {
//         throw new Error('Method not implemented.')
//     }
    
// }