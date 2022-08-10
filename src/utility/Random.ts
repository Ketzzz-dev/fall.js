import { MathF } from './MathF'

/**
 * The namespace that provides simplified methods for generating psuedo-random numbers.
 */
export namespace Random {
    /**
     * Returns a random floating point number between the range of `min` and `max`, inclusive.
     * 
     * @param min The minimum range.
     * @param max The maximum range.
     */
    export function float(min = 0, max = 0): number {
        if (min == max)
            return min
        if (min > max)
            throw new RangeError('`min` is greater than `max`.')

        return min + Math.random() * (max - min)
    }
    /**
     * Returns a random integer between the range of `min` and `max`, inclusive.
     * 
     * @param min The minimum range.
     * @param max The maximum range.
     */
    export function integer(min = 0, max = 0): number {
        if (min == max)
            return min
        if (min > max)
            throw new RangeError('`min` is greater than `max`.')

        return Math.floor(min + Math.random() * (max - min + 1))
    }
    /**
     * Returns a random boolean value determined by the `probability`.
     * 
     * @param probability The probability in percentage.
     */
    export function boolean(probability = 0.5): boolean {
        probability = MathF.clamp(probability)

        return Math.random() <= probability
    }

    export function fromArray<T>(array: T[]): T {
        let index = integer(0, array.length)

        return array[index]
    }
}