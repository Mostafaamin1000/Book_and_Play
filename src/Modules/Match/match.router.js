import { Router } from 'express';
import { addMatch, deleteMatch, getAvailableMatches, getMatchbyId, getMatches, getUserMatches, joinMatch, unjoinMatch, updateMatch } from './match.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const matchRouter = Router();
matchRouter.post('/create',protectedRouter, allowTo('player', 'owner') ,addMatch);
matchRouter.post('/:id/join',protectedRouter, allowTo('player') , joinMatch);

matchRouter.get('/available', getAvailableMatches);
matchRouter.get('/:userId', getUserMatches);
matchRouter.get('/allmatches', getMatches);
matchRouter.get('/:id', getMatchbyId);

matchRouter.put('/update/:id', updateMatch);

matchRouter.delete('/delete/:id', deleteMatch);
matchRouter.delete('/:id/unjoin',protectedRouter, allowTo('player') , unjoinMatch);

export default matchRouter;