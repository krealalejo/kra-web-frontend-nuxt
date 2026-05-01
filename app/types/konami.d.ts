declare module 'konami' {
  export default class Konami {
    constructor(callback: string | (() => void));
    unload(): void;
    load(link?: string): void;
    addEvent(obj: any, type: string, fn: Function, ref_obj?: any): void;
    removeEvent(obj: any, type: string, fn: Function): void;
  }
}
