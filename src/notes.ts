import {Folder} from "./filestructure/folder";
import {Entry} from "./filestructure/entry";
import {Note} from "./filestructure/note";
import "./../index.css";
import "./../notes.css";

import EasyMDE from 'easymde';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "easymde/dist/easymde.min.css";
import "./easymde.dark.min.css";    //ToDo: make more beautiful

export const proxyURL:string = "http://localhost:3000";
//const proxyURL:string = "https://task-backend.nyxnord.de";
export let sessionID:string = null;
export let baseURL:string = null;


//----------------------------- On demand load -----------------------------------
declare global {
    interface Window {
        noteEditorData?: {
            note: Note;
            rootDiv: HTMLElement;
        };
    }
}
function loadScript(url:string, callback:()=>void)
{
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    head.appendChild(script);
}

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
    heading.textContent = rootFolder.getName();
    //New Task/Folder Buttons
    const newNoteButton:HTMLButtonElement = document.createElement('button');
    newNoteButton.className = 'button';
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
    const buttons_new:HTMLElement = document.createElement('span');
    const separator:HTMLElement = document.createElement('span');
    separator.textContent = " | ";
    buttons_new.style.float = "right";
    buttons_new.style.marginRight = "10px";
    buttons_new.appendChild(newNoteButton);
    buttons_new.appendChild(separator);
    buttons_new.appendChild(newFolderButton);
    heading.appendChild(buttons_new);
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
    //Navigation
    const clickHandler = async () => {
        document.getElementById('back_button').removeEventListener('click', clickHandler);
        rootDiv.innerHTML = '';
        await createFolderDiv(rootFolder.parent as Folder, rootDiv);
    };
    if (!rootFolder.parent) {
        document.getElementById('back_button_span').style.display = 'none';
    } else {
        document.getElementById('back_button_span').style.display = 'inline';
        document.getElementById('back_button').addEventListener('click', clickHandler);
    }
    rootDiv.appendChild(folder_div);
}
async function createNotesDiv(note:Note, rootDiv:HTMLElement) {
    const note_div:HTMLElement  = document.createElement('textarea');
    note_div.id = 'note_div';
    rootDiv.innerHTML = '';
    rootDiv.appendChild(note_div);
    const easyMDE = new EasyMDE({
        element: note_div,
        autofocus: true,
        autoDownloadFontAwesome: false,
        toolbar: [
            "bold",
            "italic",
            "heading",
            "|",
            {
                name: "others",
                className: "fas fa-caret-down",
                title: "others buttons",
                children: [
                    "quote",
                    "table",
                    "link",
                    "code",
                    "unordered-list",
                    "ordered-list",
                ]
            },
            "|",
            "preview",
            "fullscreen",
            "side-by-side",
            "|",
            {
                name: "save",
                action: (editor) => {
                    doSave(note, editor.value());
                },
                className: "fa fa-save",
                title: "Save Text",
            },
        ],
    });
    easyMDE.value(await note.getContent());
    //add buttons for other editors
    const toolbar_buttons = document.getElementById('toolbar_buttons');
    toolbar_buttons.innerHTML = '';
    const normalEditor_button = document.createElement('button');
    normalEditor_button.className = 'button-inactive';
    normalEditor_button.textContent = "Text Editor";
    const normalEditorButtonClickHandler = () => {
        createNotesDiv(note, rootDiv);
    }
    const code_button = document.createElement('button');
    code_button.className = 'button';
    code_button.textContent = "Code Editor";
    const codeButtonClickHandler = () => {
        code_button.removeEventListener('click', codeButtonClickHandler);
        code_button.className = 'button-inactive';
        normalEditor_button.addEventListener('click', normalEditorButtonClickHandler);
        normalEditor_button.className = 'button';
        window.noteEditorData = {
            note: note,
            rootDiv: rootDiv,
        };
        loadScript("/dist/codeMirrorBundle.js", () => {
            //callback
        });
        //FixMe does not close properly
    }
    code_button.addEventListener('click', codeButtonClickHandler);
    const editorjs_button = document.createElement('button');
    editorjs_button.className = 'button';
    editorjs_button.textContent = "Block Editor";
    const editorjsButtonClickHandler = () => {
        //ToDo
    }
    editorjs_button.addEventListener('click', editorjsButtonClickHandler);
    const separator:HTMLElement = document.createElement('span');
    separator.textContent = " | ";
    toolbar_buttons.appendChild(normalEditor_button);
    toolbar_buttons.appendChild(separator);
    toolbar_buttons.appendChild(code_button);
    const separator2:HTMLElement = document.createElement('span');
    separator2.textContent = " | ";
    toolbar_buttons.appendChild(separator2);
    toolbar_buttons.appendChild(editorjs_button);
    //Navigation
    const clickHandler = async () => {
        document.getElementById('back_button').removeEventListener('click', clickHandler);
        rootDiv.innerHTML = '';
        toolbar_buttons.innerHTML = '';
        await createFolderDiv(note.parent as Folder, rootDiv);
    };
    document.getElementById('back_button_span').style.display = 'inline';
    document.getElementById('back_button').addEventListener('click', clickHandler);
}
async function doSave(note:Note, value:string) {
    if(! await note.setContent(value)) {
        window.alert("Note could not be saved!")
    }
}

