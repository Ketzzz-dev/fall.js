import { clamp } from "./Common"

export class Random {
    constructor(
        private x: number = Date.now(),
        private m: number = 2471892,
        private a: number = 48292,
        private c: number = 92104
    ) {}

    public next(): number {
        this.x = (this.a * this.x + this.c) % this.m

        return this.x / this.m
    }
    
    public float(min: number = 0, max: number = 0): number {
        if (min > max)
            [min, max] = [max, min]

        return min + this.next() * (max - min)
    }
    public int(min: number = 0, max: number = 0): number {
        return Math.floor(this.float(min, max))
    }
    public boolean(probability: number = 0.5): boolean {
        probability = clamp(probability, 0, 1)

        return this.next() <= probability
    }
}