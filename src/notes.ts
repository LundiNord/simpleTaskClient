// import EditorJS, {BlockToolConstructable, InlineToolConstructable} from '@editorjs/editorjs';
// import Header from '@editorjs/header';
// import RawTool from '@editorjs/raw';
// import EditorjsList from '@editorjs/list';
//
// import {EditorState} from "@codemirror/state"
// import {EditorView, keymap} from "@codemirror/view"
// import {defaultKeymap} from "@codemirror/commands"
//
// import Quill from 'quill';

import {Folder} from "./filestructure/folder";
import {Entry} from "./filestructure/entry";
import {Note} from "./filestructure/note";

export const proxyURL:string = "http://localhost:3000";
export let sessionID:string = null;
export let baseURL:string = null;

//----------------------------- Notes -----------------------------------
// const editor = new EditorJS({
//     holder: 'editorjs',
//     tools: {
//         header: {
//             class: Header as unknown as BlockToolConstructable,
//             inlineToolbar: ['link']
//         },
//         list: {
//             class: EditorjsList as unknown as BlockToolConstructable,
//             inlineToolbar: true,
//             config: {
//                 defaultStyle: 'unordered',
//             }
//         },
//         raw: {
//             class: RawTool as unknown as BlockToolConstructable
//         },
//
//     }
// });






//----------------------------- Login -----------------------------------
const login_status:HTMLElement = document.getElementById('login_status');

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
async function loginToServer(remember: boolean = false) {
    login_status.textContent = "Login started...";
    const url:string = (document.getElementById('url_input') as HTMLInputElement).value.trim();
    const url_notes:string = (document.getElementById('url_input_notes') as HTMLInputElement).value.trim();
    const username:string = (document.getElementById('username_input') as HTMLInputElement).value.trim();
    const password:string = (document.getElementById('password_input') as HTMLInputElement).value.trim();
    if (!username || !password || !url) {
        login_status.textContent = "Please fill in all fields";
        return;
    }
    sessionID = await login(url, username, password);
    if (sessionID === null) {
        login_status.textContent = "Login failed";
    } else {
        baseURL = url_notes;
        login_status.textContent = "Login successful";
        document.getElementById('big_login_status').style.display = "none";
        fetchAndDisplay();
    }
    if (remember) {
        localStorage.setItem("url", url);
        localStorage.setItem('url_notes', url_notes);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
    }
}
async function autoLogin() {
    const url:string = localStorage.getItem("url");
    const url_notes:string = localStorage.getItem("url_notes");
    const username:string = localStorage.getItem("username");
    const password:string = localStorage.getItem("password");
    if (url && url_notes && username && password) {
        (document.getElementById('url_input') as HTMLInputElement).value = url;
        (document.getElementById('url_input_notes') as HTMLInputElement).value = url_notes;
        (document.getElementById('username_input') as HTMLInputElement).value = username;
        (document.getElementById('password_input') as HTMLInputElement).value = password;
        loginToServer();
    }
}
autoLogin()

//----------------------------- UI -----------------------------------
const notesDiv:HTMLElement = document.getElementById('notes');

async function fetchAndDisplay() {
    //Create root directory entries
    const rootFolder:Folder = new Folder(baseURL, "Notes");
    const remoteNotes1Div:HTMLElement = document.createElement('div');
    await createFolderDiv(rootFolder, remoteNotes1Div);
    notesDiv.appendChild(remoteNotes1Div);

}

async function createFolderDiv(rootFolder:Folder, rootDiv:HTMLElement) {
    const folder_div:HTMLElement = document.createElement('div');
    const heading = document.createElement('h2');
    heading.textContent = rootFolder.name;
    //New Task/Folder Buttons
    const newNoteButton:HTMLButtonElement = document.createElement('button');
    newNoteButton.className = 'button';
    newNoteButton.style.marginLeft = "70%";
    newNoteButton.textContent = "New Note";
    newNoteButton.addEventListener('click', async () => {
        const newNote = await rootFolder.createNote("New Note.txt");
        folder_div.appendChild(createTitleNoteDiv(newNote, rootDiv));
    });
    const newFolderButton:HTMLButtonElement = document.createElement('button');
    newFolderButton.className = 'button';
    newFolderButton.textContent = "New Folder";
    newFolderButton.addEventListener('click', async () => {
        const newFolder = await rootFolder.createFolder("New Folder");
        folder_div.appendChild(createTitleFolderDiv(newFolder, rootDiv));
    });
    heading.appendChild(newNoteButton);
    const seperator:HTMLElement = document.createElement('span');
    seperator.textContent = " | ";
    heading.appendChild(seperator);
    heading.appendChild(newFolderButton);
    folder_div.appendChild(heading);
    //Entries
    const rootEntries:Entry[] = await rootFolder.getEntries();
    for (const entry of rootEntries) {

        if (entry instanceof Folder) {
            folder_div.appendChild(createTitleFolderDiv(entry, rootDiv));
        } else if (entry instanceof Note) {
            folder_div.appendChild(createTitleNoteDiv(entry, rootDiv));
        }
    }
    rootDiv.appendChild(folder_div);
}

function createTitleFolderDiv(folder:Folder, rootDiv:HTMLElement):HTMLElement {
    const entryDiv:HTMLElement = document.createElement('div');
    entryDiv.className = 'folder';
    entryDiv.textContent = "📁 " + folder.name;
    entryDiv.addEventListener('click', async () => {
        rootDiv.innerHTML = '';
        await createFolderDiv(folder, rootDiv);
    })
    return entryDiv;
}
function createTitleNoteDiv(note:Note, rootDiv:HTMLElement):HTMLElement {
    const entryDiv:HTMLElement = document.createElement('div');
    entryDiv.className = 'note';
    entryDiv.textContent = "🗒 " + note.name;
    entryDiv.addEventListener('click', async () => {
        rootDiv.textContent = await note.getContent();
    })
    return entryDiv;
}



//----------------------------- Buttons -----------------------------------
const settingsButton:HTMLButtonElement = document.getElementById('settings_button') as HTMLButtonElement;
const popup:HTMLElement = document.getElementById('settings');

settingsButton.addEventListener('click', () => {
    popup.style.display = popup.style.display === '' || popup.style.display === 'none' ? 'block' : 'none';
});
document.addEventListener('click', (event) => {
    // @ts-ignore
    if (popup.style.display === 'block' && !popup.contains(event.target) && !settingsButton.contains(event.target)) {
        popup.style.display = 'none';
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        popup.style.display = 'none';
    }
});
document.getElementById('login_button').addEventListener('click', () => {
    loginToServer();
});
document.getElementById('login_remember_button').addEventListener('click', () => {
    loginToServer(true);
});

document.getElementById('login_forget_button').addEventListener('click', () => {
    //ToDo clear content
    localStorage.removeItem('url');
    localStorage.removeItem('url_notes');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    document.getElementById('big_login_status').style.display = "block";
});

