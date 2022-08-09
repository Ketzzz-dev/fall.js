import { Common } from '@Math/Common'
import { Vector } from '@Math/Vector'
import { BaseCollider, CircleCollider } from './Collisions/Colliders'
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

    private constructor (options: BodyOptions) {
        let { position, density, area, restitution, collider } = options

        this.transform = new Transform(position)

        this.density = density
        this.area = area

        this.mass = area * density
        this.inverseMass = 1 / this.mass

        this.restitution = Common.clamp(restitution)

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