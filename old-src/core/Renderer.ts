import assert from 'assert'
import EventEmitter from 'eventemitter3'
import { FMath } from '../utility/FMath'

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
    }
}