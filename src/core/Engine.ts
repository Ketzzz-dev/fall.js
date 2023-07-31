import EventEmitter from 'eventemitter3'

export interface EngineEvents {
	'run': []
	'stop': []
	'update': [deltaTime: number]
	'render': []
}

export class Engine extends EventEmitter<EngineEvents> {
	public readonly fixedDeltaTime = 1 / 120

	private frameId!: number
	private lastTime!: number

	private running = false
	private accumulatedTime = 0

	public run(): void {
		if (this.running) return

		this.lastTime = performance.now() * .001
		this.frameId = requestAnimationFrame(this.tick.bind(this))
	}

	public stop(): void {
		if (!this.running) return

		cancelAnimationFrame(this.frameId)
	}

	private tick(): void {
		const now = performance.now() * .001
		const deltaTime = now - this.lastTime

		this.lastTime = now
		this.accumulatedTime += deltaTime

		while (this.accumulatedTime > this.fixedDeltaTime) {
			this.emit('update', this.fixedDeltaTime)

			this.accumulatedTime -= this.fixedDeltaTime
		}

		this.emit('render')

		this.frameId = requestAnimationFrame(this.tick.bind(this))
	}
}