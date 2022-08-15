import { FMath } from './FMath'

export namespace Random {
    export function float(min = 0, max = 0): number {
        // ensuring that our range is valid.
        if (min == max)
            return min
        if (min > max)
            throw new RangeError('`min` is greater than `max`.')

        return min + Math.random() * (max - min)
    }
    export function integer(min = 0, max = 0): number {
        // ensuring that our range is valid.
        if (min == max)
            return min
        if (min > max)
            throw new RangeError('`min` is greater than `max`.')

        return Math.floor(min + Math.random() * (max - min + 1))
    }
    export function boolean(probability = 0.5): boolean {
        probability = FMath.clamp(probability)

        return Math.random() <= probability
    }

    export function fromArray<T>(array: T[]): T {
        let index = Random.integer(0, array.length)

        return array[index]
    }
}

Object.values