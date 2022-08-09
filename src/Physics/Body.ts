import { Vector } from '@Math/Vector'

// TODO: update comments

/**
 * The configuration object passed to a body constructor.
 */
export interface BodyOptions {
    /**
     * The starting world-space position of the body.
     */
    position: Vector
    /**
     * The starting rotation, in radians, 0 radians if undefined.
     */
    rotation?: number
    /**
     * The body's density.
     */
    density: number
    /**
     * The body's mass.
     */
    mass: number
    /**
     * The body's restitution.
     */
    restitution: number
    /**
     * The body's area.
     */
    area: number
    /**
     * Whether or not the body is static, false if undefined.
     */
    isStatic?: boolean
}

/**
 * A physics object that stores information about it's position, velocities, rotation, mass, and whatnot.
 */
export class Body {
    /**
     * A vector that stores the current world-space position of the body.
     */
    private _position: Vector
    /**
     * A number that stores the current rotation of the body, in radians.
     */
    private _rotation: number

    /**
     * A vector that measures the current linear velocity of a body after the last step.
     */
    private _linearVelocity = Vector.ZERO
    /**
     * A vector that measures the current rotational velocity of a body after the last step.
     */
    private _rotationalVelocity = 0
    /**
     * A vector that stores the amount of force to apply in the next step. Is zeroed after the step.
     */
    private _force = Vector.ZERO

    /**
     * A number that stores the density of the body, in g/cm^3.
     */
    public readonly density: number
    /**
     * A number that stores the mass of the body. Is calculated in the constructor.
     */
    public readonly mass: number
    /**
     * A number that stores the inverse mass of the body (1 / mass). Is zeroed if the body is static.
     */
    public readonly inverseMass: number
    /**
     * A number that stores the restitution (elasticity) of the body. Is within the range 0.0 and 1.0.  
     */
    public readonly restitution: number
    /**
     * A number that stores the area of the body. Is calculated in the constructor.
     */
    public readonly area: number

    /**
     * A flag that indicates whether the body is static within the world.
     */
    public readonly isStatic: boolean

    /**
     * The options provided when this body was instantiated.
     */
    public readonly options: BodyOptions

    /**
     * A vector that stores the current world-space position of the body.
     */
    public get position(): Vector {
        return this._position
    }
    /**
     * A number that stores the current rotation of the body, in radians.
     */
    public get rotation(): number {
        return this._rotation
    }

    /**
     * A vector that measures the current linear velocity of a body after the last step.
     */
    public get linearVelocity(): Vector {
        return this._linearVelocity
    }
    /**
     * A vector that measures the current rotational velocity of a body after the last step.
     */
    public get rotationalVelocity(): number {
        return this._rotationalVelocity
    }
    /**
     * A vector that stores the amount of force to apply in the next step. Is zeroed after the step.
     */
    public get force(): Vector {
        return this.force
    }

    /**
     * @param options The options
     */
    private constructor (options: BodyOptions) {
        this.options = options

        let { position, rotation, density, mass, restitution, area, isStatic } = this.options

        this._position = position
        this._rotation = rotation ?? 0

        this.density = density
        this.mass = mass
        this.restitution = restitution
        this.area = area

        this.isStatic = isStatic ?? false

        this.inverseMass = isStatic ? 0 : 1 / this.mass
    }

    /**
     * Performs a simulation step and updates the body's position, rotation, and velocities.
     * 
     * @param delta The elapsed time in seconds since the last step.
     */
    public step(delta: number, gravity: Vector): void {
        if (this.isStatic)
            return

        this._linearVelocity = Vector.add(this._linearVelocity, Vector.multiply(gravity, delta))
        this._position = Vector.add(this.position, Vector.multiply(this._linearVelocity, delta))
        this._rotation += this.rotationalVelocity * delta
    }

    /**
     * Increments this body's position by `amount`.
     * 
     * @param amount The amount to move.
     */
    public move(amount: Vector): void {
        this._position = Vector.add(this._position, amount)
    }
    /**
     * Sets this body's position to `position`.
     * 
     * @param position The position to move to.
     */
    public moveTo(position: Vector): void {
        this._position = position
    }

    /**
     * Increments this body's rotation by `amount`, in radians.
     * 
     * @param amount The amount to rotate, in radians.
     */
    public rotate(amount: number): void {
        this._rotation += amount
    }
    /**
     * Sets this body's rotation to `rotation`, in radians.
     * 
     * @param rotation The rotation to rotate to, in radians.
     */
    public rotateTo(rotation: number): void {
        this._rotation = rotation
    }
    /**
     * Applies a force to this body.
     * 
     * @param force The amount of force to apply.
     */
    public applyForce(force: Vector): void {
        this._force = Vector.add(this._force, force)
    }
}