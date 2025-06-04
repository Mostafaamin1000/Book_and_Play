import { Router } from 'express';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';
import { createTeam } from './team.controller.js';
import { uploadSingleFileCloud } from '../../middlewares/uploadCloud.js';


const teamRouter = Router();

teamRouter.post('/create', protectedRouter, allowTo('player'),uploadSingleFileCloud('logo', 'teams') ,createTeam);

export default teamRouter;
