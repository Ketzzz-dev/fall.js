import { MathF } from '../utility/MathF'
import { Body } from './Body'
import { Colliders } from './collisions/Colliders'
import { Vector } from './Vector'

export interface BaseShapeOptions {
    position: Vector
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

export namespace Shapes {
    export function circle(options: CircleOptions): Body {
        let { radius, density, position, isStatic, restitution } = options

        let area = radius * radius * Math.PI

        return new Body({
            position, density, area, isStatic, restitution,
            collider: new Colliders.CircleCollider(radius)
        })
    }
    export function rectangle(options: RectangleOptions): Body {
        let { width, height, density, position, isStatic, restitution } = options
        
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

        return new Body({
            position, density, area, isStatic, restitution,
            collider: new Colliders.PolygonCollider(vertices)
        })
    }
    export function polygon(options: PolygonOptions): Body {
        let { sides, radius, position, density, isStatic, restitution } = options

        let theta = MathF.TWO_PI / sides

        let vertices = Array<Vector>(sides)

        for (let i = 0; i < sides; i++) {
            let angle = i * theta

            vertices[i] = new Vector(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            )
        }

        let area = (radius * radius * sides * Math.sin(MathF.TWO_PI / sides)) / 2

        return new Body({
            position, density, area, isStatic, restitution,
            collider: new Colliders.PolygonCollider(vertices)
        })
    }
}