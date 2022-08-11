import { MathF } from '../utility/MathF'
import { Vector } from './Vector'
import { Colliders } from './collisions/Colliders'
import { Transform } from './Transform'

export interface BodyOptions {
    position: Vector
    density: number
    area: number
    restitution: number
    isStatic?: boolean
    collider: Colliders.BaseCollider
}

export class Body {
    public transform: Transform

    public linearVelocity = Vector.ZERO
    public force = Vector.ZERO
    public angularVelocity = 0

    public readonly density: number
    public readonly area: number
    public readonly restitution: number

    public readonly mass: number
    public readonly inverseMass: number

    public readonly isStatic: boolean

    public readonly collider: Colliders.BaseCollider

    public constructor (options: BodyOptions) {
        let { position, density, area, isStatic, restitution, collider } = options

        this.transform = new Transform(position)

        this.density = density
        this.area = area

        this.isStatic = isStatic ?? false

        this.mass = area * density
        this.inverseMass = this.isStatic ? 0 : 1 / this.mass

        this.restitution = MathF.clamp(restitution)

        this.collider = collider
    }

    public step(delta: number, gravity: Vector) {
        if (this.isStatic)
            return

        // velocity integration
        this.force = Vector.add(this.force, Vector.multiply(this.mass, gravity))

        let acceleration = Vector.divide(this.force, this.mass)

        this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(acceleration, delta))

        // position integration
        this.transform.position = Vector.add(this.transform.position, Vector.multiply(this.linearVelocity, delta))
        this.transform.rotation += this.angularVelocity
        
        this.force = Vector.ZERO
    }
}