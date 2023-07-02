import { Schema, model } from 'mongoose';

const required = true;

export const toursSchema = new Schema({
  name: {
    type: String,
    required: [required, 'A tour must have a name'],
    trim: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [required, 'A tour must have a price'],
  },
  duration: {
    type: Number,
    required: [required, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [required, 'A tour must have a maximum group size'],
  },
  difficulty: {
    type: String,
    required: [required, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  images: {
    type: [String],
  },
  startDates: {
    type: [Date],
  },
  summary: {
    type: String,
    trim: true,
    required: [required, 'A tour must have a summary'],
  },
  description: {
    type: String,
    required: [required, 'A tour must have a description'],
  },
  imageCover: {
    type: String,
    required: [required, 'A tour must have a cover image'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default model('Tours', toursSchema);
