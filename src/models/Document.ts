import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  uploadedAt: Date;
  summary?: string;
  summaryGeneratedAt?: Date;
}

const DocumentSchema = new Schema<IDocument>({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    default: null
  },
  summaryGeneratedAt: {
    type: Date,
    default: null
  }
});

// Prevent re-compilation during development
const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;