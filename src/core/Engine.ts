import EventEmitter from 'eventemitter3'
import { World } from '../physics/World'
import { Renderer } from './Renderer'
import { TimeStep } from './TimeStep'

export interface EngineEvents {
    'initialize': []
    'tick': []
}
export interface EngineOptions {
    tickRate: number,
    renderer: {
        width: number
        height: number
    }
}

export class Engine extends EventEmitter<EngineEvents> {
    public readonly timestep = new TimeStep()
    public readonly world: World
    public readonly renderer: Renderer

    public readonly tickRate: number
    public readonly delta: number

    public accumulator = 0

    public constructor (options: EngineOptions) {
        super()

        let { renderer, tickRate } = options

        this.world = new World()
        this.renderer = new Renderer(renderer.width, renderer.height)

        this.tickRate = tickRate
        this.delta = 1 / this.tickRate

        this._initialize()

        onload = () => this.timestep.start()
    }

    private _initialize(): void {
        this.timestep.on('tick', this._tick.bind(this))
    }

    private _tick(delta: number): void {
        this.accumulator += delta

        if (this.accumulator > 1) this.accumulator = 1

        while (this.accumulator > this.delta) {
            this.world.update(this.delta)

            this.accumulator -= this.delta
        }

        this.renderer.update()
    }
}