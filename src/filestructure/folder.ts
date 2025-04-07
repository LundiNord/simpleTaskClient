import {Entry} from "./entry";
import {baseURL} from "../notes";
import {Note} from "./note";
import {makeCreateFolderRequest, makeCreateNoteRequest, makeMoveRequest, makePropfindRequest} from "../proxyCommunication";

export class Folder extends Entry{
    private entries:Entry[];
    //-----------------------------
    public async getEntries():Promise<Entry[]> {
        const url = new URL(baseURL);
        const serverURL = url.origin;
        if(!this.entries){
            const response = await makePropfindRequest(this.url);
            response.shift();
            this.entries = [];
            for (const entry of response) {
                if (entry.href.endsWith("/")) {
                    this.entries.push(new Folder(serverURL + entry.href, entry.href.split("/").slice(-2, -1)[0], this));
                } else if (entry.href.endsWith(".md") || entry.href.endsWith(".txt")) {
                    this.entries.push(new Note(serverURL + entry.href, entry.href.split("/").pop(), this));
                }
            }
        }
        return this.entries;
    }
    public async createFolder(name: string):Promise<Folder> {
        const response = await makeCreateFolderRequest(this.url + "/" + name);
        if(response){
            const newFolder:Folder = new Folder(this.url + "/" + name, name, this);
            this.entries.push(newFolder);
            return newFolder;
        }
        return null;
    }
    public async createNote(name: string):Promise<Note> {
        const response = await makeCreateNoteRequest(this.url + "/" + name, "hello world");
        if(response){
            const newNote:Note = new Note(this.url + "/" + name, name, this);
            this.entries.push(newNote);
            return newNote;
        }
        return null;
    }
    public async setName(newName: string): Promise<boolean> {
        if(newName === this.name) return true;
        const parentPath = this.url.endsWith('/') ? this.url.substring(0, this.url.lastIndexOf('/', this.url.length - 2)) : this.url.substring(0, this.url.lastIndexOf('/'));
        const response = await makeMoveRequest(this.url, parentPath + "/" + newName);
        if(!response){
            return false;
        }
        this.name = newName;
        this.url = parentPath + "/" + newName + "/";
        return true;
    }
}



//----------------------------- Helpers -----------------------------------

