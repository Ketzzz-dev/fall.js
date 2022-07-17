import { Vector } from "@FMath/Vector"
import { Renderer } from "./Renderer"
import assert from "assert"

export interface GraphicsDrawMethodsOnly extends Omit<Graphics, 'beginDrawing' | 'endDrawing'> {}

export class Graphics {
    private renderer: Renderer
    private context: CanvasRenderingContext2D

    public constructor(renderer: Renderer) {
        this.renderer = renderer

        let context = this.renderer.canvas.getContext('2d')

        assert(context, 'Your browser is shit!')

        this.context = context
    }

    public beginDrawing(): void {
        let { canvas, camera } = this.renderer

        this.context.save()
        this.context.clearRect(0, 0, canvas.width, canvas.height)

        let cameraScreenX = .5 * canvas.width - camera.position.x
        let cameraScreenY = .5 * canvas.height - camera.position.y

        this.context.translate(cameraScreenX, cameraScreenY)
        this.context.scale(camera.zoom, camera.zoom)
    }
    public endDrawing(): void {
        this.context.restore()
    }

    public drawRectFill(x: number, y: number, width: number, height: number, color: string): this {
        this.context.fillStyle = color

        x *= Renderer.UNITS_TO_PIXELS
        y *= Renderer.UNITS_TO_PIXELS
        width *= Renderer.UNITS_TO_PIXELS
        height *= Renderer.UNITS_TO_PIXELS

        this.context.fillRect(x, y, width, height)

        return this
    }
    public drawRectLine(x: number, y: number, width: number, height: number, thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1

        x *= Renderer.UNITS_TO_PIXELS
        y *= Renderer.UNITS_TO_PIXELS
        width *= Renderer.UNITS_TO_PIXELS
        height *= Renderer.UNITS_TO_PIXELS

        this.context.strokeRect(x, y, width, height)

        return this
    }
    public drawCircleFill(x: number, y: number, radius: number, color: string): this {
        this.context.fillStyle = color

        x *= Renderer.UNITS_TO_PIXELS
        y *= Renderer.UNITS_TO_PIXELS
        radius *= Renderer.UNITS_TO_PIXELS

        this.context.beginPath()
        this.context.arc(x, y, radius, 0, Math.PI * 2)
        this.context.closePath()
        this.context.fill()

        return this
    }
    public drawCircleLine(x: number, y: number, radius: number, thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1

        x *= Renderer.UNITS_TO_PIXELS
        y *= Renderer.UNITS_TO_PIXELS
        radius *= Renderer.UNITS_TO_PIXELS

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
            vertices[0].x * Renderer.UNITS_TO_PIXELS,
            vertices[0].y * Renderer.UNITS_TO_PIXELS
        )

        for (let i = 1; i < vertices.length; i++) {
            let vertex = vertices[i]

            this.context.lineTo(
                vertex.x * Renderer.UNITS_TO_PIXELS,
                vertex.y * Renderer.UNITS_TO_PIXELS
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
            vertices[0].x * Renderer.UNITS_TO_PIXELS,
            vertices[0].y * Renderer.UNITS_TO_PIXELS
        )

        for (let i = 1; i < vertices.length; i++) {
            let vertex = vertices[i]

            this.context.lineTo(
                vertex.x * Renderer.UNITS_TO_PIXELS,
                vertex.y * Renderer.UNITS_TO_PIXELS
            )
        }
        
        this.context.closePath()
        this.context.stroke()

        return this
    }
    public drawLine(startX: number, startY: number, endX: number, endY: number, thickness: number, color: string): this {
        this.context.strokeStyle = color
        this.context.lineWidth = thickness * (1 / this.renderer.camera.zoom) + 1
        
        this.context.moveTo(startX, startY)
        this.context.lineTo(endX, endY)
        this.context.stroke()

        return this
    }
}