import Resource from '../models/Resource.js';
import * as geminiService from '../services/geminiService.js';





export const uploadResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { title, description, tags, type } = req.body;

        
        const resource = await Resource.create({
            title,
            description,
            type: type || 'image', 
            url: req.file.path,
            publicId: req.file.filename,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.user.id
        });

        
        

        res.status(201).json({ success: true, data: resource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};





export const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        
        if (resource.uploadedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await resource.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        
        if (resource.uploadedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: resource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        
        if (resource.uploadedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const { title, description, tags } = req.body;

        resource.title = title || resource.title;
        resource.description = description || resource.description;
        resource.tags = tags ? tags.split(',').map(tag => tag.trim()) : resource.tags;

        await resource.save();

        res.status(200).json({ success: true, data: resource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

