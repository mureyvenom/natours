import express from 'express';
import { AddTour, deleteTour, getTour, getTours, updateTour } from '../controllers/tours.controler';
import { authProtect, restrictTo } from '../utils/middlewares';

const router = express.Router();

const tours = express.Router();

router.get('/', authProtect, getTours);

router.post('/', AddTour);

router.get('/:id', getTour);

router.patch('/:id', updateTour);

router.delete('/:id', authProtect, restrictTo('admin', 'lead-guide'), deleteTour);

export default tours.use('/tours', router);
