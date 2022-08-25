import EventEmitter from 'eventemitter3'
import { FMath } from '../utility/FMath'

export interface TimeStepEvents {
    'tick': [delta: number]
    'start': []
    'stop': []
}

export class TimeStep extends EventEmitter<TimeStepEvents> {
    public static readonly MIN_DELTA = 1 / 120
    public static readonly MAX_DELTA = 1 / 12

    public static readonly MAX_DELTA_HISTORY_LENGTH = 60

    private lastTime = 0
    private frameRequestId = 0

    public delta = 0
    public deltaHistory = Array<number>(TimeStep.MAX_DELTA_HISTORY_LENGTH).fill(TimeStep.MAX_DELTA)

    public isRunning = false
    
    private _tick(): void {
        this.frameRequestId = requestAnimationFrame(this._tick.bind(this))

        let time = performance.now() / 1000
        let delta = time - this.lastTime

        this.lastTime = time

        this.deltaHistory.push(delta)

        this.deltaHistory = this.deltaHistory.slice(-TimeStep.MAX_DELTA_HISTORY_LENGTH)
        delta = Math.min(...this.deltaHistory)

        delta = FMath.clamp(delta, TimeStep.MIN_DELTA, TimeStep.MAX_DELTA)

        this.delta = delta

        this.emit('tick', this.delta)
    } 

    public start(): void {
        if (this.isRunning)
            return

        this.frameRequestId = requestAnimationFrame(this._tick.bind(this))

        this.emit('start')
    }
    public stop(): void {
        if (!this.isRunning)
            return
        
        cancelAnimationFrame(this.frameRequestId)

        this.emit('stop')
    }
} 