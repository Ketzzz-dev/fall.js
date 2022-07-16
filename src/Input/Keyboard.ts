import { Renderer } from "@Display/Renderer"

export interface KeyStates extends Record<string, boolean> {}

export class Keyboard {
    private states: KeyStates = {}
    private previousStates: KeyStates = {}

    public constructor(screen: Renderer) {
        screen.canvas.onkeydown = this.handleKeyDownUp.bind(this)
        screen.canvas.onkeyup = this.handleKeyDownUp.bind(this)
    }

    private handleKeyDownUp(event: KeyboardEvent): void {
        event.preventDefault()

        let state = event.type == 'keydown'

        if (this.states[event.key] != state)
            this.states[event.key] = state
    }

    public isKeyHeld(key: string): boolean {
        return this.states[key]
    }
    public isKeyDown(key: string): boolean {
        return this.states[key] && !this.previousStates[key]
    }
    public isKeyUp(key: string): boolean {
        return !this.states[key] && this.previousStates[key]
    }

    public update(): void {
        for (let key in this.states)
            this.previousStates[key] = this.states[key]
    }
}