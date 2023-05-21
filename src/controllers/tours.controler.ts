import { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
const dataPath = path.join(__dirname, '..', 'assets', 'data', 'tours-simple.json');
const tours = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

export const getTours: RequestHandler = (_, res) => {
  res.send({
    status: 'success',
    data: {
      results: tours.length,
      tours,
    },
  });
};

export const AddTour: RequestHandler = (req, res) => {
  const newId = Number(tours[tours.length - 1].id) + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(dataPath, JSON.stringify(tours), () => {
    res.status(201).send({
      status: 'success',
      message: 'Tour added',
      data: {
        tour: newTour,
      },
    });
  });
};

export const getTour: RequestHandler = (req, res) => {
  const { id } = req.params;
  const findTour = [...tours].find((t) => t.id.toString() === id);
  if (findTour) {
    res.status(200).send({
      status: 'success',
      message: 'Tours fetched',
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
};

export const updateTour: RequestHandler = (req, res) => {
  const localTour = [...tours];
  const { id } = req.params;
  const findTour = localTour.findIndex((t) => t.id.toString() === id);
  if (findTour > -1) {
    delete req.body.id;
    localTour[findTour] = {
      ...localTour[findTour],
      ...req.body,
    };
    fs.writeFile(dataPath, JSON.stringify(localTour), () => {
      res.status(200).send({
        status: 'success',
        message: 'Tour updated',
        data: {
          tour: localTour[findTour],
        },
      });
    });
  } else {
    res.status(404).send({
      status: 'failed',
      message: 'No tour with this id exists',
    });
  }
};

export const deleteTour: RequestHandler = (req, res) => {
  const localTour = [...tours];
  const { id } = req.params;
  const findTour = localTour.findIndex((t) => t.id.toString() === id);
  if (findTour > -1) {
    localTour.splice(findTour, 1);
    fs.writeFile(dataPath, JSON.stringify(localTour), () => {
      res.status(200).send({
        status: 'success',
        message: 'Tour deleted',
        data: {
          tour: localTour,
        },
      });
    });
  } else {
    res.status(404).send({
      status: 'failed',
      message: 'No tour with this id exists',
    });
  }
};
