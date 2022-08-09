
export class Pair<A, B = A> {
    public static readonly EMPTY = new Pair<any, any>(undefined, undefined)

    public readonly a: A
    public readonly b: B

    public constructor (a: A, b: B) {
        this.a = a
        this.b = b
    }

    public swap(): Pair<B, A> {
        return new Pair(this.b, this.a)
    }
}