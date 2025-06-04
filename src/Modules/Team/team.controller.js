import { Team } from "../../../DB/Models/team.schema.js";
import { Tournament } from "../../../DB/Models/tournament.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";

const createTeam = catchError(async (req, res, next) => {
  const { name, tournamentId } = req.body;
  const userId = req.user._id;
  const logo = req.file?.path; 

  if (!name || !tournamentId) {
    return next(new AppError("Team name and tournament ID are required", 400))}

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    return next(new AppError("Tournament not found", 404))}

  if (tournament.teams.length >= tournament.max_teams) {
    return next(new AppError("Tournament is already full", 400))}

  const team = new Team({
    name,
    logo,
    tournament: tournamentId,
    createdBy: userId,
    members: [userId] });
  await team.save();

  tournament.teams.push(team._id);
  await tournament.save();

  res.status(201).json({
    message: "Team created successfully",
    team: {
      _id: team._id,
      name: team.name,
      logo: team.logo,
      tournament: team.tournament,
      createdBy: team.createdBy,
      members: team.members,
      createdAt: team.createdAt }})
})


export {
     createTeam,
 };