import { Router } from 'express';
import { addMatch, deleteMatch, getMatchbyId, getMatches, updateMatch } from './match.controller.js';

const matchRouter = Router();
matchRouter.post('/create', addMatch);
matchRouter.get('/allmatches', getMatches);
matchRouter.get('/:id', getMatchbyId);
matchRouter.put('/update/:id', updateMatch);
matchRouter.delete('/delete/:id', deleteMatch);



export default matchRouter;