import { FMath } from '../utility/FMath'
import { RigidBody } from './RigidBody'
import { CircleCollider, PolygonCollider } from './collisions/Colliders'
import { Vector } from './Vector'


export namespace Shapes {
    export interface BaseShapeOptions {
        position: Vector
        rotation?: number
        density: number
        restitution: number
        isStatic?: boolean
    }

    export interface CircleOptions extends BaseShapeOptions {
        radius: number
    }
    export interface RectangleOptions extends BaseShapeOptions {
        width: number
        height: number
    }
    export interface PolygonOptions extends BaseShapeOptions {
        sides: number
        radius: number
    }

    export function circle(options: Shapes.CircleOptions): RigidBody {
        let { radius, density, position, rotation, isStatic, restitution } = options

        let area = radius * radius * Math.PI
        let mass = area * density
        let inertia = (1 / 2) * mass * (radius * radius)

        return new RigidBody({
            position, rotation, mass, inertia, density, area, isStatic, restitution,
            collider: new CircleCollider(radius)
        })
    }
    export function rectangle(options: Shapes.RectangleOptions): RigidBody {
        let { width, height, density, position, rotation, isStatic, restitution } = options
        
        let left = .5 * -width
        let right = left + width
        let top = .5 * -height
        let bottom = top + height
        
        let vertices = [
            new Vector(left, top),
            new Vector(right, top),
            new Vector(right, bottom),
            new Vector(left, bottom)
        ]
        
        let area = width * height
        let mass = area * density
        let inertia = (1 / 12) * mass * (width * width + height * height)

        return new RigidBody({
            position, rotation, mass, inertia, density, area, isStatic, restitution,
            collider: new PolygonCollider(vertices)
        })
    }
    export function polygon(options: Shapes.PolygonOptions): RigidBody {
        let { sides, radius, position, rotation, density, isStatic, restitution } = options

        let theta = FMath.TWO_PI / sides

        let vertices = Array<Vector>(sides)

        for (let i = 0; i < sides; i++) {
            let angle = i * theta

            vertices[i] = new Vector(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            )
        }

        let area = (radius * radius * sides * Math.sin(theta)) / 2
        let mass = area * density
        let sin = Math.sin(Math.PI / sides)
        let inertia = (1 / 2) * mass * (radius * radius) * (1 - (2 / 3) * (sin * sin))

        return new RigidBody({
            position, rotation, mass, inertia, density, area, isStatic, restitution,
            collider: new PolygonCollider(vertices)
        })
    }
}