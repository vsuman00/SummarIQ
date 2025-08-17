# AI-Powered Meeting Notes Summarizer & Sharer

A modern web application that transforms meeting transcripts into intelligent summaries using Google's Gemini AI and enables seamless sharing via email.

## 🚀 Features

- **Smart File Upload**: Support for TXT and DOCX files with drag-and-drop functionality
- **AI-Powered Summarization**: Uses Google Gemini AI to generate intelligent meeting summaries
- **Custom Prompts**: Add specific instructions to tailor the summary to your needs
- **Rich Text Editing**: Edit and refine summaries with a powerful WYSIWYG editor
- **Email Sharing**: Send summaries to multiple recipients with customizable subjects
- **Cloud Storage**: Secure file storage using Firebase
- **Modern UI**: Beautiful, responsive design with Tailwind CSS and shadcn/ui

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: Google Gemini API
- **Backend**: Firebase (Firestore, Storage)
- **Email**: Nodemailer with Gmail SMTP
- **File Processing**: Mammoth.js for DOCX files
- **Rich Text Editor**: ReactQuill

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **Firebase Project** with Firestore and Storage enabled
3. **Google Gemini API Key**
4. **Gmail Account** with App Password (for email functionality)

## 🔧 Installation

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment variables**
   
   Update `.env.local` with your actual values:
   ```env
   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email Configuration
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Setup Instructions

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Firestore Database** and **Storage**
4. Get your Firebase configuration from Project Settings
5. Add your domain to authorized domains in Authentication settings

### Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key to your `.env.local` file

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your Gmail address and the generated app password in `.env.local`

## 📱 Usage

1. **Upload Meeting Transcript**
   - Drag and drop a TXT or DOCX file (max 10MB)
   - Optionally add a custom prompt for specific summarization needs
   - Click "Generate AI Summary"

2. **Review and Edit Summary**
   - View the AI-generated summary in the rich text editor
   - Edit the content as needed
   - Regenerate summary if required

3. **Share via Email**
   - Click "Share via Email"
   - Add recipient email addresses
   - Customize subject and meeting title
   - Send the summary

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## 🆘 Troubleshooting

### Common Issues

1. **Dependency Conflicts**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Firebase Connection Issues**
   - Verify your Firebase configuration
   - Check if Firestore and Storage are enabled

3. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail

4. **Gemini API Errors**
   - Verify your API key is valid
   - Check if you have sufficient quota

---

**Built with ❤️ using Next.js and Google Gemini AI**
