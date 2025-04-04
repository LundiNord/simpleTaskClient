import EditorJS, {BlockToolConstructable, InlineToolConstructable} from '@editorjs/editorjs';
import Header from '@editorjs/header';
import RawTool from '@editorjs/raw';
import EditorjsList from '@editorjs/list';

import {EditorState} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"

import Quill from 'quill';


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
        login_status.textContent = "Login successful";
        document.getElementById('big_login_status').style.display = "none";
        //fetchAndDisplay();
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



//----------------------------- Sync Data -----------------------------------
const proxyURL:string = "http://localhost:3000";
let sessionID:string = null;





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

