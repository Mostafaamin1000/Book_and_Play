  import { Field } from "../../../DB/Models/fields.schema.js";
  import { catchError } from "../../middlewares/catchError.js";
  import { AppError } from "../../utils/appError.js";
  import axios from "axios";
  import dotenv from "dotenv";
  dotenv.config();

  
// Places Search Handler
const searchPlace = catchError(async (req, res, next) => {
  const { query } = req.query;
  if (!query) return next(new AppError("Query is required", 400));

  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/place/textsearch/json",
    {
      params: {
        query,
        key: process.env.GOOGLE_API_KEY,
      },
    }
  );

  const places = response.data.results.map((place) => ({
    name: place.name,
    address: place.formatted_address,
    location: place.geometry.location,
    place_id: place.place_id,
  }));

  res.status(200).json({ message: "Places found", places });
});

  const addField = catchError(async (req, res, next) => {
  if(req.file) req.body.image=req.file.filename
    req.body.is_paid = req.body.is_paid === 'true' || req.body.is_paid === true;
    if (!req.body.is_paid) {
      req.body.price_per_hour = 0 }
      else { if (!req.body.price_per_hour) {
        return next(new AppError('Price per hour is required for paid fields.', 400))}
            }
      req.body.owner = req.user._id;
  const field = new Field(req.body);
  await field.save();
  res.status(201).json({ message: "field added", field });
  }); 

const getFieldsByOwner = catchError(async (req, res, next) => {
  const ownerId = req.user._id; 
  const fields = await Field.find({ owner: ownerId });
  res.status(200).json({
    message: "Fields by this owner",
    fields
  });
});


  const getAllFields = catchError(async (req, res, next) => {
  const fields = await Field.find();
  res.status(200).json({ message: "fields", fields });
  });


  const getNearbyFields = catchError(async (req, res, next) => {
    const user = req.user;
    if (!user?.location?.coordinates || user.location.coordinates.length !== 2) {
        return next(new AppError('User location not available' , 400))}
    const preferredDistance = user.preferred_distance || 1000
    const fields = await Field.find({
      location: { $near: { $geometry: {type: "Point", coordinates: user.location.coordinates},
          $maxDistance: preferredDistance}}})
    res.status(200).json({ message: "Nearby fields", fields })
  })


  const getFieldById = catchError(async (req, res, next) => {
  const field = await Field.findById(req.params.id);
  field || next (new AppError("field not found", 404));
  !field || res.status(200).json({ message: "field : ", field });
  });

  const updateField = catchError(async (req, res, next) => {
  if(req.file) req.body.image=req.file.filename
  const field = await Field.findByIdAndUpdate(req.params.id, req.body, {new: true});
  field || next (new AppError("field not found", 404));
  !field || res.status(200).json({ message: "field updated", field });
  });

  const deleteField = catchError(async (req, res, next) => { 
  const field = await Field.findByIdAndDelete(req.params.id);
  field || next (new AppError("field not found", 404));
  !field || res.status(200).json({ message: "field deleted", field });
  });

  export { addField, getAllFields, getFieldById, updateField, deleteField , getNearbyFields ,searchPlace , getFieldsByOwner};
