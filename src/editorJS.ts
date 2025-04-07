import EditorJS, {BlockToolConstructable, InlineToolConstructable} from '@editorjs/editorjs';
import Header from '@editorjs/header';
import RawTool from '@editorjs/raw';
import EditorjsList from '@editorjs/list';

//----------------------------- Editor -----------------------------------


const editor = new EditorJS({
    holder: 'editorjs',
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

    }
});
