import express from 'express';
const router = express.Router();
import {
    upload,
    analyzeVideo,
    getVideoAnalysis,
    getUserVideoAnalyses,
    translateVideoContent,
    getPopularKnowledgeCards,
    deleteVideoAnalysis
} from '../controllers/videoAnalysisController.js';



const uploadMiddleware = (req, res, next) => {
    
    const multerUpload = upload.any();

    multerUpload(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            
            if (!req.body || !req.body.videoUrl) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
        }

        
        if (req.files && req.files.length > 0) {
            
            req.file = req.files.find(f => f.fieldname === 'video') || req.files[0];
        }

        console.log('✅ Upload middleware passed');
        console.log('Files:', req.files);
        console.log('Body:', req.body);

        next();
    });
};

router.post('/analyze', uploadMiddleware, analyzeVideo);


router.get('/:id', getVideoAnalysis);


router.get('/user/:userId', getUserVideoAnalyses);


router.post('/translate/:id', translateVideoContent);


router.get('/knowledge-cards', getPopularKnowledgeCards);


router.delete('/:id', deleteVideoAnalysis);

export default router;
