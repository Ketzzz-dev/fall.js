import { Vector } from "@FMath/Vector"
import { Body } from "./Body"

export class CollisionManifold {
    public readonly bodyA: Body
    public readonly bodyB: Body
    public readonly normal: Vector
    public readonly depth: number

    public readonly contactA: Vector
    public readonly contactB: Vector
    public readonly contactCount: number

    public constructor(
        bodyA: Body, bodyB: Body,
        normal: Vector, depth: number,
        contactA: Vector, contactB: Vector, contactCount: number
    ) {
        this.bodyA = bodyA
        this.bodyB = bodyB
        this.normal = normal
        this.depth = depth

        this.contactA = contactA
        this.contactB = contactB
        this.contactCount = contactCount
    }
}