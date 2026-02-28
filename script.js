// UI Elements
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const minesInput = document.getElementById('mines');
const startBtn = document.getElementById('start-btn');
const gameBoardEl = document.getElementById('game-board');
const gameStatusEl = document.getElementById('game-status');
const minesLeftEl = document.getElementById('mines-left');

// Game State
let grid = [];
let numRows = 0;
let numCols = 0;
let numMines = 0;
let flaggedMines = 0;
let cellsRevealed = 0;
let isFirstClick = true;
let isGameOver = false;

// Initialize event listener for the start button
startBtn.addEventListener('click', startNewGame);

/**
 * Parses inputs and kicks off a new game session.
 */
function startNewGame() {
    numRows = parseInt(rowsInput.value);
    numCols = parseInt(colsInput.value);
    numMines = parseInt(minesInput.value);

    // Basic Validation
    if (isNaN(numRows) || numRows < 5) numRows = 5;
    if (isNaN(numCols) || numCols < 5) numCols = 5;

    // Ensure we don't have more mines than cells (leave at least 1 safe cell)
    const maxMines = (numRows * numCols) - 1;
    if (isNaN(numMines) || numMines < 1) numMines = 1;
    if (numMines > maxMines) numMines = maxMines;

    // Update Inputs to show clamped values
    rowsInput.value = numRows;
    colsInput.value = numCols;
    minesInput.value = numMines;

    // Reset Tracking variables
    isFirstClick = true;
    isGameOver = false;
    cellsRevealed = 0;
    flaggedMines = 0;
    grid = [];

    // Update UI Status
    gameStatusEl.textContent = "Game Status: Playing";
    gameStatusEl.className = "";
    updateMinesLeftDisplay();

    // Create Logic Grid and UI Grid
    createGrid();
}

/**
 * 2D Data Structure: Initializes logic state, builds DOM elements
 */
function createGrid() {
    gameBoardEl.innerHTML = '';

    // CSS Grid Configuration ensures consistent layout based on custom size
    gameBoardEl.style.gridTemplateColumns = `repeat(${numCols}, 30px)`;
    gameBoardEl.style.gridTemplateRows = `repeat(${numRows}, 30px)`;

    for (let r = 0; r < numRows; r++) {
        let rowArray = [];
        for (let c = 0; c < numCols; c++) {
            // Data Structure for a Cell
            const cellData = {
                r: r,
                c: c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborCount: 0,
                element: document.createElement('div')
            };

            // Setup DOM Element
            cellData.element.classList.add('cell');
            cellData.element.dataset.row = r;
            cellData.element.dataset.col = c;

            // Event Listeners on DOM Element
            cellData.element.addEventListener('click', () => handleCellClick(r, c));
            cellData.element.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Prevent standard browser right-click menu
                handleCellRightClick(r, c);
            });

            gameBoardEl.appendChild(cellData.element);
            rowArray.push(cellData);
        }
        grid.push(rowArray);
    }
}

/**
 * Handles Left Clicks: Reveal mechanics
 */
function handleCellClick(r, c) {
    if (isGameOver) return;

    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return; // Prevent clicking revealed or flagged cells

    // First Click Guarantee: Ensure the first cell clicked is never a mine
    if (isFirstClick) {
        placeMines(r, c);
        calculateNeighbors();
        isFirstClick = false;
    }

    // Win/Loss Checks
    if (cell.isMine) {
        gameOverLoss();
    } else {
        revealCell(r, c);
        checkWinCondition();
    }
}

/**
 * Handles Right Clicks: Flag mechanics
 */
function handleCellRightClick(r, c) {
    if (isGameOver || isFirstClick) return; // Disallow flags before game actually generates

    const cell = grid[r][c];
    if (cell.isRevealed) return; // Can't flag an open cell

    cell.isFlagged = !cell.isFlagged;

    if (cell.isFlagged) {
        cell.element.classList.add('flagged');
        flaggedMines++;
    } else {
        cell.element.classList.remove('flagged');
        flaggedMines--;
    }
    updateMinesLeftDisplay();
}

/**
 * Helper to update remaining flags display
 */
function updateMinesLeftDisplay() {
    minesLeftEl.textContent = `Mines: ${numMines - flaggedMines}`;
}

/**
 * Randomize mine placement, strictly avoiding the cell at (firstR, firstC)
 */
function placeMines(firstR, firstC) {
    let minesPlaced = 0;

    while (minesPlaced < numMines) {
        const randR = Math.floor(Math.random() * numRows);
        const randC = Math.floor(Math.random() * numCols);

        // Avoid the first clicked cell
        if (randR === firstR && randC === firstC) continue;

        // Avoid cells that already have a mine
        if (!grid[randR][randC].isMine) {
            grid[randR][randC].isMine = true;
            minesPlaced++;
        }
    }
}

/**
 * Calculates the count of surrounding mines for all non-mine cells.
 */
function calculateNeighbors() {
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (grid[r][c].isMine) continue;

            let minesCount = 0;
            // Check all 8 neighboring directions
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;

                    if (isValidCell(nr, nc) && grid[nr][nc].isMine) {
                        minesCount++;
                    }
                }
            }
            grid[r][c].neighborCount = minesCount;
        }
    }
}

/**
 * Reveals a cell and conditionally triggers the Flood Fill mechanic
 */
function revealCell(r, c) {
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    // Core Reveal
    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    cellsRevealed++;

    // If the cell borders mines, display the number and stop recursion
    if (cell.neighborCount > 0) {
        cell.element.innerText = cell.neighborCount;
        cell.element.dataset.neighbors = cell.neighborCount; // hook for CSS coloring
        return;
    }

    // Flood Fill Mechanic
    // If we reach here, neighborCount === 0. Recursively reveal all 8 surrounding cells.
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue; // Skip self

            const nr = r + dr;
            const nc = c + dc;

            if (isValidCell(nr, nc)) {
                // Ensure recursive call only happens on unrevealed/unflagged
                if (!grid[nr][nc].isRevealed && !grid[nr][nc].isFlagged && !grid[nr][nc].isMine) {
                    revealCell(nr, nc);
                }
            }
        }
    }
}

/**
 * Player clicked a mine -> Loss
 * Reveals all mines and ends interactions.
 */
function gameOverLoss() {
    isGameOver = true;
    gameStatusEl.textContent = "Game Over! You hit a mine.";
    gameStatusEl.className = "status-lose";

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const cell = grid[r][c];
            if (cell.isMine) {
                cell.element.classList.add('mine');
                cell.element.classList.add('revealed');
            }
            // Optional: Show misplaced flags with a different style (skipped here for brevity)
        }
    }
}

/**
 * Checks if the number of revealed non-mine cells equals total safe cells
 */
function checkWinCondition() {
    const totalSafeCells = (numRows * numCols) - numMines;
    if (cellsRevealed === totalSafeCells) {
        isGameOver = true;
        gameStatusEl.textContent = "Victory! You cleared all safe areas.";
        gameStatusEl.className = "status-win";

        // Auto-flag remaining un-flagged mines
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const cell = grid[r][c];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isFlagged = true;
                    cell.element.classList.add('flagged');
                }
            }
        }
        flaggedMines = numMines;
        updateMinesLeftDisplay();
    }
}

/**
 * Utility to check boundaries
 */
function isValidCell(r, c) {
    return r >= 0 && r < numRows && c >= 0 && c < numCols;
}

// Kick off immediately with defaults when script loads
startNewGame();
