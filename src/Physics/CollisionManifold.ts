import { Vector } from "@FMath/Vector"
import { Body } from "./Body"

export class CollisionManifold {
    public readonly bodyA: Body
    public readonly bodyB: Body
    public readonly normal: Vector
    public readonly depth: number

    public readonly contacts: Vector[]

    public constructor(bodyA: Body, bodyB: Body, normal: Vector, depth: number, contacts: Vector[]) {
        this.bodyA = bodyA
        this.bodyB = bodyB
        this.normal = normal
        this.depth = depth

        this.contacts = contacts
    }
}