import { clamp } from "@FMath/Common"
import EventEmitter from "eventemitter3"

export interface TimeStepEvents {
    'start': []
    'stop': []
    'tick': [delta: number]
}

export class TimeStep extends EventEmitter<TimeStepEvents> {
    // Please note that this is not a fixed-timestep. Changing these values will not change the tick rate of the timestep.
    public static readonly MIN_DELTA = 1 / 120
    public static readonly MAX_DELTA = 1 / 12

    public static readonly MAX_DELTA_HISTORY_LENGTH = 60

    private delta = 0
    private deltaHistory = Array<number>()

    private lastTime = 0
    private frameRequestId = 0

    private running = false

    public start(): void {
        if (this.running)
            return

        this.frameRequestId = requestAnimationFrame(this.tick.bind(this))
    }
    public stop(): void {
        if (!this.running)
            return
        
        cancelAnimationFrame(this.frameRequestId)
    }
    public tick(): void {
        this.frameRequestId = requestAnimationFrame(this.tick.bind(this))

        let time = performance.now() / 1000
        let delta = time - this.lastTime

        this.lastTime = time

        this.deltaHistory.push(delta)

        this.deltaHistory = this.deltaHistory.slice(-(TimeStep.MAX_DELTA_HISTORY_LENGTH - 1))
        delta = Math.min(...this.deltaHistory)

        delta = clamp(delta, TimeStep.MIN_DELTA, TimeStep.MAX_DELTA)

        this.delta = delta

        this.emit('tick', this.delta)
    } 
}