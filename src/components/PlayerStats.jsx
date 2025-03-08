import React from 'react';
import './PlayerStats.css';

function PlayerStats({ players, schedule, currentGameIndex }) {
    // Calculate stats for each player
    const playerStats = players.map(player => {
        const gamesPlayed = schedule
            .filter((game, index) =>
                index < currentGameIndex &&
                (game.team1.some(p => p.id === player.id) ||
                    game.team2.some(p => p.id === player.id))
            ).length;

        const gamesRested = currentGameIndex - gamesPlayed;

        return {
            id: player.id,
            name: player.name,
            gamesPlayed,
            gamesRested
        };
    });

    return (
        <div className="player-stats-container">
            <h3>Player Statistics</h3>
            <table className="stats-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Games Played</th>
                        <th>Games Rested</th>
                    </tr>
                </thead>
                <tbody>
                    {playerStats.map(stat => (
                        <tr key={stat.id}>
                            <td>{stat.name}</td>
                            <td>{stat.gamesPlayed}</td>
                            <td>{stat.gamesRested}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlayerStats;
