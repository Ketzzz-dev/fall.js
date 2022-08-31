import EventEmitter from 'eventemitter3'
import { FMath } from '../math'

export interface TimeStepEvents {
    'tick': [delta: number]
    'start': []
    'stop': []
}

// not a fixed timestep, but smooth and dynamic
export class TimeStep extends EventEmitter<TimeStepEvents> {
    public static readonly MIN_DELTA = 1 / 120
    public static readonly MAX_DELTA = 1 / 12

    public static readonly MAX_DELTA_HISTORY_LENGTH = 100

    private _lastTime = 0
    private _frameRequestId = 0

    public delta = 0
    public deltaHistory = [] as number[]

    public isRunning = false
    
    private _tick(): void {
        this._frameRequestId = requestAnimationFrame(this._tick.bind(this))

        // better to use seconds instead of ms
        let time = performance.now() / 1000
        let delta = time - this._lastTime

        this._lastTime = time

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

        this._frameRequestId = requestAnimationFrame(this._tick.bind(this))

        this.emit('start')
    }
    public stop(): void {
        if (!this.isRunning)
            return
        
        cancelAnimationFrame(this._frameRequestId)

        this.emit('stop')
    }
} 