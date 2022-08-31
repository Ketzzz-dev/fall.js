import EventEmitter from 'eventemitter3'
import { Renderer } from './Renderer'
import { World } from '../physics'
import { TimeStep } from './TimeStep'

export interface EngineEvents {
    'initialize': []
    'update': [delta: number]
    'render': []
}
export interface EngineOptions {
    iterations?: number
    renderer: {
        width: number
        height: number
    }
}

export class Engine extends EventEmitter<EngineEvents> {
    public readonly timestep = new TimeStep()
    public readonly world: World
    public readonly renderer: Renderer

    public readonly iterations: number
    public readonly delta: number

    public accumulator = 0

    public constructor (options: EngineOptions) {
        super()

        let { renderer, iterations } = options

        this.world = new World()
        this.renderer = new Renderer(renderer.width, renderer.height)

        // 100 iterations is precise and performant enough
        this.iterations = iterations ?? 100
        this.delta = 1 / this.iterations

        this._initialize()

        onload = () => this.timestep.start()
    }

    private _initialize(): void {
        this.timestep.on('tick', this._tick.bind(this))

        this.emit('initialize')
    }

    private _tick(delta: number): void {
        this.accumulator += delta

        // fixed timestep implementation
        if (this.accumulator > 1) this.accumulator = 1

        while (this.accumulator > this.delta) {
            this.world.update(this.delta)

            this.accumulator -= this.delta
        }

        this.renderer.render(this.world)
    }
}