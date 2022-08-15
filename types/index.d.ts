
declare namespace FallJS {
    // physics
    class Vector {
        public static readonly ZERO: Vector
        public static readonly ONE: Vector
        public static readonly LEFT: Vector
        public static readonly RIGHT: Vector
        public static readonly UP: Vector
        public static readonly DOWN: Vector
    
        public static add(a: Vector, b: Vector): Vector

        public static subtract(a: Vector, b: Vector): Vector

        public static multiply(a: Vector, b: number): Vector
        public static multiply(a: number, b: Vector): Vector
        
        public static divide(a: Vector, b: number): Vector
        public static divide(a: number, b: Vector): Vector
        
        public static equals(a: Vector, b: Vector): boolean
    
        public readonly x: number
        public readonly y: number
    
        public get negative(): Vector
    
        public get magnitudeSq(): number
        public get magnitude(): number

        public get normalized(): Vector
        
        public constructor (x: number, y: number)
    
        public toString(): string
    }
    class Transform {
        public position: Vector
        public rotation: number
    
        public constructor (position: Vector, rotation?: number)
    }

    // physics/collisions
    namespace Collisions {
        type Projection = [min: number, max: number]

        function collides(a: RigidBody, b: RigidBody): CollisionPoints | undefined

        function projectPolygon(vertices: Vector[], axis: Vector): Projection
        function projectCircle(center: Vector, radius: number, axis: Vector): Projection

        function findClosestPolygonPoint(point: Vector, polygonVertices: Vector[]): Vector
        function findClosestLineSegmentPoint(point: Vector, start: Vector, end: Vector): Vector

        function findCircleCollisionPoints(colliderA: CircleCollider, transformA: Transform, colliderB: CircleCollider, transformB: Transform): CollisionPoints | undefined
        function findPolygonCollisionPoints(colliderA: PolygonCollider, transformA: Transform, colliderB: PolygonCollider, transformB: Transform): CollisionPoints | undefined
        function findCirclePolygonCollisionPoints(circleCollider: CircleCollider, transformA: Transform, polygonCollider: PolygonCollider, transformB: Transform): CollisionPoints | undefined
    }
    namespace Shapes {
        interface BaseShapeOptions {
            position: Vector
            rotation?: number
            density: number
            restitution: number
            isStatic?: boolean
        }
    
        interface CircleOptions extends BaseShapeOptions {
            radius: number
        }
        interface RectangleOptions extends BaseShapeOptions {
            width: number
            height: number
        }
        interface PolygonOptions extends BaseShapeOptions {
            sides: number
            radius: number
        }
    
        function circle(options: CircleOptions): RigidBody
        export function rectangle(options: RectangleOptions): RigidBody
        export function polygon(options: PolygonOptions): RigidBody
    }

    abstract class Collider {

        public abstract getBounds(parentTransform: Transform): AABB
    }
    
    class CircleCollider extends Collider {
        public readonly radius: number
    
        public constructor (radius: number)
    
        public getBounds(parentTransform: Transform): AABB
    }
    class PolygonCollider extends Collider {
        public static readonly MIN_VERTICES: number
        public static readonly MAX_VERTICES: number
    
        private _localVertices: Vector[]
    
        public constructor (vertices: Vector[])
    
        public getTransformedVertices(parentTransform: Transform): Vector[]
    
        public getBounds(parentTransform: Transform): AABB
    }

    interface RigidBodyOptions {
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
    
    interface CollisionPoints {
        contacts: Pair<Vector>
        
        normal: Vector
        depth: number
    }

    class CollisionManifold {
        public readonly bodies: Pair<RigidBody>
        public readonly points: CollisionPoints
        
        public constructor (a: RigidBody, b: RigidBody, points: CollisionPoints)
    }

    class RigidBody {
        public transform: Transform
    
        public linearVelocity: Vector
        public force: Vector
        public angularVelocity: number
        public torque: number
    
        public readonly density: number
        public readonly area: number
        public readonly restitution: number
    
        public readonly mass: number
        public readonly inverseMass: number
        public readonly inertia: number
        public readonly inverseInertia: number
    
        public readonly isStatic: boolean
    
        public readonly collider: Collider
    
        public constructor (options: RigidBodyOptions)
    
        public step(delta: number, gravity: Vector): void
    }

    class World {
        private _bodies: RigidBody[]
        private _gravity: Vector
        
        public addBody(body: RigidBody): void
        public deleteBody(body: RigidBody): void
    
        public step(delta: number): void
    
        public resolveCollision(collision: CollisionManifold): void
    }

    // geometry
    class AABB {
        public readonly min: Vector
        public readonly max: Vector
    
        public static overlaps(a: AABB, b: AABB): boolean
    
        public constructor (min: Vector, max: Vector)
    }

    // utility
    namespace FMath {
        const TWO_PI: number
        const PI_OVER_TWO: number
    
        function distanceSq(a: Vector, b: Vector): number
        function distance(a: Vector, b: Vector): number

        function dot(a: Vector, b: Vector): number
        function cross(a: Vector, b: Vector): number

        function rotate(v: Vector, angle: number, origin?: Vector): Vector

        function clamp(x: number, min?: number, max?: number): number

        function fuzzyEquals(a: number, b: number, epsilon?: number): boolean
        function fuzzyEquals(a: Vector, b: Vector, epsilon?: number): boolean
    }
    namespace Random {
        function float(min?: number, max?: number): number
        function integer(min?: number, max?: number): number
        function boolean(probability?: number): boolean
    
        function fromArray<T>(array: T[]): T
    }

    class Pair<A, B = A> {
        public readonly a: A
        public readonly b: B
    
        public constructor (a: A, b: B) 
    
        public swap(): Pair<B, A>
    }
}

declare module 'fall.js' {
    export = FallJS
}