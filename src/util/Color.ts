import { FMath } from '../math'

/** @todo Make this better */
export class Color {
    public readonly r: number
    public readonly g: number
    public readonly b: number
    public readonly a: number

    public constructor (r: number, g: number, b: number, a?: number) {
        this.r = FMath.clamp(r, 0x00, 0xFF)
        this.g = FMath.clamp(g, 0x00, 0xFF)
        this.b = FMath.clamp(b, 0x00, 0xFF)
        this.a = FMath.clamp(a ?? 1)
    }

    public toString(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }
}
export namespace Color {
    export const RED = new Color(0xE0, 0x6C, 0x75)
    export const GREEN = new Color(0x98, 0xC3, 0x79)
    export const YELLOW = new Color(0xE5, 0xC0, 0x7B)
    export const BLUE = new Color(0x61, 0xAF, 0xEF)
    export const PURPLE = new Color(0xC6, 0x78, 0xDD)
    export const CYAN = new Color(0x56, 0xB6, 0xC2)
    export const WHITE = new Color(0xDC, 0xDF, 0xE4)
    export const BLACK = new Color(0x1E, 0x21, 0x27)
}