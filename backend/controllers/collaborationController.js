import Team from '../models/Team.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Poll from '../models/Poll.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Helper for Email (Basic/Stub)
const sendEmail = async (to, subject, text) => {
    // In production, configure proper transporter
    console.log(`[Email Simulation] To: ${to}, Subject: ${subject}, Body: ${text}`);
    // If credentials exist, try sending
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== 'your_app_password') {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
        } catch (e) { console.error("Email send failed", e); }
    }
};

// ... existing createTeam ...
export const createTeam = async (req, res) => {
    try {
        const team = await Team.create({
            name: req.body.name,
            description: req.body.description,
            leader: req.user.id,
            members: [req.user.id],
            skillsRequired: req.body.skillsRequired,
            projectIdea: req.body.projectIdea,
            privacy: req.body.isPrivate ? 'private' : 'public',
            inviteCode: crypto.randomBytes(4).toString('hex') // Generate invite code
        });
        res.status(201).json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc Generate/Get Invite Link/Code
export const getInviteCode = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
        // Only members/leader can see invite
        if (!team.members.includes(req.user.id)) return res.status(403).json({ success: false, error: 'Not authorized' });

        if (!team.inviteCode) {
            team.inviteCode = crypto.randomBytes(4).toString('hex');
            await team.save();
        }
        res.status(200).json({ success: true, inviteCode: team.inviteCode });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc Join by Invite Code
export const joinByInvite = async (req, res) => {
    const { inviteCode } = req.body;
    try {
        const team = await Team.findOne({ inviteCode });
        if (!team) return res.status(404).json({ success: false, error: 'Invalid invite code' });

        if (team.members.includes(req.user.id)) return res.status(400).json({ success: false, error: 'Already a member' });

        team.members.push(req.user.id);
        await team.save();
        res.status(200).json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc Invite Member via Email
export const inviteMember = async (req, res) => {
    const { email } = req.body;
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ success: false, error: 'Team not found' });

        const inviteLink = `${process.env.FRONTEND_URL}/dashboard/teams/join?code=${team.inviteCode}`;
        const message = `You have been invited to join the team "${team.name}" on Edu-Ultra.\n\nClick here to join: ${inviteLink}`;

        await sendEmail(email, 'Team Invitation', message);
        res.status(200).json({ success: true, message: 'Invitation sent' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ... existing joinTeam (public join) ...
export const joinTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
        if (team.privacy === 'private') return res.status(403).json({ success: false, error: 'Cannot join private team without invite' });
        if (team.members.includes(req.user.id)) return res.status(400).json({ success: false, error: 'Already a member' });

        team.members.push(req.user.id);
        await team.save();
        res.status(200).json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ... existing getTeams (filter private) ...
export const getTeams = async (req, res) => {
    try {
        // Only show public teams OR teams user is member of
        const teams = await Team.find({
            $or: [
                { privacy: 'public' },
                { members: req.user.id }
            ]
        }).populate('leader', 'name avatar');
        res.status(200).json({ success: true, count: teams.length, data: teams });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Messages & Chat
export const getTeamMessages = async (req, res) => {
    try {
        const messages = await Message.find({ team: req.params.id })
            .populate('sender', 'name avatar')
            .populate('poll')
            .sort({ createdAt: 1 }); // Oldest first for chat history
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { content, type, pollId, fileUrl, fileName } = req.body;
        const message = await Message.create({
            team: req.params.id,
            sender: req.user.id,
            content: content || (type === 'poll' ? 'Poll Created' : 'File Shared'),
            type: type || 'text',
            poll: pollId,
            fileUrl,
            fileName
        });

        // Populate sender for immediate frontend display
        await message.populate('sender', 'name avatar');
        if (pollId) await message.populate('poll');

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Polls
export const createPoll = async (req, res) => {
    const { question, options } = req.body; // options: ['A', 'B']
    try {
        const poll = await Poll.create({
            question,
            team: req.params.id,
            creator: req.user.id,
            options: options.map(opt => ({ text: opt, votes: [] }))
        });

        // Add poll to team
        await Team.findByIdAndUpdate(req.params.id, { $push: { polls: poll._id } });

        res.status(201).json({ success: true, data: poll });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const votePoll = async (req, res) => {
    const { pollId, optionId } = req.body;
    try {
        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ success: false, error: 'Poll not found' });

        // Remove previous vote if any (single choice)
        poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(v => v.toString() !== req.user.id);
        });

        // Add new vote
        const option = poll.options.id(optionId);
        if (option) {
            option.votes.push(req.user.id);
            await poll.save();
            res.status(200).json({ success: true, data: poll });
        } else {
            res.status(404).json({ success: false, error: 'Option not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ... existing getLeaderboard ...
export const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find().select('name avatar role').limit(10);
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
