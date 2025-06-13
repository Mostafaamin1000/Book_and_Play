import { Router } from 'express';
import { advanceTournamentRound, getPlayedMatchesWithWinners, getTournamentMatchesByRound, getWinnersOfRound, startTournament, updateMatchResult } from './Knockout.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const knockoutRouter = Router();
//! start the tournament
knockoutRouter.post('/tournament/:tournamentId/start', startTournament);
//! update the match result
knockoutRouter.patch('/match/:matchId/result',protectedRouter , allowTo('owner') ,updateMatchResult);
//! advance the tournament round
knockoutRouter.post('/tournament/:tournamentId/advance', advanceTournamentRound);
//! get all matches of tournament in each round
knockoutRouter.get('/tournaments/:tournamentId/matches', getTournamentMatchesByRound)
//! get the winner of each round
knockoutRouter.get('/tournament/:tournamentId/round-winners', getWinnersOfRound);
//! get the winner of each match
knockoutRouter.get('/tournaments/:tournamentId/matchresults', getPlayedMatchesWithWinners);


export default knockoutRouter;