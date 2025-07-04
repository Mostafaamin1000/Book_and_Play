import { Match } from "../../../DB/Models/match.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { ApiFeatures } from "../../utils/apiFeature.js";
import { AppError } from "../../utils/appError.js";

// Helper function to reset matches after a week
const resetOldMatches = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const matches = await Match.find({ date: { $lte: oneWeekAgo } });

  for (let match of matches) {
    match.current_players = [];
    match.status = 'open';
    await match.save();
  }
}


const addMatch = catchError(async (req, res, next) => {
 const { date, time, fieldId, location, max_players ,substitutes } = req.body

  // Run cleanup of old matches before adding new one
  await resetOldMatches()
  const match = await Match.create({
  date,
  time,
  fieldId,
  location,
  max_players,
  current_players: [], 
  substitutes: substitutes || [],
  createdBy: req.user._id, 
})
  res.status(201).json({ message: "Match created successfully", match });
})
const joinMatch = catchError(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new AppError("Match not found", 404));

  const userId = req.user._id;

  const alreadyJoined = match.current_players.includes(userId) || match.substitutes.includes(userId);
  if (alreadyJoined) {
    return next(new AppError("You already joined this match", 400));
  }
  const MAX_SUBSTITUTES = 4;
  if (match.current_players.length < match.max_players) {
    match.current_players.push(userId);
    if (match.current_players.length >= match.max_players) {
      match.status = 'full';
    }

    await match.save();
    return res.status(200).json({ message: "Joined match as main player", match });
  }
  if (match.substitutes.length < MAX_SUBSTITUTES) {
    match.substitutes.push(userId);
    await match.save();
    return res.status(200).json({ message: "Joined match as substitute", match });
  }
  return next(new AppError("Match is already full including substitutes", 400));
});



const unjoinMatch = catchError(async (req, res, next) => {
  const matchId = req.params.id;
  const userId = req.user._id;
  const match = await Match.findById(matchId);
  if (!match) return next(new AppError("Match not found", 404));
 const wasInMain = match.current_players.includes(userId);
  const wasInSub = match.substitutes.includes(userId);

  if (!wasInMain && !wasInSub) {
    return next(new AppError("You are not part of this match", 400));
  }

  if (wasInMain) {
    match.current_players = match.current_players.filter(
      (playerId) => playerId.toString() !== userId.toString()
    );

    if (match.status === 'full' && match.current_players.length < match.max_players) {
      match.status = 'open';
    }
  }

  if (wasInSub) {
    match.substitutes = match.substitutes.filter(
      (playerId) => playerId.toString() !== userId.toString()
    );
  }

  await match.save();

  res.status(200).json({
    message: wasInMain
      ? "You have successfully unjoined the match as main player"
      : "You have successfully unjoined the match as substitute",
    match,
  });
});


//! get all time slots of matches that are not full
const getAvailableMatches = catchError(async (req, res, next) => {
  const { date, fieldId } = req.query;
  if (!date || !fieldId) {
    return next(new AppError("Date and Field ID are required", 400))}
  const matches = await Match.find({
    fieldId,
    date: new Date(date),
    $expr: { $lt: [{ $size: "$current_players" }, "$max_players"]}
  }).populate("current_players", "name phone");
  res.status(200).json({
    message: "Available matches for selected date and field", matches  })
})


//! will use in User bookings 
const getUserMatches = catchError(async (req, res, next) => {
  const matches = await Match.find({ current_players: req.params.userId }).populate('fieldId');
  res.status(200).json({ message: 'User matches fetched', matches });
});


//! will use in recommende matches
const getMatches = catchError(async (req, res, next) => {
    let apiFeatures = new ApiFeatures(Match.find().populate(['current_players'],'-_id name email phone').populate('substitutes', 'name email phone'), req.query).pagination()
const match = await apiFeatures.mongooseQuery;
res.status(200).json({ message: "Matches found successfully",page:apiFeatures.pageNumber ,match });
});

const getMatchbyId = catchError(async (req, res, next) => {
const match = await Match.findById(req.params.id)
.populate('current_players', 'name email phone')
.populate('substitutes', 'name email phone');
match || next(new AppError("Match not found", 404));
!match || res.status(200).json({ message: "Match found successfully", match });
});

const updateMatch = catchError(async (req, res, next) => {
const match = await Match.findByIdAndUpdate(req.params.id, req.body, {new: true});
match || next(new AppError("Match not found", 404));
!match || res.status(200).json({ message: "Match updated successfully", match });
});

const deleteMatch = catchError(async (req, res, next) => {
const match = await Match.findByIdAndDelete(req.params.id);
match || next(new AppError("Match not found", 404));
!match || res.status(200).json({ message: "Match deleted successfully" });
});

export { 
  addMatch,
  getAvailableMatches,
  joinMatch ,
  unjoinMatch,
  getMatches,
  getMatchbyId,
  updateMatch,
  deleteMatch ,
  getUserMatches }
