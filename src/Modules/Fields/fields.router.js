import {Router} from 'express';
import { addField, deleteField, getAllFields, getFieldById, getNearbyFields, updateField } from './fields.controller.js';
import { allowTo, protectedRouter } from '../auth/auth.controller.js';

const fieldRouter = Router(); 
fieldRouter.post('/create',protectedRouter,allowTo('owner'),addField)
fieldRouter.get('/allfields',getAllFields)
fieldRouter.get('/near',protectedRouter,allowTo('player'),getNearbyFields)
fieldRouter.get('/:id',getFieldById)
fieldRouter.put('/update/:id',protectedRouter,allowTo('owner'),updateField)
fieldRouter.delete('/delete/:id',protectedRouter,allowTo('owner'),deleteField)




export default fieldRouter;