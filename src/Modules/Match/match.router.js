import { Router } from 'express';
import { addMatch, deleteMatch, getMatchbyId, getMatches, joinMatch, updateMatch } from './match.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const matchRouter = Router();
matchRouter.post('/create',protectedRouter, allowTo('player', 'owner') ,addMatch);
matchRouter.post('/:id/join',protectedRouter, allowTo('player', 'owner') , joinMatch);
matchRouter.get('/allmatches', getMatches);
matchRouter.get('/:id', getMatchbyId);
matchRouter.put('/update/:id', updateMatch);
matchRouter.delete('/delete/:id', deleteMatch);



export default matchRouter;