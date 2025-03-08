import { useState } from 'react';
import './App.css';
import PlayerInput from './components/PlayerInput';
import GameSchedule from './components/GameSchedule';

// Add this to App.jsx or create a separate utility file

function generateGameAssignments(players) {
  // Ensure we have at least 4 players
  if (players.length < 4) {
    throw new Error('Need at least 4 players for doubles');
  }

  // Create a history of partnerships and opponents
  const partnerHistory = {};
  const opponentHistory = {};

  players.forEach(player => {
    partnerHistory[player.id] = {};
    opponentHistory[player.id] = {};

    players.forEach(otherPlayer => {
      if (player.id !== otherPlayer.id) {
        partnerHistory[player.id][otherPlayer.id] = 0;
        opponentHistory[player.id][otherPlayer.id] = 0;
      }
    });
  });

  // Function to score a potential game based on fairness
  const scoreGame = (team1, team2) => {
    let score = 0;

    // Check partnerships
    score += partnerHistory[team1[0].id][team1[1].id];
    score += partnerHistory[team2[0].id][team2[1].id];

    // Check opponents
    team1.forEach(p1 => {
      team2.forEach(p2 => {
        score += opponentHistory[p1.id][p2.id];
      });
    });

    return score;
  };

  // Function to update history after a game
  const updateHistory = (team1, team2) => {
    // Update partnership history
    partnerHistory[team1[0].id][team1[1].id]++;
    partnerHistory[team1[1].id][team1[0].id]++;
    partnerHistory[team2[0].id][team2[1].id]++;
    partnerHistory[team2[1].id][team2[0].id]++;

    // Update opponent history
    team1.forEach(p1 => {
      team2.forEach(p2 => {
        opponentHistory[p1.id][p2.id]++;
        opponentHistory[p2.id][p1.id]++;
      });
    });
  };

  // Generate 10 games
  const schedule = [];
  for (let i = 0; i < 20; i++) {
    let bestGame = null;
    let bestScore = Infinity;

    // Try multiple random combinations to find the best one
    for (let attempt = 0; attempt < 100; attempt++) {
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      // Handle cases where we don't have exactly 4 players
      const gamePlayers = shuffledPlayers.slice(0, 4);

      // If we have fewer than 4 players, we need to reuse some
      if (players.length < 4) {
        while (gamePlayers.length < 4) {
          const randomIndex = Math.floor(Math.random() * players.length);
          gamePlayers.push({ ...players[randomIndex], id: players[randomIndex].id + 100 * gamePlayers.length });
        }
      }

      const team1 = [gamePlayers[0], gamePlayers[1]];
      const team2 = [gamePlayers[2], gamePlayers[3]];

      const score = scoreGame(team1, team2);

      if (score < bestScore) {
        bestScore = score;
        bestGame = { team1, team2 };
      }
    }

    updateHistory(bestGame.team1, bestGame.team2);
    schedule.push({
      ...bestGame,
      completed: false,
      completedAt: null
    });
  }

  return schedule;
}


function App() {
  const [players, setPlayers] = useState([]);
  const [gameSchedule, setGameSchedule] = useState([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  const generateSchedule = (playerList) => {
    setPlayers(playerList);
    const schedule = generateGameAssignments(playerList);
    setGameSchedule(schedule);
    setCurrentGameIndex(0);
  };

  const handleGameDone = () => {
    if (currentGameIndex < gameSchedule.length - 1) {
      const updatedSchedule = [...gameSchedule];
      updatedSchedule[currentGameIndex].completed = true;
      updatedSchedule[currentGameIndex].completedAt = new Date().toLocaleString();
      setGameSchedule(updatedSchedule);
      setCurrentGameIndex(currentGameIndex + 1);
    }
  };

  return (
    <div className="app-container">
      <h1>Doubles Assignment Generator</h1>

      {players.length === 0 ? (
        <PlayerInput onGenerateSchedule={generateSchedule} />
      ) : (
        <GameSchedule
          schedule={gameSchedule}
          currentGameIndex={currentGameIndex}
          onGameDone={handleGameDone}
          onReset={() => {
            setPlayers([]);
            setGameSchedule([]);
            setCurrentGameIndex(0);
          }}
          players={players}
        />
      )}
    </div>
  );
}

export default App;
