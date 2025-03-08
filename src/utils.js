function generateSchedule(numPlayers) {
    // Initialize players array
    const players = Array.from({ length: numPlayers }, (_, i) => i + 1);

    // Initialize schedule and rest counts
    const schedule = [];
    const restCounts = new Array(numPlayers).fill(0);

    // Loop until all players have played enough matches
    while (schedule.length < numPlayers) {
        // Shuffle players array
        shuffleArray(players);

        // Select first four players for a match
        const team1 = [players[0], players[1]];
        const team2 = [players[2], players[3]];

        // Check if any player in this match has not rested enough
        if (hasFairRest(team1, team2, restCounts)) {
            schedule.push({ team1, team2 });

            // Update rest counts
            updateRestCounts(team1, team2, restCounts);
        }
    }

    return schedule;
}

// Helper function to shuffle an array
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Helper function to check if rest counts are fair
function hasFairRest(team1, team2, restCounts) {
    const maxRest = Math.max(...restCounts);
    const minRest = Math.min(...restCounts);
    return maxRest - minRest <= 1;
}

// Helper function to update rest counts
function updateRestCounts(team1, team2, restCounts) {
    for (const player of [...team1, ...team2]) {
        restCounts[player - 1] = 0; // Reset rest count for players in this match
    }
    for (let i = 0; i < restCounts.length; i++) {
        if (!team1.includes(i + 1) && !team2.includes(i + 1)) {
            restCounts[i]++; // Increment rest count for players not in this match
        }
    }
}

export { generateSchedule };
