import { RenderableObjectConfig, Renderer, RenderingOptions } from '../core/Renderer'
import { Vector, Transform, FMath } from '../math'
import { Collider } from './Collider'
import { Material } from './Material'

export interface RigidBodyOptions {
    transform: Transform
    collider: Collider
    material: Material
    area: number
    mass: number
    inertia: number
    isStatic?: boolean
    rendering?: RenderingOptions
}

export class RigidBody {
    public transform: Transform

    public linearVelocity = Vector.ZERO
    public force = Vector.ZERO
    public angularVelocity = 0
    public torque = 0   

    public readonly material: Material
    public readonly area: number

    public readonly mass: number
    public readonly inverseMass: number
    public readonly inertia: number
    public readonly inverseInertia: number

    public readonly isStatic: boolean

    public readonly collider: Collider
    public readonly rendering: RenderableObjectConfig

    public constructor (options: RigidBodyOptions) {
        let { transform, collider, rendering, material, area, isStatic, mass, inertia } = options

        this.transform = transform
        this.collider = collider
        this.rendering = Renderer.setConfig(rendering)

        this.material = material
        this.area = area

        this.isStatic = isStatic ?? false

        // static checking
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
    }

    public applyImpulse(impulse: Vector, impulsePoint = this.transform.position): void {
        this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(this.inverseMass, impulse))
        this.angularVelocity += this.inverseInertia * FMath.cross(impulsePoint, impulse)
    }

    public update(delta: number): void {
        if (this.isStatic) return

        // force integration
        let linearAcceleration = Vector.multiply(this.force, this.inverseMass)
        let angularAcceleration = this.torque * this.inverseInertia

        this.linearVelocity = Vector.add(this.linearVelocity, Vector.multiply(linearAcceleration, delta)),
        this.angularVelocity += angularAcceleration * delta

        let { transform } = this

        // velocity integration
        transform.translate(Vector.multiply(this.linearVelocity, delta))
        transform.rotate(this.angularVelocity * delta)

        // reset forces
        this.force = Vector.ZERO
        this.torque = 0
    }
}