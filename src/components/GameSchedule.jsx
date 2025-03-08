import { useState } from 'react';
import PlayerStats from './PlayerStats';
import './GameSchedule.css';

function GameSchedule({ schedule, currentGameIndex, onGameDone, onReset, players }) {
    const [showAllGames, setShowAllGames] = useState(false);

    // Calculate which games to display
    const completedGames = schedule.filter((game, index) => index < currentGameIndex);
    const upcomingGames = schedule.filter((game, index) => index >= currentGameIndex);
    const upcomingToShow = upcomingGames.slice(0, showAllGames ? upcomingGames.length : 4);
    const gamesToDisplay = [...completedGames, ...upcomingToShow];

    return (
        <div className="game-schedule-container">
            <h3>Current Game</h3>
            <div className="current-game">
                {schedule[currentGameIndex] && (
                    <div className="game-card current">
                        <div className="team">
                            <h4>Team 1</h4>
                            <p>{schedule[currentGameIndex].team1[0].name} & {schedule[currentGameIndex].team1[1].name}</p>
                        </div>
                        <div className="vs">VS</div>
                        <div className="team">
                            <h4>Team 2</h4>
                            <p>{schedule[currentGameIndex].team2[0].name} & {schedule[currentGameIndex].team2[1].name}</p>
                        </div>
                        <button
                            className="game-done-button"
                            onClick={onGameDone}
                            disabled={currentGameIndex >= schedule.length - 1 && schedule[currentGameIndex].completed}
                        >
                            {schedule[currentGameIndex].completed ? 'Game Completed' : 'Next'}
                        </button>
                    </div>
                )}
            </div>

            <div className="schedule-table">
                {upcomingGames.length > 4 && (
                    <button
                        className="toggle-games-button"
                        onClick={() => setShowAllGames(!showAllGames)}
                    >
                        {showAllGames ? 'Show Fewer Games' : 'Show All Games'}
                    </button>
                )}
                <table>
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th colSpan="2">Team 1</th>
                            <th colSpan="2">Team 2</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gamesToDisplay.map((game, index) => {
                            const gameIndex = schedule.indexOf(game);
                            return (
                                <tr
                                    key={gameIndex}
                                    className={
                                        gameIndex === currentGameIndex
                                            ? 'current-row'
                                            : gameIndex === currentGameIndex + 1
                                                ? 'next-row'
                                                : game.completed
                                                    ? 'completed-row'
                                                    : ''
                                    }
                                >
                                    <td>{gameIndex + 1}</td>
                                    <td className="player-name">{game.team1[0].name}</td>
                                    <td className="player-name">{game.team1[1].name}</td>
                                    <td className="player-name">{game.team2[0].name}</td>
                                    <td className="player-name">{game.team2[1].name}</td>
                                    <td>
                                        {game.completed
                                            ? <span className="timestamp">{game.completedAt}</span>
                                            : gameIndex === currentGameIndex
                                                ? <span className="current-status">Current</span>
                                                : gameIndex === currentGameIndex + 1
                                                    ? <span className="next-status">Up Next</span>
                                                    : <span className="pending-status">Pending</span>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

            <PlayerStats
                players={players}
                schedule={schedule}
                currentGameIndex={currentGameIndex}
            />

            <button className="reset-button" onClick={onReset}>Reset & Start Over</button>
        </div>
    );
}

export default GameSchedule;
