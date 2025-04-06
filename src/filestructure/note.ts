import {Entry} from "./entry";
import {proxyURL, sessionID} from "../notes";

export class Note extends Entry {

    private content: string;
    private etag: string;
    async getContent(): Promise<string> {
        if (!this.content) {
            const result = await makeFileGetRequest(this.url);
            this.content = result.content || "";
            this.etag = result.etag || "";
        }
        return this.content;
    }

}


//----------------------------- Helpers -----------------------------------

async function makeFileGetRequest(url: string):Promise<any> {
    const response = await fetch(`${proxyURL}/get_file`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: sessionID,
            url: url
        })
    });
    if (response.ok) {
        return response.json();
    } else {
        console.error("Error making propfind request:", response.statusText);
        return [];
    }
}
