"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { isValidEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  fileName: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  recipients?: string[];
  error?: string;
}

export default function EmailModal({
  isOpen,
  onClose,
  summary,
  fileName,
}: EmailModalProps) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [subject, setSubject] = useState(`Meeting Summary - ${fileName}`);
  const [meetingTitle, setMeetingTitle] = useState(fileName);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<{ [key: number]: string }>({});

  if (!isOpen) return null;

  const validateEmail = (email: string, index: number) => {
    const newErrors = { ...emailErrors };

    if (email && !isValidEmail(email)) {
      newErrors[index] = "Invalid email format";
    } else {
      delete newErrors[index];
    }

    setEmailErrors(newErrors);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);

    // Validate email format
    validateEmail(value, index);
  };

  const addEmailField = () => {
    if (emails.length < 10) {
      setEmails([...emails, ""]);
    }
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);

      // Remove error for this index
      const newErrors = { ...emailErrors };
      delete newErrors[index];
      setEmailErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate all emails
    const validEmails = emails.filter(
      (email) => email.trim() && isValidEmail(email.trim())
    );

    if (validEmails.length === 0) {
      setError("Please enter at least one valid email address.");
      return;
    }

    if (Object.keys(emailErrors).length > 0) {
      setError("Please fix the email format errors before sending.");
      return;
    }

    if (!summary.trim()) {
      setError("Summary cannot be empty.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: validEmails,
          summary: summary,
          subject: subject,
          meetingTitle: meetingTitle,
        }),
      });

      const data: EmailResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send email");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmails([""]);
        setSubject(`Meeting Summary - ${fileName}`);
        setMeetingTitle(fileName);
      }, 2000);
    } catch (err) {
      console.error("Email sending error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send email. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            Share Summary via Email
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Send your meeting summary to multiple recipients
          </p>
        </DialogHeader>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-200 rounded-xl mr-3">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <span className="text-green-800 font-medium">
                Email sent successfully!
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-xl mr-3">
                <AlertCircle className="h-5 w-5 text-red-700" />
              </div>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div>
            <label
              htmlFor="meetingTitle"
              className="block text-lg font-bold text-gray-800 mb-4"
            >
              Meeting Title
            </label>
            <input
              type="text"
              id="meetingTitle"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              placeholder="Enter meeting title"
              disabled={isSending}
            />
          </div>

          {/* Email Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-lg font-bold text-gray-800 mb-4"
            >
              Email Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              placeholder="Enter email subject"
              disabled={isSending}
              required
            />
          </div>

          {/* Email Recipients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-bold text-gray-800">
                Recipients
              </label>
              <button
                type="button"
                onClick={addEmailField}
                disabled={emails.length >= 10 || isSending}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center px-3 py-2 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-1 text-blue-600" />
                Add Email
              </button>
            </div>

            <div className="space-y-3">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base ${
                        emailErrors[index]
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                      disabled={isSending}
                    />
                    {emailErrors[index] && (
                      <p className="mt-1 text-xs text-red-600">
                        {emailErrors[index]}
                      </p>
                    )}
                  </div>

                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      disabled={isSending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 p-3 border-2 border-red-300 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              You can add up to 10 email addresses. Each email will be validated
              before sending.
            </p>
          </div>

          {/* Summary Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Preview
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
              <div
                className="text-sm text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          </div>
        </form>

        <DialogFooter className="pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
            className="px-6 py-3 text-base font-medium border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSending || Object.keys(emailErrors).length > 0}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
