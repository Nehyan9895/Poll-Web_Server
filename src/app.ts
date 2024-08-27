import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './config/db';
import router from './route';
import { setupSocket } from './helpers/socket';


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: '*',
    methods: 'GET,PUT,POST,PATCH,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  };

  app.use(cors(corsOptions));

  connectDB();

const PORT = 5001;

const server = http.createServer(app);
setupSocket(server)


app.use('',router)



server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});