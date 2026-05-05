import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Undo, Redo} from '@mui/icons-material';
import { FormatBold, FormatItalic, StrikethroughS, FormatUnderlined, FormatListBulleted, FormatListNumbered } from '@mui/icons-material';

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

  const ToolbarButton = ({ onClick, isActive, children }: { onClick: () => void, isActive?: boolean, children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        isActive ? 'bg-brand-100 text-brand-700' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-surface-100">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <FormatBold style={{ fontSize: 18 }} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <FormatItalic style={{ fontSize: 18 }} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
          <FormatUnderlined style={{ fontSize: 18 }} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
          <StrikethroughS style={{ fontSize: 18 }} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-surface-200 mx-1 self-center" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        
        <div className="w-px h-6 bg-surface-200 mx-1 self-center" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          <FormatListBulleted style={{ fontSize: 18 }} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          <FormatListNumbered style={{ fontSize: 18 }} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-surface-200 mx-1 self-center" />
        
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo style={{ fontSize: 18 }} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo style={{ fontSize: 18 }} />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className={`p-4 ${isCommentEditor ? "min-h-[80px]" : "min-h-[200px]"} text-sm text-surface-800 ProseMirror`}
      />
    </div>
  );
};

export default TiptapEditor;
