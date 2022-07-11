import { clamp } from "@FMath/Functions"
import { Vector } from "@FMath/Vector"
import { AABB } from "@Geometry/AABB"
import { EventEmitter } from "eventemitter3"

export interface RendererEvents {
    'render': [context: CanvasRenderingContext2D]
}

export class Renderer extends EventEmitter<RendererEvents> {
    public static readonly UNITS_TO_PIXELS = 16

    public static readonly MIN_DIMENSION = 64
    public static readonly MAX_DIMENSION = 2048

    public coordinates: Vector
    public zoom: number
    public readonly canvas: HTMLCanvasElement

    public constructor(width: number, height: number) {
        super()

        this.canvas = document.createElement('canvas')
        this.coordinates = Vector.ZERO
        this.zoom = 1

        width = clamp(width, Renderer.MIN_DIMENSION, Renderer.MAX_DIMENSION)
        height = clamp(height, Renderer.MIN_DIMENSION, Renderer.MAX_DIMENSION)
        

        this.canvas.width = width
        this.canvas.height = height

        // pass right clicks
        this.canvas.oncontextmenu = (e) => {
            e.preventDefault()
            e.stopPropagation()
        }
    }
    public get bounds(): AABB {
        let canvas = this.canvas

        return new AABB(
            this.coordinates,
            new Vector(
                (this.coordinates.x + canvas.width) / this.zoom / Renderer.UNITS_TO_PIXELS,
                (this.coordinates.y + canvas.height) / this.zoom / Renderer.UNITS_TO_PIXELS
            )
        )
    }

    public update(): void {
        let context = this.canvas.getContext('2d')!

        context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        context.save()
        context.translate(this.coordinates.x, this.coordinates.y)
        context.scale(this.zoom, this.zoom)

        this.emit('render', context)

        context.restore()
    }
}