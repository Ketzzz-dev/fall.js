export namespace Common {
	export const FUZZY_EQUALITY_COMPARISON = 1e-5

	export function fuzzyEquals(a: number, b: number): boolean {
		return Math.abs(a - b) < FUZZY_EQUALITY_COMPARISON
	}
}