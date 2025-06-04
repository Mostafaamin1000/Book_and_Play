import {Router} from 'express';
import { createTournament, deleteTournament, getAllTournaments, getTournamentById, registerTeamToTournament, updateTournament } from './tournament.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const tournamentRouter = Router()


tournamentRouter.post('/create',protectedRouter,allowTo('admin'),createTournament)
tournamentRouter.post('/:id/register',protectedRouter,allowTo('admin','player'),registerTeamToTournament)
tournamentRouter.get('/all',getAllTournaments)
tournamentRouter.get('/:id',getTournamentById)
tournamentRouter.put('/update/:id',protectedRouter,allowTo('admin'),updateTournament)
tournamentRouter.delete('/delete/:id',protectedRouter,allowTo('admin'),deleteTournament)

export default tournamentRouter