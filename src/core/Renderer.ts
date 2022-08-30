import assert from 'assert'
import EventEmitter from 'eventemitter3'
import { FMath } from '../math'
import { Collider, World } from '../physics'
import { Color } from '../util/Color'

export interface RenderingOptions {
    visible: boolean
    lineColor?: Color
    lineWidth?: number
    fillColor: Color
}

export interface RendererEvents {
    
}

export class Renderer extends EventEmitter<RendererEvents> {
    public static readonly MIN_DIMENSION = 64
    public static readonly MAX_DIMENSION = 2048

    public readonly canvas: HTMLCanvasElement
    public readonly context: CanvasRenderingContext2D

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
    }

    public render(world: World): void {
        let { canvas, context } = this

        context.globalCompositeOperation = 'source-in'
        context.fillStyle = 'transparent'

        context.fillRect(0, 0, canvas.width, canvas.height)

        context.globalCompositeOperation = 'source-over'

        context.save()
        context.translate(.5 * canvas.width, .5 * canvas.height)
        context.scale(16, 16)

        for (let body of world.bodies) {
            let { rendering, collider, transform } = body

            if (!rendering.visible) continue
            if (collider instanceof Collider.Circle) {
                context.beginPath()
                context.arc(transform.position.x, transform.position.y, collider.radius, 0, FMath.TWO_PI)
                context.closePath()
            } else if (collider instanceof Collider.Polygon) {
                context.beginPath()
            
                context.moveTo(collider.vertices[0].x, collider.vertices[0].y)
        
                for (let vertex of collider.vertices) {
                    context.lineTo(vertex.x, vertex.y)
                }
        
                context.closePath()
            } else continue

            context.fillStyle = rendering.fillColor.toString()
            context.fill()

            if (rendering.lineColor && rendering.lineWidth) {
                context.strokeStyle = rendering.lineColor.toString()
                context.lineWidth = FMath.clamp(rendering.lineWidth, 1, 10)

                context.stroke()
            }
        }

        context.restore()
    }
}