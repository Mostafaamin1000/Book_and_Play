import { Router } from 'express';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';
import { createTeam, deleteTeam, getTeamById, getTeamsByTournament, updateTeam } from './team.controller.js';
import { uploadSingleFileCloud } from '../../middlewares/uploadCloud.js';


const teamRouter = Router();

teamRouter.post('/create', protectedRouter, allowTo('player'),uploadSingleFileCloud('logo', 'teams') ,createTeam);
teamRouter.get('/tournament/:tournamentId', getTeamsByTournament)
teamRouter.get('/:id', getTeamById)
teamRouter.put('/update/:id',protectedRouter, allowTo('player','owner'),uploadSingleFileCloud('logo', 'teams') , updateTeam)
teamRouter.delete('/delete/:id',protectedRouter, allowTo('player','owner'),uploadSingleFileCloud('logo', 'teams') , deleteTeam)

export default teamRouter;
