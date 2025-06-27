import { Team } from "../../../DB/Models/team.schema.js";
import { Tournament } from "../../../DB/Models/tournament.schema.js";
import { User } from "../../../DB/Models/user.schema.js";
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

const addMemberToTeam = catchError(async (req, res, next) => {
  const { teamId, memberId } = req.body;
  const userId = req.user._id;

const team = await Team.findById(teamId).populate("tournament").populate("members", "name email");
if (!team) return next(new AppError("Team not found", 404));

const member = await User.findById(memberId);
if (!member) {
return next(new AppError("User to add not found", 404))}

  if (team.createdBy.toString() !== userId.toString()) {
    return next(new AppError("Only the team creator can add members", 403))}

  if (team.members.includes(memberId)) {
    return next(new AppError("User is already in the team", 400))}

  const existingTeam = await Team.findOne({
    tournament: team.tournament._id,
    members: memberId})
  if (existingTeam) {
    return next(new AppError("User already joined a team in this tournament", 400));
  }

  const MAX_MEMBERS =7;
  if (team.members.length >= MAX_MEMBERS) {
    return next(new AppError("Team is already full", 400))}

  team.members.push(memberId);
  await team.save();
  await team.populate("members", "name email");
  res.status(200).json({
    message: "Member added successfully",
    team,
  });
});

const removeMemberFromTeam = catchError(async (req, res, next) => {
  const { teamId, memberId } = req.body;
  const userId = req.user._id;

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  const isCreator = team.createdBy.toString() === userId.toString();
  const isRemovingSelf = memberId.toString() === userId.toString();

  if (!team.members.includes(memberId)) {
    return next(new AppError("User is not a member of the team", 400));
  }

  if (!isCreator && !isRemovingSelf) {
    return next(new AppError("You are not allowed to remove this member", 403));
  }

  if (isCreator && isRemovingSelf) {
    return next(new AppError("Team creator cannot leave their own team", 400)) }

  team.members = team.members.filter(
    (id) => id.toString() !== memberId.toString()
  );
  await team.save();

  res.status(200).json({
    message: isRemovingSelf
      ? "You have left the team successfully"
      : "Member removed successfully",
    team,
  });
});



const getTeamsByTournament = catchError(async (req, res, next) => {
  const { tournamentId } = req.params
  const tournament = await Tournament.findById(tournamentId).populate('teams');
  if (!tournament) {
    return next(new AppError('Tournament not found', 404))}

  res.status(200).json({
    message: 'Teams in tournament',
    teams: tournament.teams})
})

const getTeamById = catchError(async (req, res, next) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email') 
    .populate('tournament', 'name');

  if (!team) {
    return next(new AppError('Team not found', 404)) }
  res.status(200).json({ message: 'Team data', team });
});

const updateTeam = catchError(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new AppError('Team not found', 404));

  if (team.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not allowed to update this team', 403)) }

  if (req.file) req.body.logo = req.file.path  
  const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ message: 'Team updated successfully', team: updatedTeam });
})

const deleteTeam = catchError(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new AppError('Team not found', 404));

  if (team.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not allowed to delete this team', 403)) }

  await Tournament.findByIdAndUpdate(team.tournament, {
    $pull: { teams: team._id },
  });
  await team.deleteOne();
  res.status(200).json({ message: 'Team deleted successfully' });
});


export {
     createTeam,
     addMemberToTeam,
     removeMemberFromTeam,
     getTeamsByTournament,
     getTeamById,
     updateTeam,
     deleteTeam
 };