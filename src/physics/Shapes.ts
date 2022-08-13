import { MathF } from '../utility/MathF'
import { RigidBody } from './RigidBody'
import { Colliders } from './collisions/Colliders'
import { Vector } from './Vector'

/**
 * A collection of methods for instantiating physics bodies with a defined geometrical shape.
 */
export namespace Shapes {
    /**
     * The base shape configuration object that is used for instantiating a body with default properties.
     */
    export interface BaseShapeOptions {
        /**
         * The position of the body.
         */
        position: Vector
        rotation?: number
        /**
         * The density of the body, in g/cm^2.
         */
        density: number
        /**
         * The restitution (elasticity) of the body, is clamped between 0 and 1.
         */
        restitution: number
        /**
         * Should the body be static or not?
         */
        isStatic?: boolean
    }
    /**
     * The circle shape configuration object.
     */
    export interface CircleOptions extends BaseShapeOptions {
        /**
         * The radius of the body.
         */
        radius: number
    }
    /**
     * The rectangle shape configuration object.
     */
    export interface RectangleOptions extends BaseShapeOptions {
        /**
         * The width of the body.
         */
        width: number
        /**
         * The height of the body.
         */
        height: number
    }
    /**
     * The regular polygon shape configuration object.
     */
    export interface PolygonOptions extends BaseShapeOptions {
        /**
         * The amount of sides of the body, must be >3.
         */
        sides: number
        /**
         * The radius of the body.
         */
        radius: number
    }

    /**
     * Returns a body instantiated with a circle collider.
     * 
     * @param options The configuration object.
     */
    export function circle(options: Shapes.CircleOptions): RigidBody {
        let { radius, density, position, rotation, isStatic, restitution } = options

        let area = radius * radius * Math.PI

        return new RigidBody({
            position, rotation, density, area, isStatic, restitution,
            collider: new Colliders.CircleCollider(radius)
        })
    }
    /**
     * Returns a body instantiated with a polygon collider.
     * 
     * @param options The configuration object.
     */
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

        return new RigidBody({
            position, rotation, density, area, isStatic, restitution,
            collider: new Colliders.PolygonCollider(vertices)
        })
    }
    /**
     * Returns a body instantiated with a polygon collider.
     * 
     * @param options The configuration object.
     */
    export function polygon(options: Shapes.PolygonOptions): RigidBody {
        let { sides, radius, position, rotation, density, isStatic, restitution } = options

        let theta = MathF.TWO_PI / sides

        let vertices = Array<Vector>(sides)

        for (let i = 0; i < sides; i++) {
            let angle = i * theta

            vertices[i] = new Vector(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            )
        }

        let area = (radius * radius * sides * Math.sin(theta)) / 2

        return new RigidBody({
            position, rotation, density, area, isStatic, restitution,
            collider: new Colliders.PolygonCollider(vertices)
        })
    }
}