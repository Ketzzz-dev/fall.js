import { MathF } from '../utility/MathF'
import { Vector } from './Vector'
import { Transform } from './Transform'
import { Collider } from './Colliders'

export interface RigidBodyOptions {
    position: Vector
    rotation?: number
    collider: Collider
    density: number
    area: number
    mass: number
    inertia: number
    restitution: number
    isStatic?: boolean
}

export class RigidBody {
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
    public readonly inertia: number
    public readonly inverseInertia: number

    public readonly isStatic: boolean

    public readonly collider: Collider

    public constructor (options: RigidBodyOptions) {
        let { position, rotation, collider, density, area, mass, inertia, isStatic, restitution } = options

        this.transform = new Transform(position, rotation)
        this.collider = collider

        this.density = density
        this.area = area

        this.isStatic = isStatic ?? false

        if (this.isStatic) {
            this.mass = Infinity
            this.inverseMass = 0
            this.inertia = Infinity
            this.inverseInertia = 0
        } else {
            this.mass = mass
            this.inverseMass = 1 / this.mass
            this.inertia = inertia
            this.inverseInertia = 1 / this.inertia
        }

        this.restitution = MathF.clamp(restitution)

    }

    public step(delta: number, gravity: Vector): void {
        if (this.isStatic)
            return

        this.force = Vector.add(this.force, Vector.multiply(this.mass, gravity))

        let linearAcceleration = Vector.multiply(this.force, this.inverseMass)
        let angularAcceleration = this.torque * this.inverseInertia

        this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(linearAcceleration, delta))
        this.angularVelocity += angularAcceleration * delta

        this.transform.position = Vector.add(this.transform.position, Vector.multiply(this.linearVelocity, delta))
        this.transform.rotation += this.angularVelocity * delta
        
        this.force = Vector.ZERO
        this.torque = 0
    }
}