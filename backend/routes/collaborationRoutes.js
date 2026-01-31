import express from 'express';
import { createTeam, joinTeam, getTeams, getLeaderboard } from '../controllers/collaborationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/teams', createTeam);
router.post('/teams/:id/join', joinTeam);
router.get('/teams', getTeams);
router.get('/leaderboard', getLeaderboard);











export default router;
