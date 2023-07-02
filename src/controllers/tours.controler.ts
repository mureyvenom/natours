import { RequestHandler } from 'express';
import { catchAsync } from '../utils/AppError';
import toursModel from '../models/tours.model';

export const getTours: RequestHandler = catchAsync(async (_, res) => {
  try {
    const tours = await toursModel.find();
    res.send({
      status: 'success',
      data: {
        results: tours.length,
        tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: (error as any).message as string,
    });
  }
});

export const AddTour = catchAsync(async (req, res) => {
  try {
    const newTour = await toursModel.create(req.body);
    res.status(201).send({
      status: 'success',
      message: 'Tour added',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    // const err = new AppError((error as any).message as string, 400);
    // next(err);
    res.status(400).json({
      status: 'failed',
      message: (error as any).message as string,
    });
  }
});

export const getTour: RequestHandler = catchAsync(async (req, res) => {
  try {
    const findTour = await toursModel.findById(req.params.id);
    if (findTour) {
      res.status(200).send({
        status: 'success',
        message: 'Tour fetched',
        data: {
          tour: findTour,
        },
      });
    } else {
      res.status(404).send({
        status: 'failed',
        message: 'No tour with this id exists',
      });
    }
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: (error as any).message as string,
    });
  }
});

export const updateTour: RequestHandler = catchAsync(async (req, res) => {
  try {
    const findTour = await toursModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (findTour) {
      res.status(200).send({
        status: 'success',
        message: 'Tour updated',
        data: {
          tour: findTour,
        },
      });
    } else {
      res.status(404).send({
        status: 'failed',
        message: 'No tour with this id exists',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: (error as any).message as string,
    });
  }
});

export const deleteTour: RequestHandler = catchAsync(async (req, res) => {
  try {
    const findTour = await toursModel.findByIdAndDelete(req.params.id);
    if (findTour) {
      res.status(200).send({
        status: 'success',
        message: 'Tour deleted',
        // data: {
        //   tour: localTour,
        // },
      });
    } else {
      res.status(404).send({
        status: 'failed',
        message: 'No tour with this id exists',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: (error as any).message as string,
    });
  }
});
