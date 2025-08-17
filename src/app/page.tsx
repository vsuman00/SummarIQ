'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import FileUpload from '@/components/FileUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';



export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
  };

  const handleFileRemove = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('customPrompt', customPrompt);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // Navigate to summary page with the document ID
      router.push(`/summary?id=${data.documentId}`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Navigation Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1"></div>
            <Image 
              src="/summariq-logo.svg" 
              alt="SummarIQ" 
              width={160}
              height={128}
              className="mx-auto"
            />
            <div className="flex-1 flex justify-end">
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700">Welcome, {user?.firstName || 'User'}!</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex gap-3">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="px-6 py-2">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="px-6 py-2 bg-blue-600 hover:bg-blue-700">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your meeting transcripts into intelligent summaries using AI.
            <span className="block mt-2 text-lg text-gray-500">
              Upload, customize, and share professional meeting insights effortlessly.
            </span>
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-10">
            {isUploading ? (
              <div className="text-center py-16">
                <LoadingSpinner size="lg" text="Processing your transcript..." />
                <p className="mt-6 text-gray-600 text-lg">
                  This may take a few moments depending on file size.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* File Upload Section */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-xl mr-3">
                      <FileText className="h-7 w-7 text-blue-600" />
                    </div>
                    Upload Meeting Transcript
                  </h2>
                  
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    selectedFile={file}
                    onFileRemove={handleFileRemove}
                    disabled={isUploading}
                    error={error}
                  />
                </div>

                {/* Custom Prompt Section */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-xl mr-3">
                      <Sparkles className="h-7 w-7 text-purple-600" />
                    </div>
                    Custom Instructions
                  </h2>
                  
                  <div className="space-y-6">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter specific instructions for the AI summary (e.g., 'Focus on action items and decisions', 'Create executive summary with bullet points', 'Highlight key takeaways for stakeholders', etc.)\n\nLeave empty for a general comprehensive summary."
                      className="w-full h-36 px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300 text-gray-700 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white"
                      disabled={isUploading}
                      maxLength={500}
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-gray-600 font-medium">
                        💡 Provide specific instructions to customize your AI-generated summary
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          customPrompt.length > 400 ? 'bg-red-400' : 
                          customPrompt.length > 250 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <p className="text-gray-500 font-mono text-xs">
                          {customPrompt.length}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  <Button
                    type="submit"
                    disabled={!file || isUploading}
                    className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Sparkles className="h-6 w-6" />
                    <span>Generate AI Summary</span>
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our AI Summarizer?</h2>
            <p className="text-lg text-gray-600">Powerful features designed for modern professionals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-2xl mr-4 group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Smart Upload</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Support for TXT and DOCX files up to 10MB. Intuitive drag-and-drop interface for seamless uploading.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-2xl mr-4 group-hover:bg-purple-200 transition-colors">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI-Powered</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Advanced Google Gemini AI with custom prompts for personalized, intelligent summarization.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-2xl mr-4 group-hover:bg-green-200 transition-colors">
                  <ArrowRight className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Easy Sharing</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Rich text editor for refinement and professional email sharing with multiple recipients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
