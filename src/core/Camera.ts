import { AABB } from '../geometry'
import { Transform, Vector } from '../math'
import { Renderer } from './Renderer'

export class Camera {
    private _renderer: Renderer
    
    public transform: Transform

    /** @todo Fix this damnit */
    public get bounds(): AABB {
        let { transform: { position, scale }, _renderer: { canvas } } = this

        let left = position.x - .5 * canvas.width
        let right = left + canvas.width
        let top = position.y - .5 * canvas.height
        let bottom = top + canvas.height

        return new AABB(
            new Vector(left / scale / Renderer.PIXELS_PER_UNIT, top / scale / Renderer.PIXELS_PER_UNIT),
            new Vector(right / scale / Renderer.PIXELS_PER_UNIT, bottom / scale / Renderer.PIXELS_PER_UNIT)
        )
    }

    public constructor (renderer: Renderer) {
        this._renderer = renderer
        this.transform = new Transform()
    }
}