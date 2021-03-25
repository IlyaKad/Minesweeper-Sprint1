'use strict'

var BOMB = '💣';
var FLAG = '⛳';

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 3,
    LIVES: 3
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    document.querySelector('.flagMarks').innerText = `⛳: ${gLevel.MINES}`;
    document.querySelector('.livesShow').innerText = '❤️❤️❤️';
    document.querySelector('.timerModal').classList.add('noPointerEvents');
}

function emptyCell() {
    return { minesArounCount: 0, isShown: false, isMine: false, isMarked: false }
}

function mine() {
    return { minesArounCount: 0, isShown: false, isMine: true, isMarked: false }
}

function buildBoard() {
    var nums = randomMinesArray();
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            var selectedNum = nums.pop();
            (selectedNum < gLevel.MINES) ? board[i][j] = mine() : board[i][j] = emptyCell();
        }
    }
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesArounCount = setMinesNegsCount(board, i, j);
        }
    }
    return board;
}

function setMinesNegsCount(board, cellI, cellJ) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine === true) neighborsSum++;
        }
    }
    return neighborsSum;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            strHTML += `<td id="cell-${i}-${j}" class="cell" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})" ></td>`;
        }
    }
    var elTable = document.querySelector('.mineBoard');
    elTable.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    if (!gGame.secsPassed) {
        timer();
        document.querySelector('.levelButtons').classList.add('noPointerEvents');
    }
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isMine === true) {
        livesCheck(elCell, i, j);
    } else if (gBoard[i][j].minesArounCount === 0) {
        negsOpen(gBoard, i, j);
    } else {
        updateCell(elCell, i, j);
    }
    winCheck();
}

function negsOpen(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;
            var elCell = document.querySelector(`#cell-${i}-${j}`);
            updateCell(elCell, i, j);
            // recursive opening
            if (gBoard[i][j].minesArounCount === 0) negsOpen(board, i, j);
        }
    }
}

function updateCell(elCell, cellI, cellJ) {
    if (gBoard[cellI][cellJ].minesArounCount) elCell.innerText = gBoard[cellI][cellJ].minesArounCount;
    elCell.classList.add('openedCell');
    gGame.shownCount++;
    document.querySelector('.openedCellsShow').innerText = `⛏️: ${gGame.shownCount}`;
    gBoard[cellI][cellJ].isShown = true;
    document.querySelector(`#cell-${cellI}-${cellJ}`).classList.add('noPointerEvents');
}

function cellMarked(elCell, i, j) {
    window.oncontextmenu = (e) => {
        e.preventDefault();
    }
    if (!gGame.secsPassed) timer();

    if (elCell.innerText === FLAG) {
        elCell.innerText = '';
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
    } else {
        // if (!(gLevel.MINES - gGame.markedCount)) return;
        elCell.innerText = FLAG;
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
    }
    var marksOnBombs = gLevel.MINES - gGame.markedCount;
    document.querySelector('.flagMarks').innerText = `⛳: ${marksOnBombs}`;
    winCheck();
}

function winCheck(i, j) {
    var clearCells = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
    if (gGame.shownCount === clearCells && gGame.markedCount === gLevel.MINES) victory(i, j);
}

function victory(i, j) {
    gGame.isOn = false;
    clearInterval(gGame.secsPassed);
    document.querySelector('.mineBoard').classList.add('noPointerEvents');
    document.querySelector('.timerModal').classList.remove('noPointerEvents');
    document.querySelector('.timerTitle').innerText = 'You WON!!!\n Press to reset';
    document.querySelector('.timerModal').classList.add('animationOff');
    document.querySelector('.victoryImg').classList.remove('hide');
    openBombs(gBoard, i, j);
}

function gameOver(elCell, i, j) {
    elCell.innerText = '⚰️';
    clearInterval(gGame.secsPassed);
    document.querySelector('.timerModal').classList.add('animationOff');
    gGame.isOn = false;
    elCell.classList.add('openedCell');
    document.querySelector('.mineBoard').classList.add('noPointerEvents');
    document.querySelector('.timerModal').classList.remove('noPointerEvents');
    document.querySelector('.timerTitle').innerText = 'GAME OVER!!!\n Press to play again';
    openBombs(gBoard, i, j);
}

function livesCheck(elCell, i, j) {
    gLevel.LIVES--;
    if (gLevel.LIVES === 2) document.querySelector('.livesShow').innerText = '❤️❤️❤';
    if (gLevel.LIVES === 1) document.querySelector('.livesShow').innerText = '❤️❤❤';
    if (gLevel.LIVES === 0) {
        document.querySelector('.livesShow').innerText = '❤❤❤';
        gameOver(elCell, i, j);
    }
}

function playAgain() {
    resetGame();
    initGame();
}

function resetGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel.LIVES = 3;
    document.querySelector('.mineBoard').classList.remove('noPointerEvents');
    document.querySelector('.timerTitle').innerText = 'The game started!!!';
    document.querySelector('.timerModal').classList.remove('animationOff');
    document.querySelector('.timerModal').classList.add('noPointerEvents');
    document.querySelector('.timerModal').classList.add('hide');
    document.querySelector('.openedCellsShow').innerText = `⛏️: ${gGame.shownCount}`;
    document.querySelector('.timer').innerText = `⏱️ 0 sec`;
    document.querySelector('.levelButtons').classList.remove('noPointerEvents');
    document.querySelector('.victoryImg').classList.add('hide');
}

function openBombs(board, idxI, idxJ) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (i === idxI && j === idxJ) continue;

            var elCheckCell = document.querySelector(`#cell-${i}-${j}`);
            if (gBoard[i][j].isMine) {
                (gBoard[i][j].isMarked) ? elCheckCell.innerText = '✔️' : elCheckCell.innerText = BOMB;
                elCheckCell.classList.add('openedCell');
            } else if (gBoard[i][j].isMarked) {
                elCheckCell.innerText = '❌';
            }

        }
    }
}

function chooseLevel(level) {
    if (level === 0) gLevel = { SIZE: 4, MINES: 3, LIVES: 3 };   // 4*4=16 cells =>0.15%=>3 mines
    if (level === 1) gLevel = { SIZE: 8, MINES: 10, LIVES: 3 };  // 8*8=64 cells =>0.15%=> 9-10 mines
    if (level === 2) gLevel = { SIZE: 12, MINES: 22, LIVES: 3 }; // 12*12=144 cells =>0.15%=> 21-22 mines
    if (level === 3) gLevel = { SIZE: 12, MINES: 45, LIVES: 3 }; // 16*16=256 cells =>0.15%=> 38-39 mines
    initGame();
}

function timer() {
    var timerStart = Date.now();
    document.querySelector('.timerModal').classList.remove('hide');
    gGame.secsPassed = setInterval(function () { renderTimer(timerStart) }, 60);
}

function renderTimer(timerStart) {
    var delta = Date.now() - timerStart;
    var elModal = document.querySelector('.timerModal .timer');
    elModal.innerText = `⏱️ ${(delta / 1000).toFixed(1)} sec`;
}