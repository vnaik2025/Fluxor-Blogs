import { useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "align",
  ];

  return (
    <div className="rich-text-editor">
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 300px;
          border-radius: 0 0 0.5rem 0.5rem;
          font-size: 1rem;
        }
        .rich-text-editor .ql-toolbar {
          border-radius: 0.5rem 0.5rem 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
          background: white;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
          font-size: 1rem;
        }
        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
        }
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
        }
        .rich-text-editor .ql-editor h3 {
          font-size: 1.17em;
        }
        .rich-text-editor .ql-editor h4 {
          font-size: 1em;
        }
        .rich-text-editor .ql-editor h5 {
          font-size: 0.83em;
        }
        .rich-text-editor .ql-editor h6 {
          font-size: 0.67em;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write your content here..."
      />
    </div>
  );
};

export default RichTextEditor;