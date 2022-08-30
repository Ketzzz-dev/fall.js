
export class Pair<A extends any, B extends any = A> {
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