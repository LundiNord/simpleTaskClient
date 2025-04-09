import {Entry} from "./entry";
import {makeFileChangeRequest, makeFileGetRequest, makeMoveRequest} from "../proxyCommunication";

export class Note extends Entry {
    protected content: string;
    private etag: string;
    //-----------------------------
    public async getContent(): Promise<string> {
        if (!this.content) {
            const result = await makeFileGetRequest(this.url);
            this.content = result.content || "";
            this.etag = result.etag || "";
        }
        return this.content;
    }
    public async setName(newName: string): Promise<boolean> {
        if(newName === this.name) return true;
        const parentPath:string = this.url.endsWith('/') ? this.url.substring(0, this.url.lastIndexOf('/', this.url.length - 2)) : this.url.substring(0, this.url.lastIndexOf('/'));
        const response:string = await makeMoveRequest(this.url, parentPath + "/" + newName);
        if(!response){
            return false;
        }
        this.name = newName;
        this.url = parentPath + "/" + newName;
        this.etag = response;
        return true;
    }
    public async setContent(content: string): Promise<boolean> {
        if(this.content === content) return true;
        const response:string = await makeFileChangeRequest(this.url, content, this.etag);
        if(!response){
            return false;
        }
        this.content = content;
        this.etag = response;
        return true;
    }
    public getExtension():string {
        return this.url.split(".").pop();
    }
}
