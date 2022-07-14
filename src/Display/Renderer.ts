import { clamp } from "@FMath/Common"
import { EventEmitter } from "eventemitter3"
import { Graphics, GraphicsDrawMethodsOnly } from "./Graphics"
import { Camera } from "./Camera"
import { AABB } from "@Geometry/AABB"
import { Vector } from "@FMath/Vector"

export interface RendererEvents {
    'render': [graphics: GraphicsDrawMethodsOnly]
}

export class Renderer extends EventEmitter<RendererEvents> {
    public static readonly UNITS_TO_PIXELS = 16
    public static readonly MIN_DIMENSION = 64
    public static readonly MAX_DIMENSION = 2048

    public readonly graphics: Graphics
    public readonly camera: Camera
    public readonly canvas: HTMLCanvasElement

    public constructor(width: number, height: number) {
        super()

        this.canvas = document.createElement('canvas')
        this.graphics = new Graphics(this)
        this.camera = new Camera(this)

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
        return new AABB(
            new Vector(0, 0),
            new Vector(this.canvas.width, this.canvas.height)
        )
    }

    public update(): void {
        this.graphics.beginDrawing()

        this.emit('render', this.graphics)

        this.graphics.endDrawing()
    }
}