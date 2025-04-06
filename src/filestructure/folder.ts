import {Entry} from "./entry";
import {baseURL, proxyURL, sessionID} from "../notes";
import {Note} from "./note";

export class Folder extends Entry{
    private entries:Entry[];
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
}




//----------------------------- Helpers -----------------------------------

async function makePropfindRequest(url: string):Promise<any> {
    const response = await fetch(`${proxyURL}/propfind`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: sessionID,
            url: url,
        })
    });
    if (response.ok) {
        return response.json();
    } else {
        console.error("Error making propfind request:", response.statusText);
        return [];
    }
}
async function makeCreateFolderRequest(url: string):Promise<boolean> {
    const response = await fetch(`${proxyURL}/create_folder`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: sessionID,
            url: url,
        })
    });
    if (response.ok) {
        return true;
    } else {
        console.error("Error making create request:", response.statusText);
        return false;
    }
}
async function makeCreateNoteRequest(url: string, initData: string):Promise<boolean> {
    const response = await fetch(`${proxyURL}/create_file`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: sessionID,
            url: url,
            data: initData,
        })
    });
    if (response.ok) {
        return true;
    } else {
        console.error("Error making create request:", response.statusText);
        return false;
    }
}
