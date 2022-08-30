import { FMath } from '../math'

export class Material {
    public static readonly MIN_DENSITY = 0.534 * 0.534
    public static readonly MAX_DENSITY = 22.6 * 22.6

    public readonly density: number
    public readonly restitution: number

    public constructor (density: number, restitution: number) {
        this.density = FMath.clamp(density, Material.MIN_DENSITY, Material.MAX_DENSITY)
        this.restitution = FMath.clamp(restitution)
    }
}

export namespace Material {
    export const ROCK = new Material(2.7 * 2.7, 0.1)
    export const WOOD = new Material(0.9 * 0.9, 0.2)
    export const METAL = new Material(7.874 * 7.874, 0.05)
    export const RUBBER = new Material(1.34 * 1.34, 0.8)
}