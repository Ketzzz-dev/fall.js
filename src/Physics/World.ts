import { Vector } from '@Math/Vector'
import { Body } from './Body'

export class World {
    public static readonly MIN_BODY_AREA = 0.0001
    public static readonly MAX_BODY_AREA = 4096 

    public static readonly MIN_BODY_DENSITY = .5
    public static readonly MAX_BODY_DENSITY = 21.4

    private _gravity = new Vector(0, 9.81)
    private _bodies = Array<Body>()

    public addBodies(...bodies: Body[]): void {
        this._bodies.push(...bodies)
    }
    public removeBodies(...bodies: Body[]): void {
        this._bodies = this._bodies.filter(body => !bodies.includes(body))
    }

    public step(delta: number, iterations: number): void {
        delta /= iterations

        for (let it = 0; it < iterations; it++) {
            for (let body of this._bodies)
                body.step(delta, this._gravity)
        }
    }
}