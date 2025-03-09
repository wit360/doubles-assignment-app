import { useState } from 'react';
import './PlayerInput.css';

function PlayerInput({ onGenerateSchedule }) {
    const [numPlayers, setNumPlayers] = useState(4);
    const [playerNames, setPlayerNames] = useState(Array(8).fill(''));

    const handleNumPlayersChange = (e) => {
        const num = parseInt(e.target.value, 10);
        setNumPlayers(num);
    };

    const handlePlayerNameChange = (index, value) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const activePlayers = playerNames.slice(0, numPlayers).map((name, index) => ({
            id: index + 1,
            name: name || `${index + 1}`
        }));
        onGenerateSchedule(activePlayers);
    };

    return (
        <div className="player-input-container">
            <h3>Number of Players</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group player-count">
                    <select
                        id="numPlayers"
                        value={numPlayers}
                        onChange={handleNumPlayersChange}
                        className="player-select"
                    >
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>

                <div className="player-names">
                    <h4>Names</h4>
                    {/* Changed to vertical layout - one player per line */}
                    <div className="player-list">
                        {Array.from({ length: numPlayers }).map((_, index) => (
                            <div key={index} className="form-group player-row">
                                <input
                                    id={`player-${index}`}
                                    type="text"
                                    value={playerNames[index]}
                                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                    placeholder={`${index + 1}`}
                                    className="player-input"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="generate-button">Generate Schedule</button>
            </form>
        </div>
    );
}

export default PlayerInput;
