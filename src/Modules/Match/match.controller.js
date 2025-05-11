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
    organizerId: req.user._id,
    current_players: [req.user._id]
  });

  res.status(201).json({ message: "Match created successfully", match });
})

const joinMatch = catchError(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new AppError("Match not found", 404));
  if (match.current_players.includes(req.user._id)) {
    return next(new AppError("You already joined this match", 400));
  }
  if (match.current_players.length >= match.max_players) {
    match.status = "full";
    await match.save();
    return next(new AppError("Match is already full", 400));
  }
  match.current_players.push(req.user._id);

  if (match.current_players.length >= match.max_players) {
    match.status = "full";
  }
  await match.save();
  res.status(200).json({ message: "Joined match successfully", match });
})



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

export { addMatch, joinMatch ,getMatches, getMatchbyId, updateMatch, deleteMatch };
