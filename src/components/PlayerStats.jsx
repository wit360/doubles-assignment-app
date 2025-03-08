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

        return {
            id: player.id,
            name: player.name,
            gamesPlayed
        };
    });

    // Create a 2D matrix to track partnerships
    const createPairingMatrix = () => {
        const matrix = {};

        // Initialize the matrix with zeros
        players.forEach(p1 => {
            matrix[p1.id] = {};
            players.forEach(p2 => {
                matrix[p1.id][p2.id] = 0;
            });
        });

        // Fill the matrix with partnership counts
        schedule.slice(0, currentGameIndex).forEach(game => {
            // Count partnerships in team 1
            if (game.team1 && game.team1.length === 2) {
                const id1 = game.team1[0].id;
                const id2 = game.team1[1].id;
                matrix[id1][id2]++;
                matrix[id2][id1]++;
            }

            // Count partnerships in team 2
            if (game.team2 && game.team2.length === 2) {
                const id1 = game.team2[0].id;
                const id2 = game.team2[1].id;
                matrix[id1][id2]++;
                matrix[id2][id1]++;
            }
        });

        return matrix;
    };

    const pairingMatrix = createPairingMatrix();

    return (
        <div className="player-stats-container">

            {/* Transposed Play Count Table */}
            <div className="play-count-table">
                <table className="stats-table transposed">
                    <thead>
                        <tr>
                            <th>Player</th>
                            {playerStats.map(stat => (
                                <th key={stat.id}>{stat.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Games Played</th>
                            {playerStats.map(stat => (
                                <td key={stat.id}>{stat.gamesPlayed}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="pairing-matrix-container">
                <table className="pairing-matrix">
                    <thead>
                        <tr>
                            <th></th>
                            {players.map(player => (
                                <th key={player.id}>{player.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(p1 => (
                            <tr key={p1.id}>
                                <th>{p1.name}</th>
                                {players.map(p2 => (
                                    <td
                                        key={p2.id}
                                        className={p1.id === p2.id ? 'diagonal-cell' : pairingMatrix[p1.id][p2.id] > 0 ? 'paired-cell' : ''}
                                    >
                                        {p1.id === p2.id ? '-' : pairingMatrix[p1.id][p2.id]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PlayerStats;
