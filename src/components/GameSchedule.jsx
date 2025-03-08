import PlayerStats from './PlayerStats';
import './GameSchedule.css';

function GameSchedule({ schedule, currentGameIndex, onGameDone, onReset, players }) {
    return (
        <div className="game-schedule-container">
            <h2>Game Schedule</h2>

            <div className="current-game">
                <h3>Current Game</h3>
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
                            {schedule[currentGameIndex].completed ? 'Game Completed' : 'Game Done'}
                        </button>
                    </div>
                )}
            </div>

            <div className="schedule-table">
                <h3>Full Schedule</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>Team 1</th>
                            <th>Team 2</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((game, index) => (
                            <tr
                                key={index}
                                className={
                                    index === currentGameIndex
                                        ? 'current-row'
                                        : index === currentGameIndex + 1
                                            ? 'next-row'
                                            : game.completed
                                                ? 'completed-row'
                                                : ''
                                }
                            >
                                <td>{index + 1}</td>
                                <td>{game.team1[0].name} & {game.team1[1].name}</td>
                                <td>{game.team2[0].name} & {game.team2[1].name}</td>
                                <td>
                                    {game.completed
                                        ? <span className="timestamp">{game.completedAt}</span>
                                        : index === currentGameIndex
                                            ? <span className="current-status">Current</span>
                                            : index === currentGameIndex + 1
                                                ? <span className="next-status">Up Next</span>
                                                : <span className="pending-status">Pending</span>
                                    }
                                </td>
                            </tr>
                        ))}
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
