import { AABB } from '../../geometry/AABB'
import { MathF } from '../../utility/MathF'
import { Transform } from '../Transform'
import { Vector } from '../Vector'
import { CollisionPoints } from './CollisionManifold'
import { Collisions } from './Collisions'

/**
 * The namespace of different shape colliders.
 */
export namespace Colliders {
    export function intersects(
        colliderA: BaseCollider, transformA: Transform,
        colliderB: BaseCollider, transformB: Transform
    ): CollisionPoints | undefined {
        if (!AABB.overlaps(colliderA.getBounds(transformA), colliderB.getBounds(transformB)))
            return

        if (colliderA instanceof CircleCollider) {
            if (colliderB instanceof CircleCollider) {
                return Collisions.findCircleCollisionPoints(colliderA, transformA, colliderB, transformB)
            } else if (colliderB instanceof PolygonCollider) {
                return Collisions.findCirclePolygonCollisionPoints(colliderA, transformA, colliderB, transformB)
            }
        } else if (colliderA instanceof PolygonCollider) {
            if (colliderB instanceof CircleCollider) {
                let points = Collisions.findCirclePolygonCollisionPoints(colliderB, transformB, colliderA, transformA)

                if (points) points.normal = points.normal.negative

                return points
            } else if (colliderB instanceof PolygonCollider) {
                return Collisions.findPolygonCollisionPoints(colliderA, transformA, colliderB, transformB)
            }
        }

        return
    }

    export abstract class BaseCollider {
        
        public abstract getBounds(parentTransform: Transform): AABB
    }

    export class CircleCollider extends BaseCollider {
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
    export class PolygonCollider extends BaseCollider {
        public static readonly MIN_VERTICES = 3
        public static readonly MAX_VERTICES = 25

        private _vertices: Vector[]

        public constructor (vertices: Vector[]) {
            super()

            this._vertices = vertices
        }

        public getTransformedVertices(parentTransform: Transform): Vector[] {
            return this._vertices.map(v => Vector.add(
                MathF.rotate(v, parentTransform.rotation),
                parentTransform.position
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
}