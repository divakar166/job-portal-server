const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config();

const app = express();
connectDB();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use('/api/developers', require('./routes/devRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));

app.get('/', (req, res) => {
  res.send('Connect - Job Portal Server');
});



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});