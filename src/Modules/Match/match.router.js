import { Router } from 'express';
import { addMatch, deleteMatch, getAvailableMatches, getMatchbyId, getMatches, getUserMatches, joinMatch, unjoinMatch, updateMatch } from './match.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const matchRouter = Router();
matchRouter.post('/create',protectedRouter, allowTo('player', 'owner') ,addMatch);
matchRouter.post('/:id/join',protectedRouter, allowTo('player') , joinMatch);
matchRouter.get('/:userId', getUserMatches);
matchRouter.get('/available', getAvailableMatches);
matchRouter.get('/allmatches', getMatches);
matchRouter.get('/:id', getMatchbyId);
matchRouter.put('/update/:id', updateMatch);
matchRouter.delete('/:id/unjoin', unjoinMatch);
matchRouter.delete('/delete/:id', deleteMatch);



export default matchRouter;