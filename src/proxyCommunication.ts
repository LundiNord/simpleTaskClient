import {proxyURL, sessionID} from "./notes";


//----------------------------- Requests -----------------------------------

export async function makeFileGetRequest(url: string):Promise<any> {
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
export async function makeMoveRequest(url: string, destination: string):Promise<string> {
    const response = await fetch(`${proxyURL}/move`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: sessionID,
            url: url,
            destination: destination,
        })
    });
    if (response.ok) {
        return response.text();
    } else {
        console.error("Error making create request:", response.statusText);
        return null;
    }
}
export async function makePropfindRequest(url: string):Promise<any> {
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
export async function makeCreateFolderRequest(url: string):Promise<boolean> {
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
export async function makeCreateNoteRequest(url: string, initData: string):Promise<boolean> {
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
export async function makeFileChangeRequest(url: string, data: string, etag:string):Promise<string> {
    const response = await fetch(`${proxyURL}/update_file`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: sessionID,
            url: url,
            data: data,
            etag: etag,
        })
    });
    if (response.ok) {
        return response.text();
    } else {
        console.error("Error making change request:", response.statusText);
        return null;
    }
}
