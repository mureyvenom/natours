const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'assets', 'data', 'tours-simple.json');
const tours = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const { Schema, model } = mongoose;

dotenv.config();
const required = true;

mongoose.connection.once('open', () => {
  console.log('Database connection ready');
});

mongoose.connection.once('error', (err) => {
  console.log('database error:', err);
});

const MONGO_URL = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@cluster0.bnsubye.mongodb.net/natours?retryWrites=true&w=majority`;

const mongoConnect = async () => {
  console.log('mongo_url', MONGO_URL);
  await mongoose.connect(MONGO_URL, {});
};

const runServer = async () => {
  await mongoConnect();
};

const toursSchema = new Schema({
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
    // required: [required, 'A tour must have a price'],
  },
  duration: {
    type: Number,
    // required: [required, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    // required: [required, 'A tour must have a maximum group size'],
  },
  difficulty: {
    type: String,
    // required: [required, 'A tour must have a difficulty'],
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
    // required: [required, 'A tour must have a summary'],
  },
  description: {
    type: String,
    // required: [required, 'A tour must have a description'],
  },
  imageCover: {
    type: String,
    // required: [required, 'A tour must have a cover image'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const toursModel = model('Tours', toursSchema);

const importData = async () => {
  try {
    await runServer();
    toursModel.create(tours);
  } catch (error) {
    console.log('err', error);
  }
};

const deleteData = async () => {
  try {
    await runServer();
    toursModel.deleteMany();
  } catch (error) {
    console.log('err', error);
  }
};

if (process.argv[2] === '--delete') {
  deleteData().catch((e) => {
    console.log('unable to delete data', JSON.stringify(e));
  });
} else {
  importData().catch((e) => {
    console.log('unable to import data', JSON.stringify(e));
  });
}
