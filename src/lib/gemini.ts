import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate summary using Gemini AI
 * @param transcript - The meeting transcript text
 * @param customPrompt - Custom instructions for summarization
 * @returns Promise<string> - The generated summary
 */
export async function generateSummary(
  transcript: string,
  customPrompt: string = 'Summarize this meeting transcript in a clear and organized manner.'
): Promise<string> {
  try {
    const prompt = `${customPrompt}\n\nTranscript:\n${transcript}`;
    
    // Check if transcript is too long and chunk if necessary
    const maxTokens = 30000; // Approximate token limit
    if (transcript.length > maxTokens) {
      return await generateChunkedSummary(transcript, customPrompt);
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary. Please try again.');
  }
}

/**
 * Handle long transcripts by chunking
 * @param transcript - The long transcript text
 * @param customPrompt - Custom instructions for summarization
 * @returns Promise<string> - The combined summary
 */
async function generateChunkedSummary(
  transcript: string,
  customPrompt: string
): Promise<string> {
  const chunkSize = 25000; // Safe chunk size
  const chunks = [];
  
  // Split transcript into chunks
  for (let i = 0; i < transcript.length; i += chunkSize) {
    chunks.push(transcript.slice(i, i + chunkSize));
  }
  
  const summaries = [];
  
  // Generate summary for each chunk
  for (const chunk of chunks) {
    const prompt = `${customPrompt}\n\nTranscript chunk:\n${chunk}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    summaries.push(response.text());
  }
  
  // Combine all summaries
  const combinedSummary = summaries.join('\n\n');
  
  // Generate final consolidated summary
  const finalPrompt = `Please consolidate these summaries into one coherent summary:\n\n${combinedSummary}`;
  const finalResult = await model.generateContent(finalPrompt);
  const finalResponse = await finalResult.response;
  
  return finalResponse.text();
}

export default genAI;