declare module "pagedjs" {
    export class PagedPolyfill {
        preview(content?: HTMLElement): Promise<void>;
        on(event: string, callback: (data?: any) => void): void;
    }

    export class Previewer {
        constructor(options?: { stylesheets?: string[]; content?: HTMLElement });
        preview(content: HTMLElement): Promise<void>;
        on(event: string, callback: (data?: any) => void): void;
    }

    export interface PagedEvent {
        name: string;
        detail: any;
    }
}