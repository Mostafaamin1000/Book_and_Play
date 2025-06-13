import {Router} from 'express';
import { createTournament, deleteTournament, getAllTournaments, getTournamentById, getTournamentDetails, registerTeamToTournament, updateTournament } from './tournament.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const tournamentRouter = Router()


tournamentRouter.post('/create',protectedRouter,allowTo('owner'),createTournament)
tournamentRouter.post('/:id/register',protectedRouter,allowTo('owner','player'),registerTeamToTournament)
tournamentRouter.get('/details/:id',getTournamentDetails)
tournamentRouter.get('/all',getAllTournaments)
tournamentRouter.get('/:id',getTournamentById)
tournamentRouter.put('/update/:id',protectedRouter,allowTo('owner'),updateTournament)
tournamentRouter.delete('/delete/:id',protectedRouter,allowTo('owner'),deleteTournament)

export default tournamentRouter