import { Vector } from "@FMath/Vector"

export class AABB {

    public constructor(
        public readonly min: Vector,
        public readonly max: Vector
    ) {}
}