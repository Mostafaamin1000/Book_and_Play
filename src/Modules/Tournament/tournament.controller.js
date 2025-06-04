import { Tournament } from "../../../DB/Models/tournament.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";


 const createTournament = catchError(async (req, res, next) => {
  const {
    name,
    description,
    start_date,
    end_date,
    max_teams,
    field_ids,
    is_private,
    institution
  } = req.body;

  if (is_private && !institution) {
    return next(new AppError("Institution is required for private tournaments", 400))}

  const tournament = new Tournament({
    name,
    description,
    start_date,
    end_date,
    max_teams,
    field_ids,
    is_private,
    institution: is_private ? institution : null,
    createdBy: req.user._id
  });

  await tournament.save();
  res.status(201).json({ message: "Tournament created", tournament });
})

const registerTeamToTournament = catchError(async (req, res, next) => {
  const { id: tournamentId } = req.params;
  const { teamId } = req.body;
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return next(new AppError("Tournament not found", 404));
  if (tournament.status !== 'upcoming') return next(new AppError("Can't register to this tournament", 400));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  const isRegistered = tournament.teams.includes(teamId);
  if (isRegistered) return next(new AppError("Team already registered", 400));

  if (tournament.teams.length >= tournament.max_teams) {
    return next(new AppError("Tournament is full", 400));
  }

  tournament.teams.push(teamId);
  await tournament.save();

  res.status(200).json({ message: "Team registered successfully", tournament });
});


const getTournamentById = catchError(async (req, res, next) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate('field_ids')
    .populate('teams')
    .populate('createdBy', 'name email');

  if (!tournament) return next(new AppError("Tournament not found", 404));

  res.status(200).json({ message: "Tournament details", tournament });
})

const getAllTournaments = catchError(async (req, res, next) => {
  const tournaments = await Tournament.find()
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "All tournaments", tournaments });
});

const updateTournament = catchError(async (req, res, next) => {
  const tournament = await Tournament.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    req.body,
    { new: true }
  );

  if (!tournament) return next(new AppError("Tournament not found or unauthorized", 404));

  res.status(200).json({ message: "Tournament updated", tournament });
});

const deleteTournament = catchError(async (req, res, next) => {
  const tournament = await Tournament.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!tournament) return next(new AppError("Tournament not found or unauthorized", 404));

  res.status(200).json({ message: "Tournament deleted", tournament });
});


export{
    createTournament,
    registerTeamToTournament,
    getTournamentById,
    getAllTournaments,
    updateTournament,
    deleteTournament
}
