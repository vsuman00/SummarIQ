'use client';

import { useRef, useEffect } from 'react';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoResize?: boolean;
  maxHeight?: string;
  minHeight?: string;
}

export default function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  autoResize = false,
  maxHeight = '600px',
  minHeight = '200px'
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      
      // Trigger resize after content is set
      if (autoResize) {
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.style.height = 'auto';
            editorRef.current.style.height = `${Math.min(editorRef.current.scrollHeight, parseInt(maxHeight))}px`;
          }
        }, 0);
      }
    }
  }, [value, autoResize, maxHeight]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      
      // Auto-resize functionality
      if (autoResize) {
        editorRef.current.style.height = 'auto';
        editorRef.current.style.height = `${Math.min(editorRef.current.scrollHeight, parseInt(maxHeight))}px`;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle basic formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          handleInput();
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          handleInput();
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          handleInput();
          break;
      }
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 text-sm font-bold border rounded hover:bg-gray-200"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 text-sm italic border rounded hover:bg-gray-200"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-3 py-1 text-sm underline border rounded hover:bg-gray-200"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1.
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`p-4 focus:outline-none ${autoResize ? '' : 'min-h-[200px]'}`}
        style={{
          whiteSpace: 'pre-wrap',
          minHeight: autoResize ? minHeight : undefined,
          maxHeight: autoResize ? maxHeight : undefined,
          overflowY: autoResize ? 'auto' : 'visible',
          resize: 'none'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}