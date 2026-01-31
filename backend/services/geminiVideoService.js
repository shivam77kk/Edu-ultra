import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { StateGraph, END } from '@langchain/langgraph';
import fs from 'fs';
import path from 'path';
import ytdl from '@distube/ytdl-core';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';
import dotenv from 'dotenv';
dotenv.config();

import VideoAnalysis from '../models/VideoAnalysis.js';
import KnowledgeCard from '../models/KnowledgeCard.js';

const streamPipeline = promisify(pipeline);

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ API Key not found. Please set GOOGLE_API_KEY in .env');
}

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const FALLBACK_MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro-vision",
    "gemini-pro"
];

let cachedModel = null;


async function getWorkingModel() {
    for (const modelName of FALLBACK_MODELS) {
        try {
            const testModel = genAI.getGenerativeModel({ model: modelName });

            await testModel.generateContent("test");
            console.log(`✅ Using Gemini model: ${modelName}`);
            return testModel;
        } catch (error) {
            console.log(`⚠️ Model ${modelName} failed: ${error.message}`);
            continue;
        }
    }
    throw new Error('❌ All Gemini fallback models failed');
}


async function getModel() {
    if (!cachedModel) {
        cachedModel = await getWorkingModel();
    }
    return cachedModel;
}


async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const isRateLimitError = error.message?.includes('quota') ||
                error.message?.includes('rate limit') ||
                error.message?.includes('429') ||
                error.status === 429;

            if (attempt === maxRetries || !isRateLimitError) {
                throw error;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

class LangGraphVideoService {
    constructor() {
        this.model = null;
        this.graph = this.buildWorkflowGraph();
    }


    async initializeModels() {
        if (!this.model) {
            this.model = await getModel();
        }
    }


    buildWorkflowGraph() {
        const workflow = new StateGraph({
            channels: {
                videoFile: null,
                filePath: null,
                videoUrl: null,
                isUrl: null,
                displayName: null,
                videoAnalysisId: null,
                transcript: null,
                topic: null,
                learningObjective: null,
                importantMoments: null,
                summary: null,
                keyPoints: null,
                quiz: null,
                flashCards: null,
                concepts: null,
                popularKnowledgeCards: null,
                error: null,
                currentStep: null,
            }
        });


        workflow.addNode('validateInput', this.validateInputNode.bind(this));
        workflow.addNode('downloadUrl', this.downloadUrlNode.bind(this));
        workflow.addNode('upload', this.uploadVideoNode.bind(this));
        workflow.addNode('understand', this.understandVideoNode.bind(this));
        workflow.addNode('summarize', this.summarizeVideoNode.bind(this));
        workflow.addNode('extractKeyPoints', this.extractKeyPointsNode.bind(this));
        workflow.addNode('generateQuiz', this.generateQuizNode.bind(this));
        workflow.addNode('generateFlashCards', this.generateFlashCardsNode.bind(this));
        workflow.addNode('extractConcepts', this.extractConceptsNode.bind(this));
        workflow.addNode('collectiveIntelligence', this.collectiveIntelligenceNode.bind(this));


        workflow.setEntryPoint('validateInput');
        workflow.addConditionalEdges(
            'validateInput',
            (state) => state.isUrl ? 'downloadUrl' : 'upload'
        );
        workflow.addEdge('downloadUrl', 'upload');
        workflow.addEdge('upload', 'understand');
        workflow.addEdge('understand', 'summarize');
        workflow.addEdge('summarize', 'extractKeyPoints');
        workflow.addEdge('extractKeyPoints', 'generateQuiz');
        workflow.addEdge('generateQuiz', 'generateFlashCards');
        workflow.addEdge('generateFlashCards', 'extractConcepts');
        workflow.addEdge('extractConcepts', 'collectiveIntelligence');
        workflow.addEdge('collectiveIntelligence', END);

        return workflow.compile();
    }


    async validateInputNode(state) {
        try {
            console.log('🔍 Step 0: Validating input...');


            if (state.videoUrl && state.videoUrl.trim() !== '') {
                console.log('📎 URL detected:', state.videoUrl);
                return {
                    ...state,
                    isUrl: true,
                    currentStep: 'downloadUrl',
                };
            } else if (state.filePath && state.filePath.trim() !== '') {
                console.log('📁 File path detected:', state.filePath);
                return {
                    ...state,
                    isUrl: false,
                    currentStep: 'upload',
                };
            } else {
                throw new Error('No video URL or file path provided');
            }
        } catch (error) {
            console.error('❌ Error validating input:', error);
            return {
                ...state,
                error: error.message,
                currentStep: 'error',
            };
        }
    }


    async downloadUrlNode(state) {
        try {
            console.log('⬇️ Step 1: Downloading video from URL...');

            const videoUrl = state.videoUrl;
            const uploadsDir = path.join(process.cwd(), 'uploads');


            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }


            const timestamp = Date.now();
            const filename = `video_${timestamp}.mp4`;
            const filePath = path.join(uploadsDir, filename);


            if (ytdl.validateURL(videoUrl)) {
                console.log('📺 YouTube URL detected, downloading...');

                const videoStream = ytdl(videoUrl, {
                    quality: 'highest',
                    filter: 'audioandvideo',
                });

                const writeStream = fs.createWriteStream(filePath);
                await streamPipeline(videoStream, writeStream);

                console.log('✅ YouTube video downloaded successfully');
            } else {

                console.log('🌐 Direct video URL detected, downloading...');

                const response = await axios({
                    method: 'GET',
                    url: videoUrl,
                    responseType: 'stream',
                    timeout: 60000,
                });

                const writeStream = fs.createWriteStream(filePath);
                await streamPipeline(response.data, writeStream);

                console.log('✅ Video downloaded successfully');
            }

            return {
                ...state,
                filePath: filePath,
                displayName: state.displayName || filename,
                currentStep: 'upload',
            };
        } catch (error) {
            console.error('❌ Error downloading video:', error);
            return {
                ...state,
                error: `Failed to download video: ${error.message}`,
                currentStep: 'error',
            };
        }
    }


    async uploadVideoNode(state) {
        try {
            console.log('📤 Step 1: Uploading video to Gemini...');

            const uploadResult = await fileManager.uploadFile(state.filePath, {
                mimeType: 'video/mp4',
                displayName: state.displayName,
            });


            let file = await fileManager.getFile(uploadResult.file.name);
            while (file.state === 'PROCESSING') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                file = await fileManager.getFile(uploadResult.file.name);
            }

            if (file.state === 'FAILED') {
                throw new Error('Video processing failed');
            }

            console.log('✅ Video uploaded successfully');

            return {
                ...state,
                videoFile: file,
                currentStep: 'understand',
            };
        } catch (error) {
            console.error('❌ Error uploading video:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                response: error.response?.data || error.response,
                stack: error.stack
            });
            return {
                ...state,
                error: `Video upload failed: ${error.message}`,
                currentStep: 'error',
            };
        }
    }


    async understandVideoNode(state) {
        try {
            console.log('🧠 Step 2: Understanding video content...');

            const prompt = `
You are an advanced multimodal AI system analyzing an educational video.

TASK: Extract comprehensive information from this video.

Provide the following in JSON format:
{
  "transcript": "Full spoken content from the video",
  "topic": "Main topic of the video",
  "learningObjective": "Primary learning objective",
  "importantMoments": [
    {
      "timestamp": "MM:SS",
      "description": "What happens at this moment",
      "type": "visual|text|concept|other"
    }
  ]
}

Be thorough and accurate. Only return valid JSON.`;


            await this.initializeModels();

            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent([
                    {
                        fileData: {
                            mimeType: state.videoFile.mimeType,
                            fileUri: state.videoFile.uri,
                        },
                    },
                    { text: prompt },
                ]);
            });

            const response = this.parseJSONResponse(result.response.text());

            console.log('✅ Video understanding complete');

            return {
                ...state,
                transcript: response.transcript || '',
                topic: response.topic || '',
                learningObjective: response.learningObjective || '',
                importantMoments: response.importantMoments || [],
                currentStep: 'summarize',
            };
        } catch (error) {
            console.error('❌ Error understanding video:', error);
            return {
                ...state,
                error: `Failed to understand video content: ${error.message}`,
                currentStep: 'error',
            };
        }
    }


    async summarizeVideoNode(state) {
        try {
            console.log('📝 Step 3: Generating summary...');

            const prompt = `
Based on this educational video, create a summary.

Topic: ${state.topic}
Learning Objective: ${state.learningObjective}
Transcript: ${state.transcript.substring(0, 3000)}

Keep it clear, educational, and learner-friendly.

Return strict JSON format:
{
  "summary": "A concise summary of 100-150 words",
  "tldr": "A single-line TL;DR"
}`;

            await this.initializeModels();
            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent(prompt);
            });
            const parsed = this.parseJSONResponse(result.response.text());

            console.log('✅ Summary generated');

            return {
                ...state,
                summary: {
                    full: parsed.summary,
                    tldr: parsed.tldr,
                },
                currentStep: 'extractKeyPoints',
            };
        } catch (error) {
            console.error('❌ Error generating summary:', error);
            return {
                ...state,
                error: `Failed to generate summary: ${error.message}`,
                currentStep: 'error',
            };
        }
    }


    async extractKeyPointsNode(state) {
        try {
            console.log('🔑 Step 4: Extracting key points...');

            const prompt = `
Extract 5-10 key learning points from this educational video.

Topic: ${state.topic}
Transcript: ${state.transcript.substring(0, 3000)}

Each point must be actionable, clearly explained, and based strictly on video content.

Return strict JSON format:
{
  "keyPoints": [
    {
      "point": "Brief title of the point",
      "explanation": "Detailed explanation",
      "timestamp": "Optional timestamp if relevant",
      "importance": 5 (number 1-5)
    }
  ]
}`;

            await this.initializeModels();
            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent(prompt);
            });
            const parsed = this.parseJSONResponse(result.response.text());

            console.log('✅ Key points extracted');

            return {
                ...state,
                keyPoints: parsed.keyPoints || [],
                currentStep: 'generateQuiz',
            };
        } catch (error) {
            console.error('❌ Error extracting key points:', error);
            return {
                ...state,
                keyPoints: [],
                currentStep: 'generateQuiz',
            };
        }
    }


    async generateQuizNode(state) {
        try {
            console.log('❓ Step 5: Generating quiz...');

            const prompt = `
Generate a quiz based ONLY on the content from this educational video.

Topic: ${state.topic}
Transcript: ${state.transcript.substring(0, 3000)}

Create exactly 5 Multiple Choice Questions with 4 options each.
Base questions ONLY on video content.

Return strict JSON format:
{
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, 
      "explanation": "Why this is correct",
      "timestamp": "Optional timestamp"
    }
  ]
}`;

            await this.initializeModels();
            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent(prompt);
            });
            const parsed = this.parseJSONResponse(result.response.text());

            console.log('✅ Quiz generated');

            return {
                ...state,
                quiz: parsed.quiz || [],
                currentStep: 'generateFlashCards',
            };
        } catch (error) {
            console.error('❌ Error generating quiz:', error);
            return {
                ...state,
                quiz: [],
                currentStep: 'generateFlashCards',
            };
        }
    }


    async generateFlashCardsNode(state) {
        try {
            console.log('🗂 Step 6: Generating flash cards...');

            const prompt = `
Create flash cards from the most important concepts in this educational video.

Topic: ${state.topic}
Transcript: ${state.transcript.substring(0, 3000)}

Generate 8-12 flash cards focusing on key definitions, steps, concepts, and formulas.
Keep answers concise and clear.

Return strict JSON format:
{
  "flashCards": [
    {
      "front": "Question or Term",
      "back": "Answer or Definition",
      "category": "Category tag"
    }
  ]
}`;

            await this.initializeModels();
            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent(prompt);
            });
            const parsed = this.parseJSONResponse(result.response.text());

            console.log('✅ Flash cards generated');

            return {
                ...state,
                flashCards: parsed.flashCards || [],
                currentStep: 'extractConcepts',
            };
        } catch (error) {
            console.error('❌ Error generating flash cards:', error);
            return {
                ...state,
                flashCards: [],
                currentStep: 'extractConcepts',
            };
        }
    }


    async extractConceptsNode(state) {
        try {
            console.log('💡 Step 7: Extracting concepts...');

            const prompt = `
Identify the main concepts, ideas, and topics discussed in this educational video.

Topic: ${state.topic}
Transcript: ${state.transcript.substring(0, 3000)}

Focus on key terminology, main ideas, important principles, and recurring themes.

Return strict JSON format:
{
  "concepts": [
    {
      "name": "Concept name",
      "frequency": 1,
      "context": "Context where it was mentioned"
    }
  ]
}`;

            await this.initializeModels();
            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent(prompt);
            });
            const parsed = this.parseJSONResponse(result.response.text());

            console.log('✅ Concepts extracted');

            return {
                ...state,
                concepts: parsed.concepts || [],
                currentStep: 'collectiveIntelligence',
            };
        } catch (error) {
            console.error('❌ Error extracting concepts:', error);
            return {
                ...state,
                concepts: [],
                currentStep: 'collectiveIntelligence',
            };
        }
    }


    async collectiveIntelligenceNode(state) {
        try {
            console.log('🔥 Step 8: Analyzing collective intelligence...');

            const knowledgeCards = [];

            for (const concept of state.concepts) {
                let card = await KnowledgeCard.findOne({ concept: concept.name });

                if (card) {
                    card.frequency += 1;
                    card.relatedVideos.push({
                        videoAnalysisId: state.videoAnalysisId,
                        context: concept.context,
                    });
                    card.calculateImportanceScore();
                    await card.save();
                } else {
                    card = new KnowledgeCard({
                        concept: concept.name,
                        description: concept.context || concept.name,
                        frequency: 1,
                        relatedVideos: [{
                            videoAnalysisId: state.videoAnalysisId,
                            context: concept.context,
                        }],
                        category: 'general',
                    });
                    card.calculateImportanceScore();
                    await card.save();
                }

                knowledgeCards.push(card);
            }

            const popularCards = await KnowledgeCard.find({ frequency: { $gte: 3 } })
                .sort({ importanceScore: -1 })
                .limit(10);

            console.log('✅ Collective intelligence analysis complete');

            return {
                ...state,
                popularKnowledgeCards: popularCards,
                currentStep: 'completed',
            };
        } catch (error) {
            console.error('❌ Error in collective intelligence:', error);
            return {
                ...state,
                popularKnowledgeCards: [],
                currentStep: 'completed',
            };
        }
    }


    async analyzeVideoComplete(filePath, displayName, videoAnalysisId, videoUrl = null) {
        try {
            console.log('🚀 Starting Refactored video analysis workflow...');
            console.log('Input parameters:', {
                filePath: filePath || 'N/A',
                videoUrl: videoUrl || 'N/A',
                displayName,
                videoAnalysisId,
                isUrl: !!videoUrl
            });

            const initialState = {
                videoFile: null,
                filePath: filePath || '',
                videoUrl: videoUrl || '',
                isUrl: !!videoUrl,
                displayName: displayName,
                videoAnalysisId: videoAnalysisId,
                transcript: '',
                topic: '',
                learningObjective: '',
                importantMoments: [],
                summary: { full: '', tldr: '' },
                keyPoints: [],
                quiz: [],
                flashCards: [],
                concepts: [],
                popularKnowledgeCards: [],
                error: null,
                currentStep: 'validateInput',
            };

            console.log('📋 Initial state prepared, invoking workflow...');


            let finalState;
            try {
                finalState = await this.graph.invoke(initialState);
            } catch (workflowError) {
                console.error('❌ Workflow execution error:', workflowError);
                console.error('Error details:', {
                    message: workflowError.message,
                    stack: workflowError.stack,
                    currentStep: initialState.currentStep
                });
                throw new Error(`Workflow failed: ${workflowError.message}`);
            }


            if (finalState.error) {
                console.error('❌ Workflow completed with error:', finalState.error);
                throw new Error(`Analysis failed: ${finalState.error}`);
            }

            console.log('🎉 Video analysis workflow completed successfully!');
            console.log('Final step reached:', finalState.currentStep);

            return {
                transcript: finalState.transcript,
                topic: finalState.topic,
                learningObjective: finalState.learningObjective,
                importantMoments: finalState.importantMoments,
                summary: finalState.summary,
                keyPoints: finalState.keyPoints,
                quiz: finalState.quiz,
                flashCards: finalState.flashCards,
                concepts: finalState.concepts,
                popularKnowledgeCards: finalState.popularKnowledgeCards,
            };
        } catch (error) {
            console.error('❌❌❌ CRITICAL ERROR in analyzeVideoComplete ❌❌❌');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }


    async translateContent(transcript, summary, targetLanguage) {
        try {
            const prompt = `
Translate the following educational content to ${targetLanguage}.

Maintain educational clarity, original meaning and tone, and technical accuracy.

TRANSCRIPT:
${transcript.substring(0, 2000)}

SUMMARY:
${summary.full}

TL;DR:
${summary.tldr}

Return strict JSON format:
{
  "transcript": "Translated transcript...",
  "summary": {
    "full": "Translated summary...",
    "tldr": "Translated TL;DR..."
  }
}`;

            await this.initializeModels();
            const result = await retryWithBackoff(async () => {
                return await this.model.generateContent(prompt);
            });
            const parsed = this.parseJSONResponse(result.response.text());

            return parsed;
        } catch (error) {
            console.error('Error translating content:', error);
            throw error;
        }
    }


    parseJSONResponse(response) {
        try {
            let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Failed to parse AI response');
        }
    }
}

export default new LangGraphVideoService();