function createTitleFolderDiv(folder:Folder, rootDiv:HTMLElement):HTMLElement {
    const entryDiv:HTMLElement = document.createElement('div');
    entryDiv.className = 'folder';
    const entryName:HTMLElement = document.createElement('span');
    entryName.textContent = "📁 " + folder.getName();
    const openHandler:()=>Promise<void> =  async () => {
        rootDiv.innerHTML = '';
        await createFolderDiv(folder, rootDiv);
    };
    entryName.addEventListener('click', openHandler);
    entryDiv.appendChild(entryName);
    entryDiv.appendChild(createRenameButton(folder, entryName, openHandler));
    return entryDiv;
}
function createTitleNoteDiv(note:Note, rootDiv:HTMLElement):HTMLElement {
    const entryDiv:HTMLElement = document.createElement('div');
    entryDiv.className = 'note';
    const entryName:HTMLElement = document.createElement('span');
    entryName.textContent = "🗒 " + note.getName();
    const openHandler:()=>Promise<void> =  async () => {
        rootDiv.innerHTML = '';
        createNotesDiv(note, rootDiv)
    };
    entryName.addEventListener('click', openHandler);
    entryDiv.appendChild(entryName);
    entryDiv.appendChild(createRenameButton(note, entryName, openHandler));
    return entryDiv;
}

function createRenameButton(entry:Entry, entryName:HTMLElement, openHandler:()=>Promise<void>) {
    const renameButton:HTMLButtonElement = document.createElement('button');
    renameButton.className = 'button';
    renameButton.textContent = "Rename";
    renameButton.style.float = "right";
    renameButton.style.marginRight = "10px";
    const input:HTMLInputElement = document.createElement('input');
    const editHandler =  () => {
        entryName.removeEventListener('click', openHandler);
        input.value = entry.getName();
        entryName.textContent = "";
        entryName.appendChild(input);
        renameButton.textContent = "Save";
        renameButton.removeEventListener('click', editHandler);
        renameButton.addEventListener('click', saveHandler);
        document.addEventListener('keydown', saveEnterHandler);
    };
    const saveHandler =  async () => {
        if (await entry.setName(input.value)) {
            entryName.addEventListener('click', openHandler);
            renameButton.textContent = "Rename";
            entryName.textContent = input.value;
            renameButton.removeEventListener('click', saveHandler);
            document.removeEventListener('keydown', saveEnterHandler);
            renameButton.addEventListener('click', editHandler);
        }
    };
    const saveEnterHandler = (event:KeyboardEvent) => {
        if (event.key === 'Enter') {
            saveHandler();
        }
    }
    renameButton.addEventListener('click', editHandler);
    return renameButton;
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
    notesDiv.innerHTML = '';
    localStorage.removeItem('url');
    localStorage.removeItem('url_notes');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    document.getElementById('big_login_status').style.display = "block";
});

