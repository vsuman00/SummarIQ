import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';
import { parseEmailList, isValidEmail } from '@/lib/utils';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
  });
};

// Generate HTML email template
const generateEmailHTML = (summary: string, meetingTitle?: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Summary</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1f2937;
          margin: 0;
          font-size: 24px;
        }
        .summary-content {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .timestamp {
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${meetingTitle || 'Meeting Summary'}</h1>
          <p class="timestamp">Generated on ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div class="summary-content">
          ${summary.replace(/\n/g, '<br>')}
        </div>
        
        <div class="footer">
          <p>This summary was generated using AI-powered Meeting Notes Summarizer.</p>
          <p>Please review the content for accuracy before making any decisions based on this summary.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emails, summary, subject, meetingTitle } = body;

    // Validate required fields
    if (!emails || !summary) {
      return NextResponse.json(
        { error: 'Email addresses and summary are required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email configuration is missing. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Parse and validate email addresses
    const emailList = typeof emails === 'string' ? parseEmailList(emails) : emails;
    
    if (!Array.isArray(emailList) || emailList.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses provided' },
        { status: 400 }
      );
    }

    // Validate each email
    const invalidEmails = emailList.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    // Limit number of recipients
    if (emailList.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 recipients allowed per email' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Email service configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Meeting Notes Summarizer',
        address: process.env.EMAIL_USER!
      },
      to: emailList,
      subject: subject || `Meeting Summary - ${meetingTitle || new Date().toLocaleDateString()}`,
      text: summary, // Plain text version
      html: generateEmailHTML(summary, meetingTitle)
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `Summary sent successfully to ${emailList.length} recipient(s)`,
      messageId: info.messageId,
      recipients: emailList
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Handle specific nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Email authentication failed. Please check email configuration.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Email sending quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}