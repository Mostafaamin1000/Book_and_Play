import { application } from "express";
import { Match } from "../../../DB/Models/match.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { ApiFeatures } from "../../utils/apiFeature.js";
import { AppError } from "../../utils/appError.js";


const addMatch = catchError(async (req, res, next) => {
 const { date, time, fieldId, location, max_players } = req.body;

  const match = await Match.create({
    date,
    time,
    fieldId,
    location,
    max_players,
    current_players: [req.user._id]
  });

  res.status(201).json({ message: "Match created successfully", match });
})

const joinMatch = catchError(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new AppError("Match not found", 404));
  if (match.current_players.includes(req.user._id)) {
    return next(new AppError("You already joined this match", 400)); }
  if (match.current_players.length >= match.max_players) {
    match.status = "full";
    await match.save();
    return next(new AppError("Match is already full", 400))  }
  match.current_players.push(req.user._id)
  if (match.current_players.length >= match.max_players) {
    match.status = "full" }
  await match.save();
  res.status(200).json({ message: "Joined match successfully", match });
})

const unjoinMatch = catchError(async (req, res, next) => {
  const matchId = req.params.id;
  const userId = req.user._id;
  const match = await Match.findById(matchId);
  if (!match) return next(new AppError("Match not found", 404));
  if (!match.current_players.includes(userId)) {
    return next(new AppError("You are not part of this match", 400));}
  match.current_players = match.current_players.filter(
    (playerId) => playerId.toString() !== userId.toString())
  if (match.status === 'full' && match.current_players.length < match.max_players) {
    match.status = 'open'}
  await match.save();
  res.status(200).json({
    message: "You have successfully unjoined the match",
    match,
  })
})

const getAvailableMatches = catchError(async (req, res, next) => {
  const { date, fieldId } = req.query;

  if (!date || !fieldId) {
    return next(new AppError("Date and Field ID are required", 400));
  }
  const matches = await Match.find({
    fieldId,
    date: new Date(date), 
    $expr: {
      $lt: [{ $size: "$current_players" }, "$max_players"]
    }
  }).populate("current_players", "name phone");

  res.status(200).json({
    message: "Available matches for selected date and field",
    matches,
  });
});



//! will use in User bookings 
const getUserMatches = catchError(async (req, res, next) => {
  const matches = await Match.find({ current_players: req.params.userId }).populate('fieldId');
  res.status(200).json({ message: 'User matches fetched', matches });
});


//! will use in recommende matches
const getMatches = catchError(async (req, res, next) => {
    let apiFeatures = new ApiFeatures(Match.find().populate(['current_players','organizerId'],'-_id name email phone'), req.query).pagination()
const match = await apiFeatures.mongooseQuery;
res.status(200).json({ message: "Matches found successfully",page:apiFeatures.pageNumber ,match });
});

const getMatchbyId = catchError(async (req, res, next) => {
const match = await Match.findById(req.params.id);
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
