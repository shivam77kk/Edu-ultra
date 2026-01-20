import Resource from '../models/Resource.js';
import * as geminiService from '../services/geminiService.js';

// @desc    Upload a new resource
// @route   POST /api/resources/upload
// @access  Private
// Expects 'file' in form-data
export const uploadResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { title, description, tags, type } = req.body;

        // Create Resource
        const resource = await Resource.create({
            title,
            description,
            type: type || 'image', // default fallback, logic should ideally infer from mimetype
            url: req.file.path,
            publicId: req.file.filename,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.user.id
        });

        // Optional: Trigger async AI summary generation here
        // For MVP, we'll leave it as null or a separate endpoint 'generate-summary'

        res.status(201).json({ success: true, data: resource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
// Note: Should also delete from Cloudinary using cloudinary.uploader.destroy
export const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        // Make sure user owns resource
        if (resource.uploadedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await resource.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
