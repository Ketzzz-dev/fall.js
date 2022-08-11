import { MathF } from './MathF'

/**
 * A collection of simplified functions for generating psuedo-random data.
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
     * @param probability The probability in fraction.
     */
    export function boolean(probability = 0.5): boolean {
        probability = MathF.clamp(probability)

        return Math.random() <= probability
    }

    /**
     * Returns a random element from `array`.
     * 
     * @param array The array to grab a random element from.
     */
    export function fromArray<T>(array: T[]): T {
        let index = Random.integer(0, array.length)

        return array[index]
    }
}