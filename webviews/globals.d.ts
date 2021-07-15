import * as _vscode from "vscode";

declare global {
    const tsvscode: {
        postMessage: ({type:string, value:any}) => void
        getState: () => any;
        setState: (state:any) => void;
    }

    

}

declare type DndEvent = import("svelte-dnd-action").DndEvent;
declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
        onconsider?: (event: CustomEvent<DndEvent> & {target: EventTarget & T}) => void;
        onfinalize?: (event: CustomEvent<DndEvent> & {target: EventTarget & T}) => void;
    }
}