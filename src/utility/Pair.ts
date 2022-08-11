
/**
 * A utility struct that stores a pair of the same or any object.
 * 
 * @template A The type of the first value.
 * @template B The type of the second value.
 */
export class Pair<A, B = A> {
    /**
     * A constant that stores an empty pair.
     */
    public static readonly EMPTY = new Pair<any, any>(undefined, undefined)

    /**
     * The first value.
     */
    public readonly a: A
    /**
     * The second value.
     */
    public readonly b: B

    /**
     * @param a The first value.
     * @param b The second value.
     */
    public constructor (a: A, b: B) {
        this.a = a
        this.b = b
    }

    /**
     * Returns a pair where the values are swapped.
     */
    public swap(): Pair<B, A> {
        return new Pair(this.b, this.a)
    }
}