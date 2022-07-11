import EventEmitter from "eventemitter3"

export interface TimeStepEvents {
    'start': []
    'step': [delta: number, time: number]
    'stop': []
}

export class TimeStep extends EventEmitter<TimeStepEvents> {
    private running = false
    private lastTime = 0
    private requestHandler!: number

    private step(): void {
        this.requestHandler = requestAnimationFrame(this.step.bind(this))

        let time = performance.now()
        let delta = (time - this.lastTime) / 1000

        this.emit('step', delta, time)

        this.lastTime = time
    }

    public start(): void {
        if (this.running)
            return

        this.running = true

        this.emit('start')

        this.requestHandler = requestAnimationFrame(this.step.bind(this))
    }
    public stop(): void {
        cancelAnimationFrame(this.requestHandler)

        this.running = false

        this.emit('stop')
    }
}