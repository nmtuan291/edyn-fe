import React, { useState } from 'react';
import TiptapEditor from '../../../../components/TiptapEditor';
import apiSlice from '../../../../store/api';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { openLoginModal } from '../../../../store/ui';

interface CommentEditorProps {
  threadId: string,
  parentComment: string | null,
  closeEditor: () => void
}

const CommentEditor: React.FC<CommentEditorProps> = ({ threadId, parentComment, closeEditor }) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [createComment] = apiSlice.useCreateCommentMutation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user);

  const handleCreateComment = async () => {
    if (!currentUser?.id) {
        dispatch(openLoginModal());
        return;
    }
    
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
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="p-3">
        <TiptapEditor isCommentEditor={true} onContentChange={content => setEditorContent(content)} />
      </div>
      <div className="flex justify-end gap-2 px-3 py-2 bg-surface-50 border-t border-surface-100">
        {parentComment && (
          <button 
            className="px-4 py-1.5 text-sm font-medium text-surface-600 hover:bg-surface-200 rounded-full transition-colors cursor-pointer"
            onClick={closeEditor}
          >
            Hủy
          </button>
        )}
        <button 
          className="px-4 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors cursor-pointer" 
          onClick={handleCreateComment}
        >
          Bình luận
        </button>
      </div>
    </div>
  );
};
export default CommentEditor;
