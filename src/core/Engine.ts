import EventEmitter from 'eventemitter3'
import { MathF } from '../utility/MathF'

export interface EngineEvents {
    'tick': [delta: number]
    'start': []
    'stop': []
}

export class Engine extends EventEmitter<EngineEvents> {
    public static readonly MIN_DELTA = 1 / 120
    public static readonly MAX_DELTA = 1 / 12

    public static readonly MAX_DELTA_HISTORY_LENGTH = 100

    private lastTime = 0
    private frameRequestId = 0

    public delta = 0
    public deltaHistory = Array<number>(Engine.MAX_DELTA_HISTORY_LENGTH).fill(Engine.MIN_DELTA)

    public isRunning = false

    public start(): void {
        if (this.isRunning)
            return

        this.frameRequestId = requestAnimationFrame(this.tick.bind(this))

        this.emit('start')
    }
    public stop(): void {
        if (!this.isRunning)
            return
        
        cancelAnimationFrame(this.frameRequestId)

        this.emit('stop')
    }
    public tick(): void {
        this.frameRequestId = requestAnimationFrame(this.tick.bind(this))

        let time = performance.now() / 1000
        let delta = time - this.lastTime

        this.lastTime = time

        this.deltaHistory.push(delta)

        this.deltaHistory = this.deltaHistory.slice(-Engine.MAX_DELTA_HISTORY_LENGTH)
        delta = Math.min(...this.deltaHistory)

        delta = MathF.clamp(delta, Engine.MIN_DELTA, Engine.MAX_DELTA)

        this.delta = delta

        this.emit('tick', this.delta)
    } 
} 