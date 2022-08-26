import { AABB } from '../geometry/AABB'
import { Transform } from '../physics/Transform'
import { Vector } from '../physics/Vector'

export class Camera {
    public transform: Transform

    public get bounds(): AABB {
        throw 'unimplemented'
    }

    public constructor () {
        this.transform = new Transform(Vector.ZERO)
    }
}