'use strict'

var BOMB = '💣';
var FLAG = '⛳';

var gBoard;
var gLevel = {
    SIZE: 6,
    MINES: 2
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
    document.querySelector('.timerModal').classList.add('noPointerEvents');
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            var emptyCell = { minesArounCount: 0, isShown: false, isMine: false, isMarked: false };
            var mine = { minesArounCount: 0, isShown: false, isMine: true, isMarked: false };
            board[i][j] = (Math.random() > 0.15) ? emptyCell : mine;
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
        gameOver(elCell, i, j);
    } else if (gBoard[i][j].minesArounCount === 0) {
        negsOpen(gBoard, i, j);
    } else {
        updateCell(elCell, i, j);
    }
}

function negsOpen(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;
            var elCell = document.querySelector(`#cell-${i}-${j}`);
            updateCell(elCell, i, j);
        }
    }
}

function updateCell(elCell, i, j) {
    if (gBoard[i][j].minesArounCount) elCell.innerText = gBoard[i][j].minesArounCount;
    elCell.style.background = 'linear-gradient(45deg, rgb(182, 199, 198), rgb(187, 142, 202))';
    gGame.shownCount++;
    document.querySelector('.openedCellsShow').innerText = `⛏️: ${gGame.shownCount}`;
    gBoard[i][j].isShown = true;
    document.querySelector(`#cell-${i}-${j}`).classList.add('noPointerEvents');
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
}

function gameOver(elCell, i, j) {
    elCell.innerText = '⚰️';
    clearInterval(gGame.secsPassed);
    document.querySelector('.timerModal').style.animation = 'none';
    gGame.isOn = false;
    elCell.style.background = 'linear-gradient(45deg, rgb(182, 199, 198), rgb(187, 142, 202))';
    document.querySelector('.mineBoard').classList.add('noPointerEvents');
    document.querySelector('.timerModal').classList.remove('noPointerEvents');
    document.querySelector('.timerTitle').innerText = 'Press to play again';
    openBombs(gBoard, i, j);
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
    document.querySelector('.mineBoard').classList.remove('noPointerEvents');
    document.querySelector('.timerTitle').innerText = 'The game is started!!!';
    document.querySelector('.timerModal').style.animation = 'timerModal 1.5s linear infinite';
    document.querySelector('.timerModal').classList.add('noPointerEvents');
    document.querySelector('.timerModal').classList.add('hide');
    document.querySelector('.openedCellsShow').innerText = `⛏️: ${gGame.shownCount}`;
    document.querySelector('.timer').innerText = `⏱️ 0 sec`;
    document.querySelector('.levelButtons').classList.remove('noPointerEvents');
}

function openBombs(board, idxI, idxJ) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (i === idxI && j === idxJ) continue;

            var elCheckCell = document.querySelector(`#cell-${i}-${j}`);
            if (gBoard[i][j].isMine) {
                (gBoard[i][j].isMarked) ? elCheckCell.innerText = '✔️' : elCheckCell.innerText = BOMB;
                elCheckCell.style.background = 'linear-gradient(45deg, rgb(182, 199, 198), rgb(187, 142, 202))';
            } else if (gBoard[i][j].isMarked) {
                elCheckCell.innerText = '❌';
            }

        }
    }
}

function chooseLevel(level) {
    if (level === 0) gLevel.SIZE = 4;
    if (level === 1) gLevel.SIZE = 6;
    if (level === 2) gLevel.SIZE = 8;
    if (level === 3) gLevel.SIZE = 10;
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