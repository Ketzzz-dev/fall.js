import { FMath } from '../utility/FMath'
import { Vector } from './Vector'
import { Transform } from './Transform'
import { Collider } from './Colliders'

export interface RigidBodyOptions {
    position: Vector
    scale?: Vector
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
        let { position, scale, rotation, collider, density, area, mass, inertia, isStatic, restitution } = options

        this.transform = new Transform(position, scale, rotation)
        this.collider = collider

        this.density = density
        this.area = area

        this.isStatic = isStatic ?? false

        if (this.isStatic) {
            this.mass = 0
            this.inverseMass = 0
            this.inertia = 0
            this.inverseInertia = 0
        } else {
            this.mass = mass
            this.inverseMass = 1 / this.mass
            this.inertia = inertia
            this.inverseInertia = 1 / this.inertia
        }

        this.restitution = FMath.clamp(restitution)
    }

    // public applyImpulse(impulse: Vector, impulsePoint = this.transform.position): void {
    //     this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(this.inverseMass, impulse))
    //     this.angularVelocity += this.inverseInertia * FMath.cross(impulsePoint, impulse)
    // }

    public update(delta: number): void {
        if (this.isStatic) return

        // force integration
        let linearAcceleration = Vector.multiply(this.force, this.inverseMass)
        let angularAcceleration = this.torque * this.inverseInertia

        this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(linearAcceleration, delta)),
        this.angularVelocity += angularAcceleration * delta

        let { transform } = this

        // velocity integration
        transform.position = Vector.add(this.transform.position, Vector.multiply(this.linearVelocity, delta))
        transform.rotation += this.angularVelocity * delta
        transform.rotation += transform.rotation > FMath.TWO_PI ? -FMath.TWO_PI : FMath.TWO_PI

        // reset forces
        this.force = Vector.ZERO
        this.torque = 0
    }
}