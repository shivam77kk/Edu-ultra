import Team from '../models/Team.js';
import User from '../models/User.js';

// @desc    Create a new team
// @route   POST /api/collaboration/teams
// @access  Private
export const createTeam = async (req, res) => {
    try {
        const team = await Team.create({
            name: req.body.name,
            description: req.body.description,
            leader: req.user.id,
            members: [req.user.id], // Leader is first member
            skillsRequired: req.body.skillsRequired,
            projectIdea: req.body.projectIdea,
            hackathonName: req.body.hackathonName
        });

        res.status(201).json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Join a team
// @route   POST /api/collaboration/teams/:id/join
// @access  Private
export const joinTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, error: 'Team not found' });
        }

        if (team.members.includes(req.user.id)) {
            return res.status(400).json({ success: false, error: 'Already a member' });
        }

        team.members.push(req.user.id);
        await team.save();

        res.status(200).json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get All Teams
// @route   GET /api/collaboration/teams
// @access  Private
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate('leader', 'name avatar');
        res.status(200).json({ success: true, count: teams.length, data: teams });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Leaderboard (Gamification)
// @route   GET /api/collaboration/leaderboard
// @access  Private
// Leaderboard based on calculated "points" (e.g. valid quizzes taken, streak)
// For MVP, we'll assume a 'points' field on User or calculate from Results
export const getLeaderboard = async (req, res) => {
    try {
        // Limitation: We didn't explicitly add 'points' to User model yet.
        // Let's rely on a virtual or simple sort if 'points' existed, 
        // OR aggregate from Results. for speed: simple fetch.

        // TODO: Add 'points' field to User model for efficiency.
        // using 'dailyStudyTimePreference' as a dummy sort metric for now or just random
        const users = await User.find().select('name avatar role').limit(10);

        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
