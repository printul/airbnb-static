# Lonely Penguin

*75 kilometers to the mountains. Keep hope alive.*

A philosophical browser game where you guide a lonely penguin across the vast Antarctic ice, balancing hope and energy to reach the distant mountains.

## The Goal

Travel **75 kilometers** to reach the mountains on the horizon. But this isn't just about jumping over obstacles - it's about maintaining the penguin's spirit through encouragement and finding sustenance along the way.

## Game Mechanics

### The Gauges

| Gauge | What It Does |
|-------|--------------|
| **Distance** | Track progress toward the 75km goal. Mountains grow closer as you travel. |
| **Hope** | Naturally decays over time. Restored by sending encouraging messages and meeting friend penguins. |
| **Energy** | Decays slowly, but rapidly when hope hits zero. Restored by collecting fish. |
| **Speed** | Determined by hope and energy levels. Higher stats = faster travel. |

### The Balance

- **Hope decays naturally** - The journey is long and lonely
- **Energy decays slowly** - Walking is tiring
- **When hope hits 0** - Energy drains rapidly (despair is exhausting)
- **When energy hits 0** - The penguin needs to rest (game over)

### How to Restore

- **Collect fish** → +15 Energy
- **Send encouraging words** → +20 Hope
- **Meet friend penguins** → +10 Hope
- **Hit obstacles** → -15 Hope, -10 Energy

## Controls

| Key | Action |
|-----|--------|
| **SPACE** | Jump (double-jump enabled) |
| **ENTER** | Open chat to encourage the penguin |
| **ESC** | Close chat |
| **Click/Tap** | Jump (mobile friendly) |

## Encouraging the Penguin

Press ENTER during gameplay to send a message. The penguin responds to encouraging words!

**Words that boost hope:**
- Positive phrases: "you can do it", "keep going", "don't give up"
- Encouraging words: "amazing", "wonderful", "brave", "strong"
- Emotional support: "I believe in you", "you're not alone", "I'm with you"
- Exclamations: "Yes!", "Go!", "Woohoo!"

**Example encouraging messages:**
- "You're doing great!"
- "Keep going, the mountains are getting closer!"
- "I believe in you!"
- "You're so brave!"

## Leaderboard

- Enter your name when the journey ends
- **Top 20** journeys are displayed visually
- **All journeys** are tracked and counted
- Scores ranked by distance traveled
- Saved locally in your browser

## Win Condition

Reach 75 kilometers to complete the journey. The mountains grow visibly closer as you progress!

## Technical Details

- Pure HTML5 Canvas, CSS3, JavaScript
- No external dependencies
- Single HTML file
- localStorage for leaderboard persistence
- Mobile responsive

## The Philosophy

This game explores:
- The importance of hope in long journeys
- How encouragement from others sustains us
- The connection between mental and physical energy
- Finding meaning in reaching toward distant goals

*"The mountains wait. Hope carries you there."*

## License

MIT - Keep hope alive, share the journey.
