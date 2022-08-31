import { FMath } from '../math'

export class Material {
    public static readonly MIN_DENSITY = 0.29
    public static readonly MAX_DENSITY = 510
    
    public readonly density: number

    public readonly restitution: number
    public readonly dynamicFriction: number
    public readonly staticFriction: number

    public constructor (density: number, restitution: number, dynamicFriction: number, staticFriction: number) {
        this.density = FMath.clamp(density, Material.MIN_DENSITY, Material.MAX_DENSITY)
        this.restitution = FMath.clamp(restitution)
        this.dynamicFriction = FMath.clamp(dynamicFriction)
        this.staticFriction = FMath.clamp(staticFriction)
    }
}
// enum
export namespace Material {
    export const DEFAULT = new Material(2.73, .17, .3, .6)
}