import { Renderer } from '@Core/Renderer'
import { Vector } from '@Math/Vector'

export class Camera {
    private _renderer: Renderer

    public position: Vector
    public zoom: number

    public constructor (renderer: Renderer) {
        this._renderer = renderer

        this.position = Vector.ZERO
        this.zoom = 1
    }
}