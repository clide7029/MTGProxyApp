import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [decklist, setDecklist] = useState('');
  const [theme, setTheme] = useState('');
  const [cards, setCards] = useState([]);
  const [notFound, setNotFound] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCards([]);
    setNotFound([]);
    try {
      const response = await axios.post('http://localhost:5001/api/deck/generate', {
        decklist,
        theme,
      });
      setCards(response.data.generated_cards);
      setNotFound(response.data.not_found);
    } catch (err) {
      setError('An error occurred while generating the deck.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleReroll = async (cardToReroll, index) => {
    try {
      const response = await axios.post('http://localhost:5001/api/card/reroll', {
        card: cardToReroll,
        theme: theme,
      });
      const newCards = [...cards];
      newCards[index] = response.data;
      setCards(newCards);
    } catch (err) {
      // Handle reroll error specifically if needed
      setError('An error occurred while rerolling the card.');
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (cards.length === 0) return;

    const dataStr = JSON.stringify(cards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'thematic-deck.json');
    linkElement.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Thematic Proxy Deck Generator</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="decklist">Decklist</label>
            <textarea
              id="decklist"
              value={decklist}
              onChange={(e) => setDecklist(e.target.value)}
              placeholder="Enter your decklist, one card per line."
              rows="10"
            />
          </div>
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <input
              type="text"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Star Wars, Lord of the Rings"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {notFound.length > 0 && (
          <div className="not-found">
            <h2>Cards Not Found</h2>
            <ul>
              {notFound.map((card, index) => (
                <li key={index}>{card.name}</li>
              ))}
            </ul>
          </div>
        )}
        {cards.length > 0 && (
          <div className="results-header">
            <h2>Generated Deck</h2>
            <button onClick={handleDownload} className="download-button">
              Download JSON
            </button>
          </div>
        )}
        <div className="card-grid">
          {cards.map((card, index) => (
            <div className="card" key={index}>
              <h3>{card.thematic_name}</h3>
              <p><em>{card.flavor_text}</em></p>
              <p><strong>Original Media:</strong> {card.original_media_reference}</p>
              <p><strong>Art Prompt:</strong> <code>{card.art_concept}</code></p>
              <div className="original-card-details">
                <h4>Original Card</h4>
                <p><strong>{card.original_card.name}</strong> {card.original_card.mana_cost}</p>
                <p>{card.original_card.type_line}</p>
                <p>{card.original_card.oracle_text}</p>
              </div>
              <button className="reroll-button" onClick={() => handleReroll(card, index)}>
                Reroll
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
