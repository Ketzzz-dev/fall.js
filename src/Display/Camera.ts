import { Vector } from "@FMath/Vector"
import { AABB } from "@Geometry/AABB"
import { Renderer } from "./Renderer"

export class Camera {
    private renderer: Renderer

    public position: Vector
    public zoom: number

    public constructor(renderer: Renderer) {
        this.renderer = renderer

        this.position = Vector.ZERO
        this.zoom = 1
    }
    public get bounds(): AABB {
        let { canvas } = this.renderer

        let left = this.position.x - .5 * canvas.width
        let right = left + canvas.width
        let top = this.position.y - .5 * canvas.height
        let bottom = top + canvas.height

        return new AABB(
            new Vector(left / this.zoom / Renderer.UNITS_TO_PIXELS, top / this.zoom / Renderer.UNITS_TO_PIXELS),
            new Vector(right / this.zoom / Renderer.UNITS_TO_PIXELS, bottom / this.zoom / Renderer.UNITS_TO_PIXELS)
        )
    }

    public screenToWorldPosition(v: Vector): Vector {
        let { canvas } = this.renderer

        let relativeX = v.x + this.position.x - .5 * canvas.width
        let relativeY = v.y + this.position.y - .5 * canvas.height

        return new Vector(
            relativeX / this.zoom / Renderer.UNITS_TO_PIXELS,
            relativeY / this.zoom / Renderer.UNITS_TO_PIXELS
        )
    }
    public worldToScreenPosition(v: Vector): Vector {
        throw 'implement me'
    }

    public move(v: Vector): void {
        this.position = Vector.add(this.position, v)
    }
    public moveTo(v: Vector): void {
        this.position = v
    }
    public incZoom(): void {
        this.zoom++
    }
    public decZoom(): void {
        this.zoom--
    }
}