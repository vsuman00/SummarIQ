"use client";

import React from 'react';
import dynamic from "next/dynamic";
import ReactDOM from "react-dom";
import "react-quill/dist/quill.snow.css";

// Patch findDOMNode for React 19 compatibility
if (typeof window !== "undefined") {
  const reactDomAny = ReactDOM as typeof ReactDOM & {
    findDOMNode?: (node: Element | Text | null) => Element | Text | null;
  };
  if (!reactDomAny.findDOMNode) {
    reactDomAny.findDOMNode = (node: Element | Text | null | { current?: Element | Text | null }) => {
      if (!node) return null;
      if ('nodeType' in node && node.nodeType) return node;
      if ('current' in node) return node.current || null;
      return null;
    };
  }
}

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ReactQuillWrapperProps {
  value: string;
  onChange: (value: string) => void;
  theme?: string;
  className?: string;
  modules?: Record<string, unknown>;
  formats?: string[];
  placeholder?: string;
}

export default function ReactQuillWrapper({
  value,
  onChange,
  theme = 'snow',
  className,
  modules,
  formats,
  placeholder
}: ReactQuillWrapperProps) {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      theme={theme}
      className={className}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
    />
  );
}
