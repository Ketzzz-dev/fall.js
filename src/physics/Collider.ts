import assert from 'assert'
import { AABB } from '../geometry'
import { FMath, Transform, Vector } from '../math'

export abstract class Collider {
    public readonly parentTransform: Transform

    public abstract get bounds(): AABB

    protected constructor (parentTransform: Transform) {
        this.parentTransform = parentTransform
    }
}
export namespace Collider {
    export class Circle extends Collider {
        public readonly radius: number
        
        public get bounds(): AABB {
            let { position } = this.parentTransform

            return new AABB(
                new Vector(position.x - this.radius, position.y - this.radius),
                new Vector(position.x + this.radius, position.y + this.radius)
            )
        }

        public constructor (parentTransform: Transform, radius: number) {
            super(parentTransform)
    
            this.radius = radius
        }
    }
    export class Polygon extends Collider {
        public static readonly MIN_VERTICES = 3
        public static readonly MAX_VERTICES = 25
        
        private _localVertices: Vector[]
    
        public get vertices(): Vector[] {
            return this._localVertices.map(v => Vector.transform(v, this.parentTransform))
        }
        public get bounds(): AABB {
            let minX = Infinity
            let minY = Infinity
            let maxX = -Infinity
            let maxY = -Infinity

            for (let vertex of this.vertices) {
                if (vertex.x < minX) minX = vertex.x
                if (vertex.y < minY) minY = vertex.y
                if (vertex.x > maxX) maxX = vertex.x
                if (vertex.y > maxY) maxY = vertex.y
            }

            return new AABB(new Vector(minX, minY), new Vector(maxX, maxY))
        }
    
        public constructor (parentTransform: Transform, vertices: Vector[]) {
            super(parentTransform)
            
            assert(vertices.length >= Polygon.MIN_VERTICES && vertices.length <= Polygon.MAX_VERTICES,)
            
            this._localVertices = vertices
        }
    }
    
}