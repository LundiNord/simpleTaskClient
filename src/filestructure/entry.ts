import {makeDeleteRequest} from "../proxyCommunication";
import {Folder} from "./folder";

export abstract class Entry {
    constructor(url:string, name?:string, parent?:Folder) {
        this.url = url;
        if(name) this.name = name;
        if(parent) this.parent = parent;
    }
    protected name: string;
    protected url: string;  //url is with trailing slash
    readonly parent: Folder;
    //-----------------------------
    public getName():string {
        return this.name;
    }
    abstract setName(name:string):Promise<boolean>;
    public async delete():Promise<boolean> {
        if(await makeDeleteRequest(this.url)) {
            this.parent.removeEntry(this);
            return true;
        }
        return false;
    }
}
