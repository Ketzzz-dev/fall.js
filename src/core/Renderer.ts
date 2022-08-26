import EventEmitter from 'eventemitter3'

export interface RendererEvents {

}

export class Renderer extends EventEmitter<RendererEvents> {


    public render(): void {}
}