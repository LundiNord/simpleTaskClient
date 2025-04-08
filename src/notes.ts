import {Folder} from "./filestructure/folder";
import {Entry} from "./filestructure/entry";
import {Note} from "./filestructure/note";
import "./../index.css";
import "./../notes.css";

import EasyMDE from 'easymde';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "easymde/dist/easymde.min.css";
import "./easymde.dark.min.css";
import {autoLogin, baseURL, loginToServer} from "./proxyCommunication";    //ToDo: make more beautiful

let activeEditor:string = "easyMDE";
let currentEasyMDE:EasyMDE | null = null;

//----------------------------- On demand load -----------------------------------
declare global {
    interface Window {
        noteEditorData?: {
            note: Note;
            rootDiv: HTMLElement;
        };
        codeMirrorCleanup: () => void;
        editorJSCleanup: () => void;
    }
}
function loadScript(url:string, callback:()=>void):void {
    const head = document.getElementsByTagName('head')[0];
    if (document.getElementById("dynamicScript")) {     //ToDo: also remove added css
        head.removeChild(document.getElementById("dynamicScript"));
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    script.id = 'dynamicScript';
    head.appendChild(script);
}

//----------------------------- Login -----------------------------------
async function login(remember:boolean = false):Promise<void> {
    if (await loginToServer(remember)) {
        fetchAndDisplay();
    }
}
if (await autoLogin()) {
    fetchAndDisplay();
}

//----------------------------- UI -----------------------------------
const notesDiv:HTMLElement = document.getElementById('notes');

async function fetchAndDisplay():Promise<void> {
    //Create root directory entries
    const rootFolder:Folder = new Folder(baseURL, "Notes");
    const remoteNotes1Div:HTMLElement = document.createElement('div');
    await createFolderDiv(rootFolder, remoteNotes1Div);
    notesDiv.appendChild(remoteNotes1Div);
    //ToDo: local notes
}

async function createFolderDiv(rootFolder:Folder, rootDiv:HTMLElement):Promise<void> {
    const folder_div:HTMLElement = document.createElement('div');
    const heading:HTMLHeadingElement = document.createElement('h2');
    heading.textContent = rootFolder.getName();
    //New Task/Folder Buttons
    const newNoteButton:HTMLButtonElement = document.createElement('button');
    newNoteButton.className = 'button';
    newNoteButton.textContent = "New Note";
    newNoteButton.addEventListener('click', async () => {
        const newNote:Note = await rootFolder.createNote("New Note.txt");
        folder_div.appendChild(createTitleNoteDiv(newNote, rootDiv, true));
    });
    const newFolderButton:HTMLButtonElement = document.createElement('button');
    newFolderButton.className = 'button';
    newFolderButton.textContent = "New Folder";
    newFolderButton.addEventListener('click', async () => {
        const newFolder:Folder = await rootFolder.createFolder("New Folder");
        folder_div.appendChild(createTitleFolderDiv(newFolder, rootDiv, true));
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
        await createFolderDiv(rootFolder.parent, rootDiv);
    };
    if (!rootFolder.parent) {
        document.getElementById('back_button_span').style.display = 'none';
    } else {
        document.getElementById('back_button_span').style.display = 'inline';
        document.getElementById('back_button').addEventListener('click', clickHandler);
    }
    rootDiv.appendChild(folder_div);
}
async function createNotesDiv(note:Note, rootDiv:HTMLElement):Promise<void> {
    const note_div:HTMLElement  = document.createElement('textarea');
    note_div.id = 'note_div';
    rootDiv.innerHTML = '';
    rootDiv.appendChild(note_div);
    currentEasyMDE = new EasyMDE({
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
    currentEasyMDE.value(await note.getContent());
    //add buttons for other editors
    const toolbar_buttons:HTMLElement = document.getElementById('toolbar_buttons');
    toolbar_buttons.innerHTML = '';
    const normalEditor_button:HTMLButtonElement = document.createElement('button');
    normalEditor_button.className = 'button-inactive';
    normalEditor_button.textContent = "Text Editor";
    const normalEditorButtonClickHandler = () => {
        if (activeEditor === "codeMirror") {
            code_button.className = 'button';
        } else if (activeEditor === "editorjs") {
            editorjs_button.addEventListener('click', editorjsButtonClickHandler);
            editorjs_button.className = 'button';
        } else if (activeEditor === "easyMDE") {return;}
        cleanupCurrentEditor();
        normalEditor_button.className = 'button-inactive';
        createNotesDiv(note, rootDiv);
        activeEditor = "easyMDE";
    }
    normalEditor_button.addEventListener('click', normalEditorButtonClickHandler);
    const code_button:HTMLButtonElement = document.createElement('button');
    code_button.className = 'button';
    code_button.textContent = "Code Editor";
    const codeButtonClickHandler = () => {
        if (activeEditor === "easyMDE") {
            normalEditor_button.className = 'button';
        } else if (activeEditor === "editorjs") {
            editorjs_button.className = 'button';
        } else if (activeEditor === "codeMirror") {return;}
        cleanupCurrentEditor();
        code_button.className = 'button-inactive';
        window.noteEditorData = {
            note: note,
            rootDiv: rootDiv,
        };
        loadScript("/dist/codeMirrorBundle.js", () => {});
        activeEditor = "codeMirror";
    }
    code_button.addEventListener('click', codeButtonClickHandler);
    const editorjs_button:HTMLButtonElement = document.createElement('button');
    editorjs_button.className = 'button';
    editorjs_button.textContent = "Block Editor";
    const editorjsButtonClickHandler = () => {
        if (activeEditor === "easyMDE") {
            normalEditor_button.className = 'button';
        } else  if (activeEditor === "codeMirror") {
            code_button.className = 'button';
        } else if (activeEditor === "editorjs") {return;}
        cleanupCurrentEditor();
        editorjs_button.className = 'button-inactive';
        window.noteEditorData = {
            note: note,
            rootDiv: rootDiv,
        };
        loadScript("/dist/editorJSBundle.js", () => {});
        activeEditor = "editorjs";
    }
    editorjs_button.addEventListener('click', editorjsButtonClickHandler);
    function cleanupCurrentEditor():void {
        if (activeEditor === "easyMDE" && currentEasyMDE) {
            const content = currentEasyMDE.value();
            doSave(note, content);
            currentEasyMDE.toTextArea();
            currentEasyMDE = null;
        } else if (activeEditor === "codeMirror" && window.codeMirrorCleanup) {
            window.codeMirrorCleanup();
        } else if (activeEditor === "editorjs" && window.editorJSCleanup) {
            window.editorJSCleanup();
        }
    }
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
        await createFolderDiv(note.parent, rootDiv);
    };
    document.getElementById('back_button_span').style.display = 'inline';
    document.getElementById('back_button').addEventListener('click', clickHandler);
}
async function doSave(note:Note, value:string):Promise<void> {
    if(! await note.setContent(value)) {
        window.alert("Note could not be saved!")
    }
}

function createTitleFolderDiv(folder:Folder, rootDiv:HTMLElement, fresh:boolean = false):HTMLElement {
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
    entryDiv.appendChild(createDeleteRenameButton(folder, entryName, openHandler, entryDiv, fresh));
    return entryDiv;
}
function createTitleNoteDiv(note:Note, rootDiv:HTMLElement, fresh:boolean = false):HTMLElement {
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
    entryDiv.appendChild(createDeleteRenameButton(note, entryName, openHandler, entryDiv, fresh));
    return entryDiv;
}

function createDeleteRenameButton(entry:Entry, entryName:HTMLElement, openHandler:()=>Promise<void>, entryDiv:HTMLElement, fresh:boolean = false):HTMLElement {
    const deleteButton:HTMLButtonElement = document.createElement('button');
    deleteButton.className = 'button';
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', async () => {
        if (await entry.delete()) {
            entryDiv.innerHTML = '';
        } else {
            window.alert("Entry could not be deleted!");
        }
    });
    const renameButton:HTMLButtonElement = document.createElement('button');
    renameButton.className = 'button';
    renameButton.textContent = "Rename";
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
    if (fresh) {
        renameButton.click();
    }
    const buttonsDiv:HTMLElement = document.createElement('div');
    buttonsDiv.style.float = "right";
    buttonsDiv.style.marginRight = "10px";
    buttonsDiv.appendChild(renameButton);
    const separator:HTMLElement = document.createElement('span');
    separator.textContent = " | ";
    buttonsDiv.appendChild(separator);
    buttonsDiv.appendChild(deleteButton);
    return buttonsDiv;
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
    login();
});
document.getElementById('login_remember_button').addEventListener('click', () => {
    login(true);
});

document.getElementById('login_forget_button').addEventListener('click', () => {
    notesDiv.innerHTML = '';
    localStorage.removeItem('url');
    localStorage.removeItem('url_notes');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    document.getElementById('big_login_status').style.display = "block";
});
