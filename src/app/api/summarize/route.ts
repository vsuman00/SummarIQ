import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import DocumentModel from '@/models/Document';
import { generateSummary } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, transcript, customPrompt } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript content is required' },
        { status: 400 }
      );
    }

    if (!customPrompt) {
      return NextResponse.json(
        { error: 'Custom prompt is required' },
        { status: 400 }
      );
    }

    // Validate transcript length
    if (transcript.length < 10) {
      return NextResponse.json(
        { error: 'Transcript is too short to summarize' },
        { status: 400 }
      );
    }

    // Generate summary using Gemini AI
    const summary = await generateSummary(transcript, customPrompt);

    // If documentId is provided, update the document in MongoDB
    if (documentId) {
      try {
        await connectDB();
        
        // Check if document exists and belongs to user, then update with summary
        const updatedDoc = await DocumentModel.findOneAndUpdate(
          { _id: documentId, userId: userId },
          {
            summary: summary,
            summaryGeneratedAt: new Date()
          },
          { new: true }
        );
        
        if (!updatedDoc) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }
      } catch (mongoError) {
        console.error('MongoDB update error:', mongoError);
        // Continue even if MongoDB update fails
      }
    }

    return NextResponse.json({
      success: true,
      summary: summary,
      documentId: documentId
    });

  } catch (error) {
    console.error('Summarization error:', error);
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('safety')) {
        return NextResponse.json(
          { error: 'Content was blocked due to safety concerns. Please review your transcript.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
}