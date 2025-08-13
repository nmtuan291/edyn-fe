import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Undo, Redo} from '@mui/icons-material';
import { FormatBold, FormatItalic, StrikethroughS, FormatUnderlined, FormatListBulleted, FormatListNumbered, Image as ImageIcon } from '@mui/icons-material';

interface TiptapEditorProps {
  onContentChange?: (content: string) => void,
  isCommentEditor: boolean
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ onContentChange, isCommentEditor }) => {
  const editor = useEditor({
    extensions: [
    	StarterKit,
      Image
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    }
  });

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${editor.isActive('bold') ? 'bg-gray-300' : ''} px-2 cursor-pointer`}><FormatBold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${editor.isActive('italic') ? 'bg-gray-300' : ''} px-2 cursor-pointer`}><FormatItalic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${editor.isActive('underline') ? 'bg-gray-300' : ''} px-2 cursor-pointer`}><FormatUnderlined /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${editor.isActive('strike') ? 'bg-gray-300' : ''} px-2 cursor-pointer`}><StrikethroughS /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''} px-2 cursor-pointer`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''} px-2 cursor-pointer`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${editor.isActive('bulletList') ? 'bg-gray-300' : ''} px-2 cursor-pointer`}><FormatListBulleted /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${editor.isActive('orderedList') ? 'bg-gray-300' : ''} px-2 cursor-pointer`}><FormatListNumbered /></button>
        <button onClick={() => editor.chain().focus().undo().run()} className="px-2 cursor-pointer"><Undo /></button>
        <button onClick={() => editor.chain().focus().redo().run()} className="px-2 cursor-pointer"><Redo /></button>
      </div>

      <EditorContent
        editor={editor}
        className={`border border-gray-300 p-4 min-h-[${isCommentEditor ? "100" : "200"}px] rounded-md ProseMirror`}
      />
    </div>
  );
};

export default TiptapEditor;
