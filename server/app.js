// Add the following event handler inside the io.on('connection', (socket) => { ... }) block

  socket.on('nextQuestion', ({ quizId }) => {
    db.get('SELECT * FROM questions WHERE quiz_id = ? AND id > (SELECT MAX(id) FROM questions WHERE quiz_id = ? AND asked = 1) LIMIT 1', [quizId, quizId], (err, question) => {
      if (err) {
        console.error('Error fetching next question', err);
      } else if (question) {
        db.all('SELECT id, text FROM options WHERE question_id = ?', [question.id], (err, options) => {
          if (err) {
            console.error('Error fetching options', err);
          } else {
            io.to(quizId).emit('newQuestion', { ...question, options });
            db.run('UPDATE questions SET asked = 1 WHERE id = ?', [question.id]);
          }
        });
      } else {
        getTopPlayers().then(players => {
          io.to(quizId).emit('gameEnded', players);
        });
      }
    });
  });

  socket.on('timeUp', ({ quizId }) => {
    getTopPlayers().then(players => {
      io.to(quizId).emit('showLeaderboard', players);
    });
  });

  // Modify the joinGame event handler to include the room (quizId)
  socket.on('joinGame', (data) => {
    const { pseudonym, gameUrl } = data;
    const quizId = extractQuizIdFromUrl(gameUrl);
    
    db.run('INSERT INTO players (pseudonym, quiz_id) VALUES (?, ?)', [pseudonym, quizId], function(err) {
      if (err) {
        console.error('Error adding player to database', err);
      } else {
        console.log(`Player ${pseudonym} joined the game for quiz ${quizId}`);
        socket.join(quizId);
        getPlayers(quizId).then(players => {
          io.to(quizId).emit('updatePlayers', players);
          io.to(quizId).emit('updateTotalPlayers', players.length);
        });
      }
    });
  });

  // Add this helper function at the end of the file
  function extractQuizIdFromUrl(url) {
    const match = url.match(/\/game\/(\d+)/);
    return match ? match[1] : null;
  }

  // Modify the getPlayers function to filter by quizId
  function getPlayers(quizId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, pseudonym FROM players WHERE quiz_id = ?', [quizId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Modify the getTopPlayers function to filter by quizId
  function getTopPlayers(quizId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, pseudonym, score FROM players WHERE quiz_id = ? ORDER BY score DESC', [quizId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Modify the startQuiz event handler to use rooms
  socket.on('startQuiz', (quizId) => {
    console.log(`Starting quiz ${quizId}`);
    db.all('SELECT * FROM questions WHERE quiz_id = ?', [quizId], (err, questions) => {
      if (err) {
        console.error('Error fetching questions', err);
      } else {
        let currentQuestionIndex = 0;
        const sendQuestion = () => {
          if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            db.all('SELECT id, text FROM options WHERE question_id = ?', [question.id], (err, options) => {
              if (err) {
                console.error('Error fetching options', err);
              } else {
                io.to(quizId).emit('newQuestion', { ...question, options });
                currentQuestionIndex++;
                setTimeout(() => {
                  getTopPlayers(quizId).then(players => {
                    io.to(quizId).emit('showLeaderboard', players);
                  });
                }, 10000); // Show leaderboard after 10 seconds
              }
            });
          } else {
            getTopPlayers(quizId).then(players => {
              io.to(quizId).emit('gameEnded', players);
            });
          }
        };
        sendQuestion();
      }
    });
  });