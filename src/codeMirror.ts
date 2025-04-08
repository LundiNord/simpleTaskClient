import {EditorState, Extension} from "@codemirror/state"
import {
    EditorView, keymap, highlightSpecialChars, drawSelection,
    highlightActiveLine, dropCursor, rectangularSelection,
    crosshairCursor, lineNumbers, highlightActiveLineGutter
    } from "@codemirror/view"
import {defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap} from "@codemirror/language"
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"
import {python} from "@codemirror/lang-python"
import {markdown} from "@codemirror/lang-markdown"
import {xml} from "@codemirror/lang-xml"
import {rust} from "@codemirror/lang-rust"
import {json} from "@codemirror/lang-json"
import {java} from "@codemirror/lang-java"
import {html} from "@codemirror/lang-html"
import {cpp} from "@codemirror/lang-cpp"

import {Note} from "./filestructure/note";

const noteData = window.noteEditorData || {note: null, rootDiv: null};
if (!noteData.note || !noteData.rootDiv) {
    console.error("Missing note data or root div element");
    throw new Error("Required note data not provided");
}
const note:Note = noteData.note;
const rootDiv:HTMLElement = noteData.rootDiv;
let editorView = null;

//----------------------------- Editor -----------------------------------
//https://codemirror.net/docs/

async function loadEditor():Promise<void> {
    // Clean up any existing editor if present
    if (window.codeMirrorCleanup) {
        try {
            window.codeMirrorCleanup();
        } catch (e) {
            console.error("Error cleaning up previous editor:", e);
        }
    }
    rootDiv.innerHTML = '';
    editorView = new EditorView({
        // extensions: [basicSetup, javascript()],
        parent: rootDiv,
        doc: await note.getContent() || "",
        extensions: [
            // A line number gutter
            lineNumbers(),
            // A gutter with code folding markers
            foldGutter(),
            // Replace non-printable characters with placeholders
            highlightSpecialChars(),
            // The undo history
            history(),
            // Replace the native cursor /selection with our own
            drawSelection(),
            // Show a drop cursor when dragging over the editor
            dropCursor(),
            // Allow multiple cursors/selections
            EditorState.allowMultipleSelections.of(true),
            // Re-indent lines when typing specific input
            indentOnInput(),
            // Highlight syntax with a default style
            syntaxHighlighting(defaultHighlightStyle),
            // Highlight matching brackets near the cursor
            bracketMatching(),
            // Automatically close brackets
            closeBrackets(),
            // Load the autocompletion system
            autocompletion(),
            // Allow alt-drag to select rectangular regions
            rectangularSelection(),
            // Change the cursor to a crosshair when holding alt
            crosshairCursor(),
            // Style the current line specially
            highlightActiveLine(),
            // Style the gutter for the current line specially
            highlightActiveLineGutter(),
            // Highlight text that matches the selected text
            highlightSelectionMatches(),
            keymap.of([
                // Closed-bracket-aware backspace
                ...closeBracketsKeymap,
                // A large set of basic bindings
                ...defaultKeymap,
                // Search-related keys
                ...searchKeymap,
                // Redo/undo keys
                ...historyKeymap,
                // Code folding bindings
                ...foldKeymap,
                // Autocompletion keys
                ...completionKeymap,
                // Keys related to the linter system
                ...lintKeymap
            ]),
            myTheme,
            minHeightEditor,
            autocompletion(),
            getActiveLanguage(),
         ]
    });
    //Register Cleanup function
    window.codeMirrorCleanup = () => {
        if (editorView) {
            doSave(note, editorView.state.doc.toString());
            editorView.destroy();
            editorView = null;
        }
        delete window.noteEditorData;
    }
}
loadEditor();

//----------------------------- Theming -----------------------------------
let myTheme:Extension = EditorView.theme({
    "&": {
        color: "white",
        backgroundColor: "#034"
    },
    ".cm-content": {
        caretColor: "rgba(0,238,153,0.42)"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "rgba(0,238,153,0.56)"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#074"
    },
    ".cm-gutters": {
        backgroundColor: "#045",
        color: "rgba(221,221,221,0.54)",
        border: "none"
    }
},);
const minHeightEditor:Extension = EditorView.theme({
    ".cm-content, .cm-gutter": {minHeight: "300px"}
});

//----------------------------- Logic -----------------------------------
async function doSave(note:Note, value:string):Promise<void> {
    if(! await note.setContent(value)) {
        window.alert("Note could not be saved!")
    }
}
function getActiveLanguage() {
    const name = note.getExtension();
    switch(name) {
        case "py": return python();
        case "md": return markdown();
        case "txt": return markdown();
        case "xml": return xml();
        case "rs": return rust();
        case "json": return json();
        case "java": return java();
        case "html": return html();
        case "cpp": return cpp();
        case "c": return cpp();
        case "h": return cpp();
        case "h++": return cpp();
        case "c++": return cpp();
        case "cp": return cpp();
        default: return markdown();
    }
}
