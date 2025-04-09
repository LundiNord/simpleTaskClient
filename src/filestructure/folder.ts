import {Entry} from "./entry";
import {Note} from "./note";
import {baseURL, makeCreateFolderRequest, makeCreateNoteRequest, makeMoveRequest, makePropfindRequest} from "../proxyCommunication";

export class Folder extends Entry{
    protected entries:Entry[];
    //-----------------------------
    public async getEntries():Promise<Entry[]> {
        const url = new URL(baseURL);
        const serverURL:string = url.origin;
        if(!this.entries){
            const response:any = await makePropfindRequest(this.url);
            response.shift();
            this.entries = [];
            for (const entry of response) {
                if (entry.href.endsWith("/")) {
                    this.entries.push(new Folder(serverURL + entry.href, entry.href.split("/").slice(-2, -1)[0], this));
                }
                // } else if (entry.href.endsWith(".md") || entry.href.endsWith(".txt")) {     //ToDo
                else {
                    this.entries.push(new Note(serverURL + entry.href, entry.href.split("/").pop(), this));
                }
            }
        }
        return this.entries;
    }
    public async createFolder(name: string):Promise<Folder> {
        const response:boolean = await makeCreateFolderRequest(this.url + "/" + name);
        if(response){
            const newFolder:Folder = new Folder(this.url + "/" + name, name, this);
            this.entries.push(newFolder);
            return newFolder;
        }
        return null;
    }
    public async createNote(name: string):Promise<Note> {
        const response:boolean = await makeCreateNoteRequest(this.url + "/" + name, "hello world");
        if(response){
            const newNote:Note = new Note(this.url + "/" + name, name, this);
            this.entries.push(newNote);
            return newNote;
        }
        return null;
    }
    public async setName(newName: string): Promise<boolean> {
        if(newName === this.name) return true;
        const parentPath:string = this.url.endsWith('/') ? this.url.substring(0, this.url.lastIndexOf('/', this.url.length - 2)) : this.url.substring(0, this.url.lastIndexOf('/'));
        const response:string = await makeMoveRequest(this.url, parentPath + "/" + newName);
        if(!response){
            return false;
        }
        this.name = newName;
        this.url = parentPath + "/" + newName + "/";
        return true;
    }
    public removeEntry(entry: Entry): void {
        //Does not delete the entry on the server, just removes it from the local list
        this.entries = this.entries.filter(e => e !== entry);
    }
}
