import {Folder} from "../folder";
import {Entry} from "../entry";
import {Note} from "../note";
import {LocalNote} from "./localNote";
import { parse, stringify } from "flatted";

export class LocalFolder extends Folder {
    constructor(name:string, parent?:LocalFolder) {
        super("", name, parent);
        if (!parent) {
            this.entries = getDataFromLocalStorage();
            //ToDo: very naive saving solution, save in chunks?
            window.saveDataToLocalStorage = async ():Promise<void> => {
                localStorage.setItem("local_notes", stringify(this.entries));
                console.log(localStorage.getItem("local_notes"));
            }
        }
    }
    public readonly type: string = "LocalFolder";
    async getEntries():Promise<Entry[]> {
        return this.entries;
    }
    public async createFolder(name: string):Promise<Folder> {
        const newFolder:Folder = new LocalFolder(name, this);
        this.entries.push(newFolder);
        window.saveDataToLocalStorage();
        return newFolder;
    }
    public async createNote(name: string):Promise<Note> {
        const newNote:Note = new LocalNote(".md", name, this);
        this.entries.push(newNote);
        window.saveDataToLocalStorage();
        return newNote;
    }
    async setName(newName: string):Promise<boolean> {
        this.name = newName;
        window.saveDataToLocalStorage();
        return true;
    }
    async delete():Promise<boolean> {
        this.parent.removeEntry(this);
        window.saveDataToLocalStorage();
        return true;
    }
}

//----------------------------- Helpers -----------------------------------
function getDataFromLocalStorage():Entry[] {
    const data:string = localStorage.getItem("local_notes");
    if (data) {
        return parse(data);
    }
    return [];
}
