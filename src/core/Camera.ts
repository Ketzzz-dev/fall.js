import { AABB } from '../geometry'
import { Transform, Vector } from '../math'
import { Renderer } from './Renderer'

export class Camera {
    private _renderer: Renderer
    
    public transform: Transform

    public get bounds(): AABB {
        let { canvas } = this._renderer

        let left = this.transform.position.x - .5 * canvas.width
        let right = left + canvas.width
        let top = this.transform.position.y - .5 * canvas.height
        let bottom = top + canvas.height

        return new AABB(
            new Vector(left / this.transform.scale / Renderer.PIXELS_PER_UNIT, top / this.transform.scale / Renderer.PIXELS_PER_UNIT),
            new Vector(right / this.transform.scale / Renderer.PIXELS_PER_UNIT, bottom / this.transform.scale / Renderer.PIXELS_PER_UNIT)
        )
    }

    public constructor (renderer: Renderer) {
        this._renderer = renderer
        this.transform = new Transform()
    }
}