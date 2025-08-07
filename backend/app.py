import random
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SCRYFALL_API_URL = "https://api.scryfall.com/cards/collection"

def mock_llm_batch_process(scryfall_cards, theme):
    """
    Mocks a call to a Large Language Model to generate thematic card details.
    This function processes cards in a batch.
    """
    generated_proxies = []
    for card in scryfall_cards:
        # Basic logic for thematic name generation
        name = card.get('name', 'Unknown')
        type_line = card.get('type_line', '')

        # Add some randomness for rerolls
        random_adj = random.choice(["Mighty", "Wise", "Brave", "Clever", "Mysterious"])
        thematic_name = f"{name}, {theme} {random_adj} One"
        if "Legendary" in type_line and "Creature" in type_line:
            random_role = random.choice(["Leader", "Hero", "Savior", "Champion", "Vanguard"])
            thematic_name = f"Themed {name}, The {theme} {random_role}"

        # Mock flavor text
        random_quote = random.choice([
            "\"A new legend is born.\"",
            "\"The fate of many depends on this.\"",
            "\"In the heart of the theme, a new power awakens.\""
        ])
        flavor_text = f"{random_quote} - A mock flavor text for a {theme}-themed {name}."

        # Mock media reference
        media_reference = f"{theme} Universe (Artist: Mock AI)"

        # Mock Midjourney prompt
        art_style = random.choice(["digital painting", "oil painting", "concept art", "charcoal sketch"])
        mj_version = random.choice(["--v 6", "--v 7"])
        art_concept = (
            f"A {theme} version of {name}, {art_style}, "
            f"dramatic lighting --ar 3:5 {mj_version}"
        )

        proxy_card = {
            "thematic_name": thematic_name,
            "flavor_text": flavor_text,
            "original_media_reference": media_reference,
            "art_concept": art_concept,
            "original_card": {
                "name": card.get('name'),
                "mana_cost": card.get('mana_cost'),
                "type_line": card.get('type_line'),
                "oracle_text": card.get('oracle_text'),
            }
        }
        generated_proxies.append(proxy_card)

    return generated_proxies

@app.route("/api/deck/generate", methods=['POST'])
def generate_deck():
    data = request.get_json()
    decklist_str = data.get('decklist', '')
    theme = data.get('theme', 'default_theme')

    if not decklist_str:
        return jsonify({"error": "Decklist is empty"}), 400

    lines = [line.strip() for line in decklist_str.split('\n') if line.strip()]
    identifiers = [{"name": line} for line in lines]

    try:
        response = requests.post(SCRYFALL_API_URL, json={"identifiers": identifiers})
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to Scryfall API: {e}"}), 500

    scryfall_data = response.json()
    scryfall_cards = scryfall_data.get('data', [])
    not_found = scryfall_data.get('not_found', [])

    # Replace the simple transform with the mock LLM call
    generated_cards = mock_llm_batch_process(scryfall_cards, theme)

    return jsonify({
        "generated_cards": generated_cards,
        "not_found": not_found
    })

@app.route("/api/card/reroll", methods=['POST'])
def reroll_card():
    data = request.get_json()
    card_to_reroll = data.get('card')
    theme = data.get('theme')

    if not card_to_reroll or not theme:
        return jsonify({"error": "Missing card data or theme"}), 400

    # The mock LLM function expects a list of cards
    # We also need the original card data, which is nested.
    new_card_list = mock_llm_batch_process([card_to_reroll['original_card']], theme)

    if not new_card_list:
        return jsonify({"error": "Failed to generate new card"}), 500

    return jsonify(new_card_list[0])

if __name__ == '__main__':
    app.run(debug=True, port=5001)
