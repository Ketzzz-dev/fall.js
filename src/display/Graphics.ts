import { Renderer } from '../core/Renderer'
import { Vector } from '../physics/Vector'
import assert from 'assert'

export class Graphics {
    private renderer: Renderer
    private context: CanvasRenderingContext2D

    private isDrawing = false

    public constructor (renderer: Renderer) {
        this.renderer = renderer

        let context = this.renderer.canvas.getContext('2d')

        assert(context, 'Your browser is shit!')

        this.context = context
    }

    public startDrawing(): void {
        if (this.isDrawing)
            return

        this.isDrawing = true

        let { camera, canvas } = this.renderer

        let cameraScreenX = .5 * canvas.width - camera.position.x
        let cameraScreenY = .5 * canvas.height - camera.position.y

        this.context.clearRect(0, 0, canvas.width, canvas.height)
        this.context.setTransform(camera.zoom, 0, 0, camera.zoom, cameraScreenX, cameraScreenY)
    }
    public endDrawing(): void {
        if (!this.isDrawing)
            return

        this.isDrawing = false

        this.context.resetTransform()
    }

    public drawRectFill(x: number, y: number, width: number, height: number, color: string): this {
        this.context.fillStyle = color

        x *= Renderer.PIXELS_PER_UNIT
        y *= Renderer.PIXELS_PER_UNIT
        width *= Renderer.PIXELS_PER_UNIT
        height *= Renderer.PIXELS_PER_UNIT

        this.context.fillRect(x, y, width, height)

        return this
    }
    public drawRectLine(x: number, y: number, width: number, height: number, thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1

        x *= Renderer.PIXELS_PER_UNIT
        y *= Renderer.PIXELS_PER_UNIT
        width *= Renderer.PIXELS_PER_UNIT
        height *= Renderer.PIXELS_PER_UNIT

        this.context.strokeRect(x, y, width, height)

        return this
    }
    public drawCircleFill(x: number, y: number, radius: number, color: string): this {
        this.context.fillStyle = color

        x *= Renderer.PIXELS_PER_UNIT
        y *= Renderer.PIXELS_PER_UNIT
        radius *= Renderer.PIXELS_PER_UNIT

        this.context.beginPath()
        this.context.arc(x, y, radius, 0, Math.PI * 2)
        this.context.closePath()
        this.context.fill()

        return this
    }
    public drawCircleLine(x: number, y: number, radius: number, thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1

        x *= Renderer.PIXELS_PER_UNIT
        y *= Renderer.PIXELS_PER_UNIT
        radius *= Renderer.PIXELS_PER_UNIT

        this.context.beginPath()
        this.context.arc(x, y, radius, 0, Math.PI * 2)
        this.context.closePath()
        this.context.stroke()
        
        return this
    }
    public drawPolyFill(vertices: Vector[], color: string): this {
        this.context.fillStyle = color

        this.context.beginPath()
        this.context.moveTo(
            vertices[0].x * Renderer.PIXELS_PER_UNIT,
            vertices[0].y * Renderer.PIXELS_PER_UNIT
        )

        for (let i = 1; i < vertices.length; i++) {
            let vertex = vertices[i]

            this.context.lineTo(
                vertex.x * Renderer.PIXELS_PER_UNIT,
                vertex.y * Renderer.PIXELS_PER_UNIT
            )
        }

        this.context.closePath()
        this.context.fill()

        return this
    }
    public drawPolyLine(vertices: Vector[], thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1

        this.context.beginPath()
        this.context.moveTo(
            vertices[0].x * Renderer.PIXELS_PER_UNIT,
            vertices[0].y * Renderer.PIXELS_PER_UNIT
        )

        for (let i = 1; i < vertices.length; i++) {
            let vertex = vertices[i]

            this.context.lineTo(
                vertex.x * Renderer.PIXELS_PER_UNIT,
                vertex.y * Renderer.PIXELS_PER_UNIT
            )
        }
        
        this.context.closePath()
        this.context.stroke()

        return this
    }
    public drawLine(startX: number, startY: number, endX: number, endY: number, thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1

        startX *= Renderer.PIXELS_PER_UNIT
        startY *= Renderer.PIXELS_PER_UNIT
        endX *= Renderer.PIXELS_PER_UNIT
        endY *= Renderer.PIXELS_PER_UNIT
        
        this.context.moveTo(startX, startY)
        this.context.lineTo(endX, endY)
        this.context.stroke()

        return this
    }
    public drawText(text: string, x: number, y: number, font: string, color: string): this {
        this.context.font = font
        this.context.fillStyle = color

        x *= Renderer.PIXELS_PER_UNIT
        y *= Renderer.PIXELS_PER_UNIT

        this.context.fillText(text, x, y)

        return this
    }
}