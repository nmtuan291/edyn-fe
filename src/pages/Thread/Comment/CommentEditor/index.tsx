import React, { useState } from 'react';
import TiptapEditor from '../../../../components/TiptapEditor';
import apiSlice from '../../../../store/api';

interface CommentEditorProps {
  threadId: string,
  parentComment: string | null,
  closeEditor: () => void
}

const CommentEditor: React.FC<CommentEditorProps> = ({ threadId, parentComment, closeEditor }) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [createComment] = apiSlice.useCreateCommentMutation();

  const handleCreateComment = async () => {
    const comment = {
      threadId,
      parentId: parentComment,
      content: editorContent,
      upVote: 0,
      deleted: false
    }
    
    try {
      await createComment(comment).unwrap();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="mt-2">
      <TiptapEditor isCommentEditor={true} onContentChange={content => setEditorContent(content)}></TiptapEditor>
      <div className="flex justify-end">
        <button 
          className="bg-green-500 p-2 mt-2 rounded-full text-white cursor-pointer hover:bg-green-600 w-20 mr-2"
          onClick={closeEditor}
        >
          Hủy
        </button>
        <button 
          className="bg-green-500 p-2 mt-2 rounded-full text-white cursor-pointer hover:bg-green-600 min-w-1" 
          onClick={handleCreateComment}
        >
          Bình luận
        </button>
      </div>
    </div>
  );
};
export default CommentEditor;
