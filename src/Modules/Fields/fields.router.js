import { Router } from 'express';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';
import { addField, deleteField, getAllFields, getFieldById, getFieldsByOwner, getNearbyFields, searchPlace, updateField } from './fields.controller.js';
import { uploadSingleFileCloud } from '../../middlewares/uploadCloud.js';

const fieldRouter = Router(); 
fieldRouter.post('/create',protectedRouter,allowTo('owner'),uploadSingleFileCloud('image'),addField)
fieldRouter.get('/allfields',getAllFields)
fieldRouter.get('/near',protectedRouter,allowTo('player'),getNearbyFields)
fieldRouter.get('/search-place', protectedRouter, allowTo('owner','player'), searchPlace);
fieldRouter.get('/my-fields', protectedRouter, allowTo('owner'), getFieldsByOwner);
fieldRouter.get('/:id',getFieldById)
fieldRouter.put('/update/:id',protectedRouter,allowTo('owner'),uploadSingleFileCloud('image'),updateField)
fieldRouter.delete('/delete/:id',protectedRouter,allowTo('owner'),deleteField)




export default fieldRouter;