import { clamp } from "@FMath/Common"
import { Vector } from "@FMath/Vector"
import { AABB } from "@Geometry/AABB"
import { Transform } from "./Transform"
import { World } from "./World"

export enum ShapeType {
    Circle, Rectangle
}

export class Body {
    public position: Vector
    public linearVelocity: Vector
    public rotation: number
    public rotationalVelocity: number

    public force: Vector

    public readonly density: number
    public readonly mass: number
    public readonly inverseMass: number
    public readonly restitution: number
    public readonly area: number

    public readonly isStatic: boolean

    public readonly radius: number
    public readonly width: number
    public readonly height: number

    private vertices!: Vector[]
    private transformedVertices!: Vector[]
    private bounds!: AABB

    private transformUpdateRequired: boolean
    private boundsUpdateRequired: boolean

    public readonly type: ShapeType

    private static createRectangleVertices(width: number, height: number): Vector[] {
        let left = -width * .5
        let right = left + width
        let top = -height * .5
        let bottom = top + height

        return [
            new Vector(left, top),
            new Vector(right, top),
            new Vector(right, bottom),
            new Vector(left, bottom)
        ]
    }

    public static createCircle(
        radius: number, position: Vector, density: number, restitution: number,
        isStatic: boolean
    ): Body {
        let area = radius * radius * Math.PI

        if (area < World.MIN_BODY_SIZE)
            throw new RangeError(`Area is too small. Min area is ${World.MIN_BODY_SIZE}`)
        if (area > World.MAX_BODY_SIZE)
            throw new RangeError(`Area is too large. Max area size is ${World.MAX_BODY_SIZE}`)

        if (density < World.MIN_DENSITY)
            throw new RangeError(`Density is too small. Min density is ${World.MIN_DENSITY}`)
        if (density > World.MAX_DENSITY)
            throw new RangeError(`Density is too large. Max density is ${World.MAX_DENSITY}`)

        restitution = clamp(restitution, 0, 1)

        let mass = area * density

        return new Body(position, density, mass, restitution, area, isStatic, radius, 0, 0, ShapeType.Circle)
    }
    public static createRectangle(
        width: number, height: number, position: Vector, density: number, restitution: number,
        isStatic: boolean
    ): Body {
        let area = width * height
        if (area < World.MIN_BODY_SIZE)
            throw new RangeError(`Area is too small. Min area is ${World.MIN_BODY_SIZE}`)
        if (area > World.MAX_BODY_SIZE)
            throw new RangeError(`Area is too large. Max area is ${World.MAX_BODY_SIZE}`)

        if (density < World.MIN_DENSITY)
            throw new RangeError(`Density is too small. Min density is ${World.MIN_DENSITY}`)
        if (density > World.MAX_DENSITY)
            throw new RangeError(`Density is too large. Max density is ${World.MAX_DENSITY}`)

        restitution = clamp(restitution, 0, 1)

        let mass = area * density

        return new Body(position, density, mass, restitution, area, isStatic, 0, width, height, ShapeType.Rectangle)
    }

    private constructor(
        position: Vector, density: number, mass: number, restitution: number, area: number,
        isStatic: boolean, radius: number, width: number, height: number, type: ShapeType
    ) {
        this.position = position
        this.linearVelocity = Vector.ZERO
        this.rotation = 0
        this.rotationalVelocity = 0

        this.force = Vector.ZERO

        this.density = density
        this.mass = mass
        this.restitution = restitution
        this.area = area

        this.isStatic = isStatic

        this.inverseMass = this.isStatic ? 0 : 1 / this.mass

        this.radius = radius
        this.width = width
        this.height = height

        this.type = type

        if (this.type == ShapeType.Rectangle) {
            this.vertices = Body.createRectangleVertices(this.width, this.height)
            this.transformedVertices = Array(4)
        }

        this.transformUpdateRequired = true
        this.boundsUpdateRequired = true
    }

    public getTransformedVertices(): Vector[] {
        if (this.transformUpdateRequired) {
            let transform = new Transform(this.position, this.rotation)

            this.transformedVertices = this.vertices.map((vertex) => Vector.transform(vertex, transform))

            this.transformUpdateRequired = false
        }

        return this.transformedVertices
    }
    public getBounds(): AABB {
        if (this.boundsUpdateRequired) {
            let minX = Number.MAX_VALUE
            let minY = Number.MAX_VALUE
            let maxX = Number.MIN_VALUE
            let maxY = Number.MIN_VALUE

            switch (this.type) {
                case ShapeType.Circle:
                    minX = this.position.x - this.radius
                    minY = this.position.y - this.radius          
                    maxX = this.position.x + this.radius
                    maxY = this.position.y + this.radius

                    break
                case ShapeType.Rectangle:
                    this.getTransformedVertices().forEach(vertex => {
                        if (vertex.x < minX) minX = vertex.x
                        if (vertex.y < minY) minY = vertex.y
                        if (vertex.x > maxX) maxX = vertex.x
                        if (vertex.y > maxY) maxY = vertex.y
                    })

                    break
                default:
                    throw new Error('unknown type')
            }

            this.bounds = new AABB(new Vector(minX, minY), new Vector(maxX, maxY))
            
            this.boundsUpdateRequired = false
        }

        return this.bounds
    }

    public move(v: Vector): void {
        this.transformUpdateRequired = true
        this.boundsUpdateRequired = true
        this.position = Vector.add(this.position, v)
    }
    public moveTo(v: Vector): void {
        this.transformUpdateRequired = true
        this.boundsUpdateRequired = true
        this.position = v
    }
    public rotate(r: number): void {
        this.transformUpdateRequired = true
        this.boundsUpdateRequired = true
        this.rotation += r
    }

    public addForce(f: Vector): void {
        this.transformUpdateRequired = true
        this.boundsUpdateRequired = true
        this.force = f
    }

    public step(delta: number, gravity: Vector, iterations: number): void {
        if (this.isStatic)
            return

        delta /= iterations

        this.transformUpdateRequired = true
        this.boundsUpdateRequired = true

        // let acceleration = Vector.div(this.force, this.mass)

        // this.linearVelocity = Vector.add(this.linearVelocity, Vector.mul(acceleration, delta))

        this.linearVelocity = Vector.add(this.linearVelocity, Vector.mul(gravity, delta))
        this.position = Vector.add(this.position, Vector.mul(this.linearVelocity, delta))
        this.rotation += this.rotationalVelocity * delta

        this.force = Vector.ZERO
    }
}