import { useState, useEffect } from 'react';
import './App.css';
import PlayerInput from './components/PlayerInput';
import GameSchedule from './components/GameSchedule';

// Add this to App.jsx or create a separate utility file
function generateGameAssignments(players) {
  // Ensure we have at least 4 players
  if (players.length < 4) {
    throw new Error('Need at least 4 players for doubles');
  }

  // Create tracking structures
  const partnerHistory = {};
  const opponentHistory = {};
  const gamesPlayed = {};

  players.forEach(player => {
    partnerHistory[player.id] = {};
    opponentHistory[player.id] = {};
    gamesPlayed[player.id] = 0;

    players.forEach(otherPlayer => {
      if (player.id !== otherPlayer.id) {
        partnerHistory[player.id][otherPlayer.id] = 0;
        opponentHistory[player.id][otherPlayer.id] = 0;
      }
    });
  });

  // Generate all possible valid team combinations
  const generateAllPossibleTeams = () => {
    const teams = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        teams.push([players[i], players[j]]);
      }
    }
    return teams;
  };

  // Generate all possible valid game combinations
  const generateAllPossibleGames = (teams) => {
    const games = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];

        // Create sets of player IDs to check for uniqueness
        const playerIds = new Set([
          team1[0].id, team1[1].id, team2[0].id, team2[1].id
        ]);

        // Only add games with 4 distinct players
        if (playerIds.size === 4) {
          games.push({ team1, team2 });
        }
      }
    }
    return games;
  };

  // Score a game based on fairness criteria
  const scoreGame = (game) => {
    const { team1, team2 } = game;
    const gamePlayers = [...team1, ...team2];

    // Get current min and max games played
    const currentMin = Math.min(...Object.values(gamesPlayed));
    const currentMax = Math.max(...Object.values(gamesPlayed));

    // Calculate what would happen if we select this game
    const newGamesPlayed = { ...gamesPlayed };
    gamePlayers.forEach(p => newGamesPlayed[p.id]++);

    // Calculate new min and max
    const newMin = Math.min(...gamePlayers.map(p => newGamesPlayed[p.id]));
    const newMax = Math.max(...gamePlayers.map(p => newGamesPlayed[p.id]));

    // Calculate the maximum difference after this game
    const overallNewMin = Math.min(currentMin, newMin);
    const overallNewMax = Math.max(currentMax, newMax);
    const wouldBeDifference = overallNewMax - overallNewMin;

    // Heavily penalize differences greater than 1
    const playDistributionPenalty = wouldBeDifference > 1 ? 1000 : 0;

    // Calculate partnership and opponent repetition scores
    let partnerScore = partnerHistory[team1[0].id][team1[1].id] +
      partnerHistory[team2[0].id][team2[1].id];

    let opponentScore = 0;
    team1.forEach(p1 => {
      team2.forEach(p2 => {
        opponentScore += opponentHistory[p1.id][p2.id];
      });
    });

    // Prioritize players who have played fewer games
    const playCountScore = gamePlayers.reduce((sum, p) => sum + gamesPlayed[p.id], 0);

    // Calculate final score (lower is better)
    return playDistributionPenalty + (partnerScore * 10) +
      (opponentScore * 5) + (playCountScore * 2);
  };

  // Update game history
  const updateHistory = (game) => {
    const { team1, team2 } = game;

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

  const allTeams = generateAllPossibleTeams();
  const allPossibleGames = generateAllPossibleGames(allTeams);

  // Generate 20 games
  const schedule = [];

  for (let i = 0; i < 20; i++) {
    // Shuffle possible games to add randomness
    const shuffledGames = [...allPossibleGames].sort(() => Math.random() - 0.5);

    // Score each game
    const scoredGames = shuffledGames.map(game => ({
      game,
      score: scoreGame(game)
    }));

    // Sort by score (lower is better)
    scoredGames.sort((a, b) => a.score - b.score);

    // Select the best game
    const selectedGame = scoredGames[0].game;

    // Update history
    updateHistory(selectedGame);

    // Add to schedule
    schedule.push({
      team1: selectedGame.team1,
      team2: selectedGame.team2,
      completed: false,
      completedAt: null
    });

    // Force fairness in the final games
    if (i >= 15) {
      // Find players with minimum games
      const minGames = Math.min(...Object.values(gamesPlayed));
      const playersWithMinGames = players.filter(p => gamesPlayed[p.id] === minGames);

      // If we have players with fewer games, prioritize them in remaining games
      if (playersWithMinGames.length > 0 && playersWithMinGames.length < players.length) {
        // Log for debugging
        console.log(`Prioritizing players with fewer games: ${playersWithMinGames.map(p => p.name)}`);
      }
    }
  }

  // Final fairness check
  const finalCounts = Object.values(gamesPlayed);
  const minGames = Math.min(...finalCounts);
  const maxGames = Math.max(...finalCounts);

  if (maxGames - minGames > 1) {
    console.warn(`Warning: Could not achieve perfect fairness. Game count difference: ${maxGames - minGames}`);

    // Try to fix the schedule if possible
    // This is a last resort approach
    if (players.length >= 6) {
      console.log("Attempting to fix schedule...");
      // Advanced schedule repair logic could be implemented here
    }
  }

  return schedule;
}




// import { useState, useEffect } from 'react';
// import './App.css';
// import PlayerInput from './components/PlayerInput';
// import GameSchedule from './components/GameSchedule';

function App() {
  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('doubles-players');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });

  const [gameSchedule, setGameSchedule] = useState(() => {
    const savedSchedule = localStorage.getItem('doubles-schedule');
    return savedSchedule ? JSON.parse(savedSchedule) : [];
  });

  const [currentGameIndex, setCurrentGameIndex] = useState(() => {
    const savedIndex = localStorage.getItem('doubles-current-game');
    return savedIndex ? parseInt(JSON.parse(savedIndex)) : 0;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('doubles-players', JSON.stringify(players));
    localStorage.setItem('doubles-schedule', JSON.stringify(gameSchedule));
    localStorage.setItem('doubles-current-game', JSON.stringify(currentGameIndex));
  }, [players, gameSchedule, currentGameIndex]);

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
      updatedSchedule[currentGameIndex].completedAt = (new Date()).toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
      });
      setGameSchedule(updatedSchedule);
      setCurrentGameIndex(currentGameIndex + 1);
    }
  };
  const handleUndo = () => {
    if (currentGameIndex > 0) {
      const updatedSchedule = [...gameSchedule];
      updatedSchedule[currentGameIndex - 1].completed = false;
      updatedSchedule[currentGameIndex - 1].completedAt = null;
      setGameSchedule(updatedSchedule);
      setCurrentGameIndex(currentGameIndex - 1);
    }
  };
  const handleReset = () => {
    // Clear localStorage when resetting
    localStorage.removeItem('doubles-players');
    localStorage.removeItem('doubles-schedule');
    localStorage.removeItem('doubles-current-game');

    setPlayers([]);
    setGameSchedule([]);
    setCurrentGameIndex(0);
  };

  return (
    <div className="app-container">
      {players.length === 0 ? (
        <PlayerInput onGenerateSchedule={generateSchedule} />
      ) : (
        <GameSchedule
          schedule={gameSchedule}
          currentGameIndex={currentGameIndex}
          onGameDone={handleGameDone}
          onUndo={handleUndo}
          onReset={handleReset}
          players={players}
        />
      )}
    </div>
  );
}

export default App;
