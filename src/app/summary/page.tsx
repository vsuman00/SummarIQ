"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  RefreshCw,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { UserButton, useUser } from '@clerk/nextjs';
import EmailModal from "@/components/EmailModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import SimpleRichTextEditor from "@/components/SimpleRichTextEditor";

interface DocumentData {
  id: string;
  fileName: string;
  textContent: string;
  customPrompt?: string;
  summary?: string;
  createdAt: string;
}

function SummaryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [editableSummary, setEditableSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const documentId = searchParams.get("id");
  // const fileName = searchParams.get('fileName');
  // const customPrompt = searchParams.get('customPrompt');

  const generateSummary = useCallback(
    async (
      textContent: string,
      customPrompt: string = "Please provide a comprehensive summary of this meeting transcript."
    ) => {
      if (!documentId || !textContent) return;

      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
            transcript: textContent,
            customPrompt,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to generate summary");
        }

        setEditableSummary(data.summary);

        // Update document data with the new summary
        setDocumentData((prev) =>
          prev
            ? {
                ...prev,
                summary: data.summary,
              }
            : null
        );
      } catch (err) {
        console.error("Summary generation error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate summary"
        );
      } finally {
        setIsGenerating(false);
        setIsRegenerating(false);
      }
    },
    [documentId]
  );

  const fetchDocumentAndGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch document data first
      const response = await fetch(`/api/documents/${documentId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch document");
      }

      const docData = {
        id: data.document.id,
        fileName: data.document.fileName,
        textContent: data.document.textContent,
        summary: data.document.summary,
        createdAt: data.document.uploadedAt,
      };

      setDocumentData(docData);

      // If summary already exists, use it; otherwise generate new one
      if (docData.summary) {
        setEditableSummary(docData.summary);
      } else {
        await generateSummary(docData.textContent);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  }, [documentId, generateSummary]);

  useEffect(() => {
    if (!documentId) {
      router.push("/");
      return;
    }

    fetchDocumentAndGenerateSummary();
  }, [documentId, router, fetchDocumentAndGenerateSummary]);

  const handleSummaryChange = (content: string) => {
    setEditableSummary(content);
    setHasUnsavedChanges(documentData?.summary !== content);
  };

  const handleSaveChanges = async () => {
    if (!documentId || !hasUnsavedChanges) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: editableSummary,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save changes");
      }

      // Update document data with the saved summary
      setDocumentData((prev) =>
        prev
          ? {
              ...prev,
              summary: editableSummary,
            }
          : null
      );

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSummary = () => {
    if (!documentData?.textContent) return;
    setIsRegenerating(true);
    generateSummary(documentData.textContent);
  };

  // const handleBackToUpload = () => {
  //   if (hasUnsavedChanges) {
  //     if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
  //       router.push('/');
  //     }
  //   } else {
  //     router.push('/');
  //   }
  // };

  // Quill editor modules configuration
  // const quillModules = {
  //   toolbar: [
  //     [{ 'header': [1, 2, 3, false] }],
  //     ['bold', 'italic', 'underline', 'strike'],
  //     [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  //     [{ 'indent': '-1'}, { 'indent': '+1' }],
  //     ['link'],
  //     ['clean']
  //   ],
  // };

  // const quillFormats = [
  //   'header', 'bold', 'italic', 'underline', 'strike',
  //   'list', 'bullet', 'indent', 'link'
  // ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner
            size="lg"
            text="Loading your document and generating summary..."
          />
          <p className="mt-6 text-gray-600 text-lg">
            Please wait while we process your transcript
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Upload
              </Button>
              
              <Image 
                src="/summariq-logo.svg" 
                alt="SummarIQ" 
                width={80}
                height={40}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleRegenerateSummary}
                disabled={isGenerating || isRegenerating}
                className="flex items-center gap-2 px-6 py-3 text-base font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isRegenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                Regenerate
              </Button>

              <Button
                onClick={() => setShowEmailModal(true)}
                disabled={!editableSummary.trim() || isGenerating}
                className="flex items-center gap-2 px-6 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Mail className="h-5 w-5" />
                Share via Email
              </Button>

              {isSignedIn && (
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-gray-700 font-medium">Welcome, {user?.firstName || 'User'}!</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-2xl mr-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {documentData?.fileName || "Meeting Summary"}
                </h1>
                <p className="text-base text-gray-600 font-medium">
                  Meeting Transcript Summary
                </p>
                {documentData?.customPrompt && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                      <div className="p-1 bg-purple-100 rounded-lg mr-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                      Custom Instructions
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {documentData.customPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditableSummary(documentData?.summary || "");
                        setHasUnsavedChanges(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Discard Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-xl mr-3">
                <FileText className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h3 className="font-medium text-red-800 text-lg">
                  Error generating summary
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Editor */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden">
          <div className="border-b border-gray-200 px-8 py-6 bg-gray-50/50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-3 bg-purple-100 rounded-2xl mr-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              AI-Generated Summary
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Edit and refine your meeting summary below
            </p>
          </div>

          <div className="p-8">
            {isGenerating || isRegenerating ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-2xl inline-block mb-6">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {isRegenerating
                      ? "Regenerating Summary"
                      : "Generating Summary"}
                  </h4>
                  <p className="text-gray-600 text-lg">
                    Please wait while our AI processes your transcript...
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <SimpleRichTextEditor
                  value={editableSummary}
                  onChange={handleSummaryChange}
                  autoResize={true}
                  minHeight="300px"
                  maxHeight="800px"
                  placeholder="Your AI-generated summary will appear here..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {documentData && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          summary={editableSummary}
          fileName={documentData.fileName}
        />
      )}
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      }
    >
      <SummaryPageContent />
    </Suspense>
  );
}
