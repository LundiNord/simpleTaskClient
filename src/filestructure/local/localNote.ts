import {Note} from "../note";
import {LocalFolder} from "./localFolder";

export class LocalNote extends Note {
    constructor(extension:string, name: string, parent?: LocalFolder) {
        super(extension, name, parent);
    }
    public readonly type: string = "LocalNote";
    async setName(newName: string): Promise<boolean> {
        this.name = newName;
        this.url = newName;
        window.saveDataToLocalStorage();
        return true;
    }
    async setContent(content: string): Promise<boolean> {
        this.content = content;
        window.saveDataToLocalStorage();
        return true;
    }
    async delete(): Promise<boolean> {
        this.parent.removeEntry(this);
        window.saveDataToLocalStorage();
        return true;
    }
}
