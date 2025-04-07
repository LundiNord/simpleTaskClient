export abstract class Entry {
    constructor(url:string, name?:string, parent?:Entry) {
        this.url = url;
        if(name) this.name = name;
        if(parent) this.parent = parent;
    }
    protected name: string;
    protected url: string;  //url is with trailing slash
    readonly parent: Entry;
    //-----------------------------
    public getName():string {
        return this.name;
    }
    abstract setName(name:string):Promise<boolean>;
}

//----------------------------- Helpers -----------------------------------

