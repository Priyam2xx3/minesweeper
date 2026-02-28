# Browser Minesweeper 💣

A fully functional, browser-based Minesweeper game built using HTML5, CSS, and Vanilla JavaScript.

## Features

- **Customizable Grid**: Choose your own number of Rows, Columns, and Mines before starting a new game.
- **First-Click Safety**: Mines are generated *after* your first click, guaranteeing you will never hit a mine on your first move.
- **Flood Fill Mechanics**: Clicking a cell with 0 neighboring mines automatically uses a recursive algorithm to reveal all adjacent safe cells.
- **Right-Click Flagging**: Prevent entering a mine by right-clicking a cell to place a 🚩 flag.
- **Win/Loss Logic**: Hit a mine and the game reveals all other mines (Loss). Clear all non-mine cells and you win!
- **Responsive & Scrollable**: If you generate a massive grid (e.g., 50x50), the game board wrapper becomes scrollable so it fits neatly on your screen.
- **Distinct Number Styling**: Just like the classic game, numbers 1-8 are styled with distinct colors (Blue, Green, Red, Purple, etc.) for quick visual processing.

## How to Play

1. **Clone or Download**: Download all files (`index.html`, `styles.css`, `script.js`) to your computer.
2. **Open the Game**: Open `index.html` in any web browser.
3. **Set your Difficulty**: Enter the desired rows, columns, and number of mines. Click **Start New Game**.
4. **Play**: 
   - **Left Click** a cell to reveal it.
   - **Right Click** a cell to place a flag on suspected mines.
   - Use the numbers to deduce where the adjacent mines are.

## Tech Stack
- **HTML5**: For the basic inputs and structural containers.
- **CSS Grid/Flexbox**: For responsive alignment and the dynamic rendering of the game grid.
- **Vanilla JS**: For a lightweight data structure, recursion logic, and DOM manipulation without any heavy frameworks.
