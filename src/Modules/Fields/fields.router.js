import {Router} from 'express';
import { addField, deleteField, getAllFields, getFieldById, updateField } from './fields.controller.js';

const fieldRouter = Router(); 
fieldRouter.post('/create',addField)
fieldRouter.get('/allfields',getAllFields)
fieldRouter.get('/:id',getFieldById)
fieldRouter.put('/update/:id',updateField)
fieldRouter.delete('/delete/:id',deleteField)




export default fieldRouter;