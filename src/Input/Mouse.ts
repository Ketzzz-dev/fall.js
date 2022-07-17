import { Renderer } from "@Display/Renderer"
import { Vector } from "@FMath/Vector"

export interface ButtonStates extends Record<number, boolean> {}

export enum Button {
    Left = 0, Middle = 1, Right = 2
}

export class Mouse {
    private states: ButtonStates = {}
    private previousStates: ButtonStates = {}

    public position = Vector.ZERO

    public constructor(screen: Renderer) {
        screen.canvas.onmousedown = this.handleMouseDownUp.bind(this)
        screen.canvas.onmouseup = this.handleMouseDownUp.bind(this)

        screen.canvas.onmousemove = this.handleMouseMove.bind(this)
    }

    private handleMouseDownUp(event: MouseEvent): void {
        event.preventDefault()
        event.stopPropagation()

        let state = event.type == 'mousedown'

        if (this.states[event.button] != state)
            this.states[event.button] = state
    }
    private handleMouseMove(event: MouseEvent): void {
        this.position = new Vector(event.clientX, event.clientY)
    }

    public isButtonHeld(button: Button): boolean {
        return this.states[button]
    }
    public isButtonDown(button: Button): boolean {
        return this.states[button] && !this.previousStates[button]
    }
    public isButtonUp(button: Button): boolean {
        return !this.states[button] && this.previousStates[button]
    }

    public update(): void {
        for (let key in this.states)
            this.previousStates[key] = this.states[key]
    }
}