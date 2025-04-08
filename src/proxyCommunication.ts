const proxyURL:string = "http://localhost:3000";
//const proxyURL:string = "https://task-backend.nyxnord.de";
let sessionID:string = null;
export let baseURL:string = null;

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
export async function makeDeleteRequest(url:string):Promise<boolean> {
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
        console.error("Error making delete request:", response.statusText);
        return false;
    }
}

//----------------------------- Login -----------------------------------
export const login_status:HTMLElement = document.getElementById('login_status');

async function login(serverUrl: string, username: string, password: string):Promise<string> {
    const response = await fetch(`${proxyURL}/login?serverUrl=${encodeURIComponent(serverUrl)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: "GET",
    });
    if (!response.ok) {
        console.error("Error logging in:" + response.statusText);
        return null;
    } else {
        return response.text();
    }
}
export async function loginToServer(remember: boolean = false):Promise<boolean> {
    login_status.textContent = "Login started...";
    const url:string = (document.getElementById('url_input') as HTMLInputElement).value.trim();
    const url_notes:string = (document.getElementById('url_input_notes') as HTMLInputElement).value.trim();
    const username:string = (document.getElementById('username_input') as HTMLInputElement).value.trim();
    const password:string = (document.getElementById('password_input') as HTMLInputElement).value.trim();
    if (!username || !password || !url) {
        login_status.textContent = "Please fill in all fields";
        return false;
    }
    if (remember) {
        localStorage.setItem("url", url);
        localStorage.setItem('url_notes', url_notes);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
    }
    sessionID = await login(url, username, password);
    if (sessionID === null) {
        login_status.textContent = "Login failed";
        return false;
    } else {
        baseURL = url_notes;
        login_status.textContent = "Login successful";
        document.getElementById('big_login_status').style.display = "none";
        return true;
    }
}
export async function autoLogin():Promise<boolean> {
    const url:string = localStorage.getItem("url");
    const url_notes:string = localStorage.getItem("url_notes");
    const username:string = localStorage.getItem("username");
    const password:string = localStorage.getItem("password");
    if (url && url_notes && username && password) {
        (document.getElementById('url_input') as HTMLInputElement).value = url;
        (document.getElementById('url_input_notes') as HTMLInputElement).value = url_notes;
        (document.getElementById('username_input') as HTMLInputElement).value = username;
        (document.getElementById('password_input') as HTMLInputElement).value = password;
        return loginToServer();
    }
    return false;
}
