import { RenderingOptions } from '../core/Renderer'
import { FMath, Transform, Vector } from '../math'
import { Collider } from './Collider'
import { Material } from './Material'
import { RigidBody } from './RigidBody'

export namespace Shapes {
    export interface BaseShapeOptions {
        position?: Vector
        scale?: number
        orientation?: number
        material: Material
        isStatic?: boolean
        rendering?: RenderingOptions
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

    export function circle(options: CircleOptions): RigidBody {
        let { radius, material, position, scale, orientation, isStatic, rendering } = options

        let area = radius * radius * Math.PI
        let mass = area * material.density
        let inertia = (1 / 2) * mass * (radius * radius)

        let transform = new Transform(position, scale, orientation)

        return new RigidBody({
            transform, mass, inertia, material, isStatic,
            collider: new Collider.Circle(transform, radius), rendering
        })
    }
    export function rectangle(options: RectangleOptions): RigidBody {
        let { width, height, material, position, scale, orientation, isStatic, rendering } = options

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
        let mass = area * material.density
        let inertia = (1 / 12) * mass * (width * width + height * height)

        let transform = new Transform(position, scale, orientation)

        return new RigidBody({
            transform, mass, inertia, material, isStatic,
            collider: new Collider.Polygon(transform, vertices), rendering
        })
    }
    export function polygon(options: PolygonOptions): RigidBody {
        let { sides, radius, position, scale, orientation, material, isStatic, rendering } = options

        let theta = FMath.TWO_PI / sides

        let vertices = [] as Vector[]

        for (let i = 0; i < sides; i++) {
            let angle = i * theta

            vertices.push(new Vector(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            ))
        }

        let area = (radius * radius * sides * Math.sin(theta)) / 2
        let mass = area * material.density
        let sin = Math.sin(Math.PI / sides)
        let inertia = (1 / 2) * mass * (radius * radius) * (1 - (2 / 3) * (sin * sin))

        let transform = new Transform(position, scale, orientation)

        return new RigidBody({
            transform, mass, inertia, material, isStatic,
            collider: new Collider.Polygon(transform, vertices), rendering
        })
    }
}