import { clamp, dot } from "@FMath/Common"
import { Vector } from "@FMath/Vector"
import { Body, ShapeType } from "./Body"
import { CollisionManifold } from "./CollisionManifold"
import { collide, getContactPoints, intersectCirclePolygon, intersectCircles, Intersection, intersectPolygons } from "./Collisions"

export class World {
    public static readonly MIN_BODY_SIZE = 0.01 * 0.01
    public static readonly MAX_BODY_SIZE = 64 * 64

    public static readonly MIN_DENSITY = .5
    public static readonly MAX_DENSITY = 21.4
    
    public static readonly MIN_ITERATIONS = 1
    public static readonly MAX_ITERATIONS = 64

    private gravity = new Vector(0, 9.81)
    private bodies: Body[] = []
    private collisions: CollisionManifold[] = []

    public contactPoints: Vector[] = []
    
    public constructor() {

    }

    public get bodyCount(): number {
        return this.bodies.length
    }

    public addBody(body: Body): void {
        this.bodies.push(body)
    }
    public deleteBody(body: Body): void {
        this.bodies.splice(this.bodies.indexOf(body), 1)
    }
    public getBody(index: number): Body | void {
        return this.bodies.at(index)
    }

    public step(delta: number, iterations: number): void {
        iterations = clamp(iterations, World.MIN_ITERATIONS, World.MAX_ITERATIONS)

        this.contactPoints.splice(0, this.contactPoints.length)

        for (let it = 0; it < iterations; it++) {
            this.bodies.forEach(body => {
                body.step(delta, this.gravity, iterations)
            })

            this.collisions.splice(0, this.collisions.length)
    
            for (let i = 0; i < this.bodies.length - 1; i++) {
                let bodyA = this.bodies[i]
        
                for (let j = i + 1; j < this.bodies.length; j++) {
                    let bodyB = this.bodies[j]

                    if (bodyA.isStatic && bodyB.isStatic)
                        continue
        
                    let [collision, normal, depth] = collide(bodyA, bodyB)

                    if (collision) {
                        if (bodyA.isStatic)
                            bodyB.move(Vector.mul(normal, depth))
                        else if (bodyB.isStatic)
                            bodyA.move(Vector.mul(normal.negative, depth))
                        else {
                            bodyA.move(Vector.mul(normal.negative, depth * .5))
                            bodyB.move(Vector.mul(normal, depth * .5))
                        }

                        let [contactA, contactB, contactCount] = getContactPoints(bodyA, bodyB)

                        let manifold = new CollisionManifold(bodyA, bodyB, normal, delta, contactA, contactB, contactCount)

                        this.collisions.push(manifold)
                    }
                }
            }

            this.collisions.forEach(collision => {
                this.resolveCollision(collision)
                
                if (collision.contactCount > 0) {
                    this.contactPoints.push(collision.contactA)

                    if (collision.contactCount > 1) {
                        this.contactPoints.push(collision.contactB)
                    }
                }
            })
        }
    }

    public resolveCollision(collision: CollisionManifold) {
        let { bodyA, bodyB, normal, depth } = collision

        let relativeVelocity = Vector.sub(bodyB.linearVelocity, bodyA.linearVelocity)
        
        if (dot(relativeVelocity, normal) > 0)
            return

        let restitution = Math.min(bodyA.restitution, bodyB.restitution)
        let impulseMagnitude = -(1 + restitution) * dot(relativeVelocity, normal)

        impulseMagnitude /= bodyA.inverseMass + bodyB.inverseMass

        let impulse = Vector.mul(normal, impulseMagnitude)

        bodyA.linearVelocity = Vector.sub(bodyA.linearVelocity, Vector.mul(impulse, bodyA.inverseMass))
        bodyB.linearVelocity = Vector.add(bodyB.linearVelocity, Vector.mul(impulse, bodyB.inverseMass))
    }
}