import assert from 'assert'
import EventEmitter from 'eventemitter3'
import { AABB } from '../geometry'
import { FMath, Vector } from '../math'
import { Collider, World } from '../physics'
import { Color } from '../util/Color'
import { Random } from '../util/Random'
import { Camera } from './Camera'

// might make this a little better and customisable
export interface RenderingOptions {
    visible?: boolean
    lineColor?: Color
    lineWidth?: number
    fillColor?: Color
}
export interface RenderableObjectConfig {
    visible: boolean
    lineColor: Color
    lineWidth: number
    fillColor: Color
}

/** @todo Add events */
export interface RendererEvents {
    
}

export class Renderer extends EventEmitter<RendererEvents> {
    public static readonly MIN_DIMENSION = 64
    public static readonly MAX_DIMENSION = 2048

    public static readonly PIXELS_PER_UNIT = 16

    public readonly canvas: HTMLCanvasElement
    public readonly context: CanvasRenderingContext2D

    public readonly camera: Camera

    public static setConfig(options?: RenderingOptions): RenderableObjectConfig {
        let colors = [Color.BLUE, Color.CYAN, Color.GREEN, Color.PURPLE, Color.RED, Color.YELLOW]

        return {
            visible: options?.visible ?? true,
            lineColor: options?.lineColor ?? Color.WHITE,
            lineWidth: options?.lineWidth ?? 1,
            fillColor: options?.fillColor ?? Random.fromArray(colors)
        }
    }

    public constructor (width: number, height: number) {
        super()

        width = FMath.clamp(width, Renderer.MIN_DIMENSION, Renderer.MAX_DIMENSION)
        height = FMath.clamp(height, Renderer.MIN_DIMENSION, Renderer.MAX_DIMENSION)

        let canvas = document.createElement('canvas')

        canvas.width = width
        canvas.height = height

        this.canvas = canvas

        let context = canvas.getContext('2d')

        assert(context, new Error('Your browser is shit!'))

        this.context = context

        this.context.lineJoin = 'round'

        this.camera = new Camera(this)
    }

    public render(world: World): void {
        let { canvas, context, camera } = this

        context.globalCompositeOperation = 'source-in'
        context.fillStyle = 'transparent'

        context.fillRect(0, 0, canvas.width, canvas.height)

        context.globalCompositeOperation = 'source-over'

        context.save()

        let cameraScreenX = .5 * canvas.width - camera.transform.position.x * Renderer.PIXELS_PER_UNIT
        let cameraScreenY = .5 * canvas.height - camera.transform.position.y * Renderer.PIXELS_PER_UNIT

        context.translate(cameraScreenX, cameraScreenY)
        context.scale(camera.transform.scale * Renderer.PIXELS_PER_UNIT, camera.transform.scale * Renderer.PIXELS_PER_UNIT)

        for (let body of world.bodies) {
            let { rendering, collider, transform } = body

            if (!rendering.visible) continue
            if (!AABB.overlaps(collider.bounds, camera.bounds)) continue

            context.beginPath()

            if (collider instanceof Collider.Circle) {
                context.arc(transform.position.x, transform.position.y, collider.radius, 0, FMath.TWO_PI)
            } else if (collider instanceof Collider.Polygon) {
            
                context.moveTo(collider.vertices[0].x, collider.vertices[0].y)
        
                for (let vertex of collider.vertices) {
                    context.lineTo(vertex.x, vertex.y)
                }
    
            } else continue

            context.closePath()
            
            context.moveTo(transform.position.x, transform.position.y)

            let dir = Vector.add(FMath.rotate(Vector.RIGHT, transform.orientation), transform.position)

            context.lineTo(dir.x, dir.y)


            context.fillStyle = rendering.fillColor.toString()
            context.strokeStyle = rendering.lineColor.toString()
            context.lineWidth = (1 + FMath.clamp(rendering.lineWidth, 1, 10)) / Renderer.PIXELS_PER_UNIT

            context.fill()
            context.stroke()
        }

        context.restore()
    }
}