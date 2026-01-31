import VideoAnalysis from '../models/VideoAnalysis.js';
import KnowledgeCard from '../models/KnowledgeCard.js';
import geminiVideoService from '../services/geminiVideoService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/videos');

        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    
    if (!file && req.body.videoUrl) {
        cb(null, true);
        return;
    }

    
    const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, 
    }
});


const analyzeVideo = async (req, res) => {
    try {
        console.log('📥 Analyze video request received');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file ? 'File present' : 'No file');

        const { userId, videoUrl } = req.body;

        if (!userId) {
            console.log('❌ No userId provided');
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        
        if (!req.file && !videoUrl) {
            console.log('❌ No file or URL provided');
            return res.status(400).json({
                success: false,
                message: 'Either video file or video URL is required'
            });
        }

        console.log('✅ Validation passed. Creating video analysis record...');

        
        const videoAnalysis = new VideoAnalysis({
            userId: userId,
            videoMetadata: {
                filename: req.file ? req.file.filename : 'url_video',
                originalName: req.file ? req.file.originalname : videoUrl,
                size: req.file ? req.file.size : 0,
                mimeType: req.file ? req.file.mimetype : 'video/mp4',
            },
            processingStatus: 'processing'
        });

        try {
            await videoAnalysis.save();
            console.log('✅ Video analysis record created:', videoAnalysis._id);
        } catch (saveError) {
            console.error('❌ MongoDB save error:', saveError);
            console.error('Save error details:', saveError.message);
            throw new Error(`Failed to save video analysis record: ${saveError.message}`);
        }

        
        const filePath = req.file ? req.file.path : null;
        const displayName = req.file ? req.file.originalname : 'Video from URL';

        console.log('🚀 Starting video analysis...');
        console.log('File path:', filePath);
        console.log('Video URL:', videoUrl);
        console.log('Display name:', displayName);

        try {
            console.log('📞 Calling geminiVideoService.analyzeVideoComplete...');
            console.log('Parameters:', {
                filePath: filePath || 'null',
                displayName,
                videoAnalysisId: videoAnalysis._id,
                videoUrl: videoUrl || 'null'
            });

            
            const analysisResult = await geminiVideoService.analyzeVideoComplete(
                filePath,
                displayName,
                videoAnalysis._id,
                videoUrl  
            );

            console.log('✅ geminiVideoService.analyzeVideoComplete completed successfully');
            console.log('Analysis result keys:', Object.keys(analysisResult));

            
            videoAnalysis.transcript = analysisResult.transcript;
            videoAnalysis.topic = analysisResult.topic;
            videoAnalysis.learningObjective = analysisResult.learningObjective;
            videoAnalysis.importantMoments = analysisResult.importantMoments;
            videoAnalysis.summary = {
                full: analysisResult.summary.summary,
                tldr: analysisResult.summary.tldr
            };
            videoAnalysis.keyPoints = analysisResult.keyPoints;
            videoAnalysis.quiz = analysisResult.quiz;
            videoAnalysis.flashCards = analysisResult.flashCards;
            videoAnalysis.concepts = analysisResult.concepts;
            videoAnalysis.processingStatus = 'completed';

            await videoAnalysis.save();

            
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ Cleaned up uploaded file');
            }

            
            const response = {
                success: true,
                message: 'Video analyzed successfully',
                analysisId: videoAnalysis._id,
                data: {
                    analysisId: videoAnalysis._id,
                    '📌 Video Summary': {
                        summary: videoAnalysis.summary.full,
                        tldr: videoAnalysis.summary.tldr,
                        topic: videoAnalysis.topic,
                        learningObjective: videoAnalysis.learningObjective
                    },
                    '🧠 Key Points': videoAnalysis.keyPoints,
                    '❓ Quiz': videoAnalysis.quiz,
                    '🗂 Flash Cards': videoAnalysis.flashCards,
                    '🔥 Popular Knowledge Cards': analysisResult.popularKnowledgeCards.map(card => ({
                        concept: card.concept,
                        description: card.description,
                        frequency: card.frequency,
                        category: card.category,
                        importanceScore: card.importanceScore
                    }))
                }
            };

            res.status(200).json(response);

        } catch (analysisError) {
            console.error('❌ Error during video analysis:', analysisError);
            console.error('Error stack:', analysisError.stack);

            
            videoAnalysis.processingStatus = 'failed';
            videoAnalysis.errorMessage = analysisError.message;
            await videoAnalysis.save();

            
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ Cleaned up uploaded file');
            }

            
            res.status(500).json({
                success: false,
                message: analysisError.message || 'Video analysis failed',
                error: analysisError.message,
                fallback: {
                    '📌 Video Summary': {
                        summary: 'Unable to analyze video. Please ensure the video contains clear audio and visual content.',
                        tldr: 'Analysis failed'
                    },
                    '🧠 Key Points': [],
                    '❓ Quiz': [],
                    '🗂 Flash Cards': [],
                    '🔥 Popular Knowledge Cards': []
                }
            });
        }

    } catch (error) {
        console.error('❌❌❌ CRITICAL ERROR in analyzeVideo controller ❌❌❌');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        console.error('Request body:', req.body);
        console.error('Request file:', req.file);

        res.status(500).json({
            success: false,
            message: 'Server error during video upload',
            error: error.message,
            details: error.stack
        });
    }
};


