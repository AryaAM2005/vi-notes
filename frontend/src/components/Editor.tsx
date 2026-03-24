import React, { useState, useEffect, useRef } from 'react';
import './Editor.css';

interface EditorProps {
  initialText?: string;
  onChange?: (text: string) => void;
}

const Editor: React.FC<EditorProps> = ({ initialText = '', onChange }) => {
  const [content, setContent] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus on load for distraction-free immediate writing
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (onChange) {
      onChange(val);
    }
    
    // Auto-resize the textarea to fit content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-wrapper">
        <textarea
          ref={textareaRef}
          className="vi-textarea"
          value={content}
          onChange={handleChange}
          placeholder="Start writing..."
          spellCheck={false}
        />
      </div>
      <div className="editor-status-bar">
        <span>{content.length > 0 ? content.trim().split(/\s+/).length : 0} words</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  );
};

export default Editor;
