import { Renderer } from '../core/Renderer'
import { AABB } from '../geometry/AABB'
import { Vector } from '../physics/Vector'

export class Camera {
    private _renderer: Renderer

    public position: Vector
    public zoom: number

    public get bounds(): AABB {
        let { canvas } = this._renderer

        let left = this.position.x - .5 * canvas.width
        let right = left + canvas.width
        let top = this.position.y - .5 * canvas.height
        let bottom = top + canvas.height

        return new AABB(
            new Vector(left / this.zoom / Renderer.PIXELS_PER_UNIT, top / this.zoom / Renderer.PIXELS_PER_UNIT),
            new Vector(right / this.zoom / Renderer.PIXELS_PER_UNIT, bottom / this.zoom / Renderer.PIXELS_PER_UNIT)
        )
    }

    public constructor (renderer: Renderer) {
        this._renderer = renderer

        this.position = Vector.ZERO
        this.zoom = 1
    }
}