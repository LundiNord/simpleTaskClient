import EditorJS, {BlockToolConstructable} from '@editorjs/editorjs';
import Header from '@editorjs/header';
import RawTool from '@editorjs/raw';
import EditorjsList from '@editorjs/list';
import {Note} from "./filestructure/note";

const noteData:{note:Note, rootDiv:HTMLElement} = window.noteEditorData || {note: null, rootDiv: null};
if (!noteData.note || !noteData.rootDiv) {
    console.error("Missing note data or root div element");
    throw new Error("Required note data not provided");
}
const note:Note = noteData.note;
const rootDiv:HTMLElement = noteData.rootDiv;
let editor:EditorJS = null;

//----------------------------- Editor -----------------------------------
//https://editorjs.io/configuration/

async function loadEditor():Promise<void> {
    if (window.editorJSCleanup) {
        try {
            await window.editorJSCleanup();
        } catch (e) {
            console.error("Error cleaning up previous editor:", e);
        }
    }
    rootDiv.innerHTML = '';
    editor = new EditorJS({
        holder: rootDiv,
        autofocus: true,
        tools: {
            header: {
                class: Header as unknown as BlockToolConstructable,
                inlineToolbar: ['link']
            },
            list: {
                class: EditorjsList as unknown as BlockToolConstructable,
                inlineToolbar: true,
                config: {
                    defaultStyle: 'unordered',
                }
            },
            raw: {
                class: RawTool as unknown as BlockToolConstructable
            },
        },
        data: await getContent(note),
    });
    //Save button
    const save_span:HTMLElement = document.getElementById('save_span');
    const save_button:HTMLElement = document.createElement('button');
    save_button.textContent = 'Save';
    save_button.className = 'button';
    save_button.onclick = async ():Promise<void> => {
        await doSave(note);
    }
    const seperator:HTMLElement = document.createElement('span');
    seperator.textContent = ' | ';
    save_span.appendChild(seperator);
    save_span.appendChild(save_button);
    //Cleanup function
    window.editorJSCleanup = async ():Promise<void> => {
        if (editor) {
            await doSave(note);
            const head:HTMLHeadElement = document.getElementsByTagName('head')[0];
            const style:HTMLElement = document.getElementById('editor-js-styles') || null;
            const style2:HTMLElement = document.getElementById('codex-tooltips-style') || null;
            head.removeChild(style);
            head.removeChild(style2);
            editor.destroy();
            editor = null;
            save_span.innerHTML = '';
        }
        delete window.noteEditorData;
    }
}
loadEditor();

//----------------------------- Logic -----------------------------------
async function doSave(note:Note):Promise<void> {
    editor.save().then(async (outputData:any):Promise<void> => {
        if (!await note.setContent(JSON.stringify(outputData))) {
            window.alert("Note could not be saved!")
        }
    }).catch((error: any):void => {
        console.log('Saving failed: ', error)
        window.alert("Note could not be saved!")
    });
}
async function getContent(note:Note):Promise<any> {
    try {
        return JSON.parse(await note.getContent())
    } catch (e) {
        console.log("Error parsing content:", e);
        return {
            "time": Math.floor(Date.now() / 1000),
            "blocks": [
                {
                    "id": "oUq2g_tl8y",
                    "type": "header",
                    "data": {
                        "text": note.getName(),
                        "level": 2
                    }
                },
                {
                    "id": "zbGZFPM-iI",
                    "type": "paragraph",
                    "data": {
                        "text": await note.getContent(),
                    }
                },
            ],
        };
    }
}

