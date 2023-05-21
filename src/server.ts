import http from 'http';
import app from './app';

const PORT = process.env?.PORT ?? 6500;

const server = http.createServer(app);

const runServer = () => {
  server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  });
};

runServer();
