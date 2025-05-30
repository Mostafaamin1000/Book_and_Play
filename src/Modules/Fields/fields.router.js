import {Router} from 'express';
import { addField, deleteField, getAllFields, getFieldById, getNearbyFields, updateField } from './fields.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';
import { uploadSinleFile } from '../../fileUpload/fileUpload.js';

const fieldRouter = Router(); 
fieldRouter.post('/create',protectedRouter,allowTo('owner'),uploadSinleFile('image','field'),addField)
fieldRouter.get('/allfields',getAllFields)
fieldRouter.get('/near',protectedRouter,allowTo('player'),getNearbyFields)
fieldRouter.get('/search-place', protectedRouter, allowTo('owner','player'), searchPlace);
fieldRouter.get('/:id',getFieldById)
fieldRouter.put('/update/:id',protectedRouter,allowTo('owner'),uploadSinleFile('image','field'),updateField)
fieldRouter.delete('/delete/:id',protectedRouter,allowTo('owner'),deleteField)




export default fieldRouter;