import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import { createConnection, RowDataPacket } from 'mysql2';
import { db } from './db'

import expressSession, { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string };
  }
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const session = expressSession({
  secret: '84a57348a66b6a367143724b98145e0bf47d542f1c3e98953c93690cabf3bf1f',
  resave: false,
  saveUninitialized: true,
  cookie: {},
});

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(jsonParser);
app.use(urlencodedParser);
app.use(session);

// const dbConfig = {
//   host: 'localhost',
//   user: 'sadio',
//   password: 'root',
//   database: 'MyIRC1',
// };

// Page d'accueil
app.get('/', (request, response) => {
  if (request.session.user) {
    response.send('Hello ' + request.session.user.username + '!')
  } else {
    response.sendFile(__dirname + '/views/error.html');
  }
});

// Page d'accueil
app.get('/accueil.html', (request, response) => {
  response.sendFile(__dirname + '/views/accueil.html');
});

// Page de chat
app.get('/chat.html', (request, response) => {
  if (request.session.user) {
    response.sendFile(__dirname + "/views/chat.html")
  } else {
    response.redirect('/accueil.html')
  }
});

// Page de canal
app.get('/canal.html', (request, response) => {
  response.sendFile(__dirname + '/views/canal.html');
});

// Page de connexion
app.get('/login.html', (request, response) => {
  response.sendFile(__dirname + '/views/login.html');
});

app.post('/login.html', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  if (username && password) {
    try {
      const connection = createConnection(db);

      const query = "SELECT * FROM users WHERE username = ?";
      connection.query(query, [username], (error, rows) => {
        if (error) {
          console.error('Database error:', error);
          response.sendFile(__dirname + '/error/errorconnection.html');
        } else {
          if (Array.isArray(rows) && rows.length > 0) {
            const data = rows[0] as RowDataPacket;
            request.session.user = {
              id: data.id,
              username: username,
            };
            console.log('User found:', rows);
            response.redirect('/accueil.html');
          } else {
            console.log('User not found');
            response.sendFile(__dirname + '/error/error.html');
          }
        }

        connection.end();
      });
    } catch (error) {
      console.error('Error connecting to the database:', error);
      response.sendFile(__dirname + '/error/errorconnection.html');
    }
  } else {
    console.log('Username or password missing');
    response.send('Username or password missing');
  }
});

// Page d'inscription
app.get('/signup.html', (request, response) => {
  response.sendFile(__dirname + '/views/signup.html');
});

app.post('/signup.html', (request, response) => {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;

  if (username && email && password) {
    try {
      const connection = createConnection(db);

      const checkUserQuery = "SELECT * FROM users WHERE username = ?";
      connection.query(checkUserQuery, [username], (error, rows) => {
        if (error) {
          console.error(error);
          response.sendFile(__dirname + '/error/errorinscription.html');
        } else {
          if (Array.isArray(rows) && rows.length > 0) {
            response.send('Cet utilisateur existe déjà. <a href="login.html">Se connecter</a>');
          } else {
            const insertUserQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            connection.query(insertUserQuery, [username, email, password], (error) => {
              if (error) {
                console.error(error);
                response.sendFile(__dirname + '/error/errorinscription.html');
              } else {
                response.send('Inscription réussie. <a href="login.html">Se connecter</a>');
                
              }
            });
          }
        }

        connection.end();
      });
    } catch (error) {
      console.error('Error connecting to the database:', error);
      response.sendFile(__dirname + '/error/errorconnection.html');
    }
  } else {
    response.send('Nom d\'utilisateur, email ou mot de passe manquant.');
  }
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

httpServer.listen(8000, () => console.log('Hello World'));
