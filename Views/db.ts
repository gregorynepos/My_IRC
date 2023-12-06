import mysql from 'mysql2';

export const db = {
  host: '127.0.0.1',
  user: 'ETNA',
  password: 'ETNA', 
  database: 'myIRC',
  //connectTimeout: 10000 
};

// // Connectez-vous à la base de données
// db.connect((err) => {
//   if (err) {
//     console.error('Erreur de connexion: ' + err.stack);
//     return;
//   }
//   console.log('Connecté à la base de données.');
// });

// // Exécutez une requête SQL
// db.query('SELECT * FROM users', (err, results, fields) => {
//   if (err) {
//     console.error('Erreur de requête: ' + err.stack);
//     return;
//   }
//   console.log('Résultats de la requête: ', results);
// });

// // Fermez la connexion
// db.end();