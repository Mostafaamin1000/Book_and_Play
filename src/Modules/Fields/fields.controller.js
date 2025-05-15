import { Field } from "../../../DB/Models/fields.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";


const addField = catchError(async (req, res, next) => {
 if(req.file) req.body.image=req.file.filename
const field = new Field(req.body);
await field.save();
res.status(201).json({ message: "field added", field });
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
const field = await Field.findByIdAndUpdate(req.params.id, req.body, {new: true});
field || next (new AppError("field not found", 404));
!field || res.status(200).json({ message: "field updated", field });
});

const deleteField = catchError(async (req, res, next) => { 
const field = await Field.findByIdAndDelete(req.params.id);
field || next (new AppError("field not found", 404));
!field || res.status(200).json({ message: "field deleted", field });
});

export { addField, getAllFields, getFieldById, updateField, deleteField , getNearbyFields };
