import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DocumentModel from '@/models/Document';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB and fetch document
    await connectDB();
    const document = await DocumentModel.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get the content directly from MongoDB document
    const textContent = document.content || '';
    
    if (!textContent.trim()) {
      return NextResponse.json(
        { error: 'Document content is empty' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document._id.toString(),
        fileName: document.originalName,
        textContent: textContent,
        summary: document.summary,
        uploadedAt: document.uploadedAt,
        summaryGeneratedAt: document.summaryGeneratedAt
      }
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { summary } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB and update document
    await connectDB();
    const document = await DocumentModel.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update the summary
    document.summary = summary;
    document.summaryGeneratedAt = new Date();
    await document.save();

    return NextResponse.json({
      success: true,
      message: 'Summary updated successfully',
      document: {
        id: document._id.toString(),
        summary: document.summary,
        summaryGeneratedAt: document.summaryGeneratedAt
      }
    });

  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}