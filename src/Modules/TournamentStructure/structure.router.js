import {Router} from "express";
import { generateFinalMatch, generateGroupStageMatches, generateKnockoutMatches, updateMatchScore } from "./structure.controller.js";

const TournamentStructureRouter = Router();



TournamentStructureRouter.post("/generate-group-matches/:tournamentId", generateGroupStageMatches);
TournamentStructureRouter.post('/generate-semifinals/:tournamentId', generateKnockoutMatches);
TournamentStructureRouter.post('/generate-final/:tournamentId', generateFinalMatch);
TournamentStructureRouter.put("/:matchId/score", updateMatchScore);

export default TournamentStructureRouter;