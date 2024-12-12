declare module "pagedjs" {
    export class PagedPolyfill {        
        preview(): Promise<void>;
        on(event: string, callback: (data?: any) => void): void;
     }
     export class Previewer {
        constructor();
        preview(content: HTMLElement): Promise<void>;
        on(event: string, callback: (data?: any) => void): void;
      }
    
  }