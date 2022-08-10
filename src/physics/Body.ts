import { MathF } from '../utility/MathF'
import { Vector } from './Vector'
import { BaseCollider, CircleCollider, PolygonCollider } from './collisions/Colliders'
import { Transform } from './Transform'

export interface BodyOptions {
    position: Vector
    density: number
    area: number
    restitution: number
    collider: BaseCollider
}

export interface BaseShapeOptions {
    position: Vector
    density: number
    restitution: number
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

export class Body {
    public transform: Transform

    public linearVelocity = Vector.ZERO
    public force = Vector.ZERO
    public angularVelocity = 0
    public torque = 0

    public readonly density: number
    public readonly area: number
    public readonly restitution: number

    public readonly mass: number
    public readonly inverseMass: number

    public readonly collider: BaseCollider

    public static circle(options: CircleOptions): Body {
        let { radius, density, position, restitution } = options

        let area = radius * radius * Math.PI

        return new Body({
            position, density, area, restitution,
            collider: new CircleCollider(radius)
        })
    }
    public static rectangle(options: RectangleOptions): Body {
        let { width, height, density, position, restitution } = options
        
        let area = width * height

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

        return new Body({
            position, density, area, restitution,
            collider: new PolygonCollider(vertices)
        })
    }
    public static polygon(options: PolygonOptions): Body {
        let { sides, radius, position, density, restitution } = options

        let theta = MathF.TWO_PI / sides

        let vertices = Array<Vector>()

        for (let i = 0; i < sides; i++) {
            let angle = i * theta

            vertices.push(new Vector(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            ))
        }

        let area = 2 / (radius * radius * sides * Math.sin(Math.PI * 2 / sides))

        return new Body({
            position, density, area, restitution,
            collider: new PolygonCollider(vertices)
        })
    }

    public constructor (options: BodyOptions) {
        let { position, density, area, restitution, collider } = options

        this.transform = new Transform(position)

        this.density = density
        this.area = area

        this.mass = area * density
        this.inverseMass = 1 / this.mass

        this.restitution = MathF.clamp(restitution)

        this.collider = collider
    }

    public step(delta: number, gravity: Vector) {
        this.force = Vector.add(this.force, Vector.multiply(this.mass, gravity))

        let acceleration = Vector.divide(this.force, this.mass)

        this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(acceleration, delta))
        this.transform.position = Vector.add(this.transform.position, Vector.multiply(this.linearVelocity, delta))
        
        this.force = Vector.ZERO
    }
}