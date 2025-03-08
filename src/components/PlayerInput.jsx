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
            <h2>Set Up Players</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="numPlayers">Number of Players (4-8):</label>
                    <select
                        id="numPlayers"
                        value={numPlayers}
                        onChange={handleNumPlayersChange}
                    >
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>

                <div className="player-names">
                    <h3>Player Names</h3>
                    {Array.from({ length: numPlayers }).map((_, index) => (
                        <div key={index} className="form-group">
                            <label htmlFor={`player-${index}`}>Player {index + 1}:</label>
                            <input
                                id={`player-${index}`}
                                type="text"
                                value={playerNames[index]}
                                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                placeholder={`P${index + 1}`}
                            />
                        </div>
                    ))}
                </div>

                <button type="submit" className="generate-button">Generate Schedule</button>
            </form>
        </div>
    );
}

export default PlayerInput;
