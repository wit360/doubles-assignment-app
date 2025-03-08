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

  // Track how many games each player has played
  const gamesPlayed = {};
  players.forEach(player => {
    gamesPlayed[player.id] = 0;
  });

  // Function to score a potential game based on fairness
  const scoreGame = (team1, team2) => {
    let score = 0;

    // Heavily penalize repeated partnerships
    const partnerPenalty = 10;
    score += partnerHistory[team1[0].id][team1[1].id] * partnerPenalty;
    score += partnerHistory[team2[0].id][team2[1].id] * partnerPenalty;

    // Penalize repeated opponents
    const opponentPenalty = 5;
    team1.forEach(p1 => {
      team2.forEach(p2 => {
        score += opponentHistory[p1.id][p2.id] * opponentPenalty;
      });
    });

    // Penalize uneven play distribution
    const players = [...team1, ...team2];
    const playCountPenalty = 3;
    const avgGamesPlayed = players.reduce((sum, p) => sum + gamesPlayed[p.id], 0) / players.length;

    players.forEach(p => {
      // Square the difference to penalize larger disparities more heavily
      score += Math.pow(gamesPlayed[p.id] - avgGamesPlayed, 2) * playCountPenalty;
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

    // Update games played
    [...team1, ...team2].forEach(p => {
      gamesPlayed[p.id]++;
    });
  };

  // Generate all possible team combinations
  const generateAllPossibleTeams = () => {
    const teams = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        teams.push([players[i], players[j]]);
      }
    }
    return teams;
  };

  // Generate all possible game combinations (team1 vs team2)
  const generateAllPossibleGames = (teams) => {
    const games = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Check if teams have no common players
        const team1 = teams[i];
        const team2 = teams[j];
        const team1Ids = new Set([team1[0].id, team1[1].id]);
        const team2Ids = new Set([team2[0].id, team2[1].id]);

        if (team1Ids.size + team2Ids.size === 4) { // No overlapping players
          games.push({ team1, team2 });
        }
      }
    }
    return games;
  };

  const allTeams = generateAllPossibleTeams();
  const allPossibleGames = generateAllPossibleGames(allTeams);

  // Generate 20 games
  const schedule = [];
  for (let i = 0; i < 20; i++) {
    let bestGame = null;
    let bestScore = Infinity;

    // For smaller player counts, we need to consider all players
    const eligibleGames = allPossibleGames.filter(game => {
      // For 4 players, all games are eligible
      if (players.length === 4) return true;

      // For more than 4 players, prioritize players who have played fewer games
      const gamePlayers = [...game.team1, ...game.team2];

      // If we have 5-8 players, we want to prioritize those who have played less
      if (players.length >= 5) {
        // Calculate average games played
        const avgGamesPlayed = Object.values(gamesPlayed).reduce((sum, count) => sum + count, 0) / players.length;

        // Check if any player in this game has played significantly more than average
        const maxExtraGames = 2; // Allow players to play at most 2 more games than average
        const overplayed = gamePlayers.some(p => gamesPlayed[p.id] > avgGamesPlayed + maxExtraGames);

        if (overplayed) return false;
      }

      return true;
    });

    // If we have no eligible games (rare edge case), consider all games
    const gamesToConsider = eligibleGames.length > 0 ? eligibleGames : allPossibleGames;

    // Try each possible game to find the best one
    for (const game of gamesToConsider) {
      const score = scoreGame(game.team1, game.team2);

      if (score < bestScore) {
        bestScore = score;
        bestGame = game;
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
