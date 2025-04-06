export class Entry {
    constructor(url:string, name?:string, parent?:Entry) {
        this.url = url;
        if(name) this.name = name;
        if(parent) this.parent = parent;
    }
    public readonly name: string;
    public readonly url: string;
    readonly parent: Entry;
}

//----------------------------- Helpers -----------------------------------

