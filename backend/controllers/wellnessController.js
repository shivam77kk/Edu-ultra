import Wellness from '../models/Wellness.js';
import * as fitService from '../services/googleFitService.js';





export const syncWellnessData = async (req, res) => {
    const { accessToken } = req.body;

    try {
        const fitData = await fitService.getFitnessDataArgs(accessToken);
        const analysis = fitService.analyzeWellnessArgs(fitData);

        
        const wellness = await Wellness.create({
            user: req.user.id,
            sleepHours: fitData.sleepHours,
            steps: fitData.steps,
            focusScore: analysis.focusScore,
            alertGenerated: analysis.alert
        });

        res.status(200).json({
            success: true,
            data: wellness,
            analysis
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const getWellnessData = async (req, res) => {
    try {
        const wellness = await Wellness.findOne({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, data: wellness });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