const getVideoAnalysis = async (req, res) => {
    try {
        const { id } = req.params;

        const videoAnalysis = await VideoAnalysis.findById(id);

        if (!videoAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'Video analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                '📌 Video Summary': {
                    summary: videoAnalysis.summary.full,
                    tldr: videoAnalysis.summary.tldr,
                    topic: videoAnalysis.topic,
                    learningObjective: videoAnalysis.learningObjective
                },
                '🧠 Key Points': videoAnalysis.keyPoints,
                '❓ Quiz': videoAnalysis.quiz,
                '🗂 Flash Cards': videoAnalysis.flashCards,
                '🌍 Translations': videoAnalysis.translations,
                metadata: {
                    processingStatus: videoAnalysis.processingStatus,
                    createdAt: videoAnalysis.createdAt,
                    videoMetadata: videoAnalysis.videoMetadata
                }
            }
        });

    } catch (error) {
        console.error('Error in getVideoAnalysis:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const getUserVideoAnalyses = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, skip = 0 } = req.query;

        const analyses = await VideoAnalysis.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .select('-transcript -concepts'); 

        const total = await VideoAnalysis.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > (parseInt(skip) + parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error in getUserVideoAnalyses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const translateVideoContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetLanguage } = req.body;

        if (!targetLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Target language is required'
            });
        }

        const videoAnalysis = await VideoAnalysis.findById(id);

        if (!videoAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'Video analysis not found'
            });
        }

        
        const existingTranslation = videoAnalysis.translations.find(
            t => t.language.toLowerCase() === targetLanguage.toLowerCase()
        );

        if (existingTranslation) {
            return res.status(200).json({
                success: true,
                message: 'Translation already exists',
                data: {
                    '🌍 Translation': existingTranslation
                }
            });
        }

        
        const translationResult = await geminiVideoService.translateContent(
            videoAnalysis.transcript,
            videoAnalysis.summary,
            targetLanguage
        );

        
        videoAnalysis.translations.push({
            language: targetLanguage,
            transcript: translationResult.transcript,
            summary: translationResult.summary
        });

        await videoAnalysis.save();

        res.status(200).json({
            success: true,
            message: 'Translation completed successfully',
            data: {
                '🌍 Translation': {
                    language: targetLanguage,
                    transcript: translationResult.transcript,
                    summary: translationResult.summary
                }
            }
        });

    } catch (error) {
        console.error('Error in translateVideoContent:', error);
        res.status(500).json({
            success: false,
            message: 'Translation failed',
            error: error.message
        });
    }
};


const getPopularKnowledgeCards = async (req, res) => {
    try {
        const { category, minFrequency = 2, limit = 20 } = req.query;

        const query = { frequency: { $gte: parseInt(minFrequency) } };

        if (category) {
            query.category = category;
        }

        const knowledgeCards = await KnowledgeCard.find(query)
            .sort({ importanceScore: -1, frequency: -1 })
            .limit(parseInt(limit))
            .populate('relatedVideos.videoAnalysisId', 'topic videoMetadata.originalName');

        res.status(200).json({
            success: true,
            data: {
                '🔥 Popular Knowledge Cards': knowledgeCards.map(card => ({
                    concept: card.concept,
                    description: card.description,
                    category: card.category,
                    frequency: card.frequency,
                    importanceScore: card.importanceScore,
                    relatedVideosCount: card.relatedVideos.length,
                    examples: card.examples,
                    tags: card.tags
                }))
            }
        });

    } catch (error) {
        console.error('Error in getPopularKnowledgeCards:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const deleteVideoAnalysis = async (req, res) => {
    try {
        const { id } = req.params;

        const videoAnalysis = await VideoAnalysis.findByIdAndDelete(id);

        if (!videoAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'Video analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video analysis deleted successfully'
        });

    } catch (error) {
        console.error('Error in deleteVideoAnalysis:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export {
    upload,
    analyzeVideo,
    getVideoAnalysis,
    getUserVideoAnalyses,
    translateVideoContent,
    getPopularKnowledgeCards,
    deleteVideoAnalysis
};
