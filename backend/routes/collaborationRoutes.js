import express from 'express';
import { createTeam, joinTeam, getTeams, getLeaderboard } from '../controllers/collaborationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/teams', createTeam);
router.post('/teams/:id/join', joinTeam);
router.get('/teams', getTeams);
router.get('/leaderboard', getLeaderboard);

// Advanced features
router.get('/teams/:id/invite', getInviteCode);
router.post('/teams/join-invite', joinByInvite);
router.post('/teams/:id/invite-email', inviteMember);
router.get('/teams/:id/messages', getTeamMessages);
router.post('/teams/:id/messages', sendMessage);
router.post('/teams/:id/polls', createPoll);
router.post('/teams/polls/vote', votePoll);

export default router;
