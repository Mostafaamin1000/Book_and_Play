import { Match } from "../../../DB/Models/match.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";


const addMatch = catchError(async (req, res, next) => {
const match = await Match.insertMany(req.body);
res.status(201).json({ message: "Match added successfully", match });
});

const getMatches = catchError(async (req, res, next) => {
const match = await Match.find();
res.status(200).json({ message: "Matches found successfully", match });
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

export { addMatch, getMatches, getMatchbyId, updateMatch, deleteMatch };
