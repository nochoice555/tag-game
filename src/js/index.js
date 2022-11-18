const gameNode = document.getElementById('game');
const containerBtn = document.getElementById('fifteen');
const itemBtn = Array.from(containerBtn.querySelectorAll('.item'));
const countItems = 16;

if (itemBtn.length !== 16) {
  throw new Error(`Need to be ${countItems} items in HTML`);
}

/* Position */
itemBtn[countItems - 1].style.display = 'none';
let matrix = getMatrix(itemBtn.map((el) => Number(el.dataset.matrixId)));

setPositionItems(matrix);

/* Button Shuffle */
// 'shuffleInProc' to check if shuffle is active
let timer;
let shuffleInProc = false;
const shuffledClassName = 'gameShuffle';
const maxShuffle = 100;
document.getElementById('shuffle').addEventListener('click', () => {
  // random swap
  // call swap some number of times
  shuffleInProc = true;
  let shuffleCount = 0;
  clearInterval(timer);
  gameNode.classList.add(shuffledClassName);

  if (shuffleCount === 0) {
    timer = setInterval(() => {
      randomSwap(matrix);
      setPositionItems(matrix);
      shuffleCount += 1;

      if (shuffleCount >= maxShuffle) {
        gameNode.classList.remove(shuffledClassName);
        clearInterval(timer);
        shuffleInProc = false;
      }
    }, 60);
  }
});

//
/* Change position on click */
const blankNumber = 16;
containerBtn.addEventListener('click', (event) => {
  if (shuffleInProc) return;
  const buttonNode = event.target.closest('button');
  if (!buttonNode) return;

  const buttonNumber = Number(buttonNode.dataset.matrixId);
  const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix);
  const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

  const isValid = isValidForSwap(buttonCoords, blankCoords);

  if (isValid) {
    swap(blankCoords, buttonCoords, matrix);
    setPositionItems(matrix);
  }
});

//
/* Change position with arrows */
window.addEventListener('keydown', (event) => {
  if (shuffleInProc) return;
  if (!event.key.includes('Arrow')) return;

  const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
  const buttonCoords = {
    x: blankCoords.x,
    y: blankCoords.y,
  };
  const direction = event.key.split('Arrow')[1].toLocaleLowerCase();
  const maxIndexMatrix = matrix.length;

  switch (direction) {
    case 'up':
      buttonCoords.y += 1;
      break;
    case 'down':
      buttonCoords.y -= 1;
      break;
    case 'left':
      buttonCoords.x += 1;
      break;
    case 'right':
      buttonCoords.x -= 1;
      break;
  }

  if (
    buttonCoords.y >= maxIndexMatrix ||
    buttonCoords.y < 0 ||
    buttonCoords.x >= maxIndexMatrix ||
    buttonCoords.x < 0
  )
    return;

  swap(blankCoords, buttonCoords, matrix);
  setPositionItems(matrix);
});

//
//
/* Helper Functions */
//
//

//
/* Field creation */
function getMatrix(arr) {
  const matrix = [[], [], [], []];
  let y = 0;
  let x = 0;
  for (let i = 0; i < arr.length; i++) {
    if (x >= 4) {
      y++;
      x = 0;
    }
    matrix[y][x] = arr[i];
    x++;
  }
  return matrix;
}

//
/* Style placement */
function setNodeStyles(node, x, y) {
  const shiftPs = 100;
  node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`;
}

function setPositionItems(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const value = matrix[y][x];
      const node = itemBtn[value - 1];
      setNodeStyles(node, x, y);
    }
  }
}

//
/* Mix the fields */
let blockedCoords = null;
function randomSwap(matrix) {
  const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
  const validCoords = findValidCoords({ blankCoords, matrix, blockedCoords });

  const swapCoords =
    validCoords[Math.floor(Math.random() * validCoords.length)];

  swap(blankCoords, swapCoords, matrix);
  blockedCoords = blankCoords;
}
// Сhecking for valid coordinates
function findValidCoords({ blankCoords, matrix, blockedCoords }) {
  const validCoords = [];

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (isValidForSwap({ x, y }, blankCoords)) {
        if (!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y))
          validCoords.push({ x, y });
      }
    }
  }
  return validCoords;
}

//
/* Looking for button coordinates by number */
function findCoordinatesByNumber(number, matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === number) return { x, y };
    }
  }
  return null;
}

//
/* Сheck whether next to the 16 button, the button that is pressed */
function isValidForSwap(coords1, coords2) {
  const diffX = Math.abs(coords1.x - coords2.x);
  const diffY = Math.abs(coords1.y - coords2.y);

  return (
    (diffX === 1 || diffY === 1) &&
    (coords1.x === coords2.x || coords1.y === coords2.y)
  );
}

//
/* Change button 16 and pressed in places */
function swap(coords1, coords2, matrix) {
  const coords1Num = matrix[coords1.y][coords1.x];
  matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
  matrix[coords2.y][coords2.x] = coords1Num;

  if (isWon(matrix)) addWonClass();
}

//
/* We determine the victory, compare the array with the correct order with the array from the matrix obtained as a result of pressing the buttons */
const winFlatArr = new Array(16).fill(0).map((_item, i) => i + 1);
function isWon(matrix) {
  const flatMatrix = matrix.flat();
  for (let i = 0; i < winFlatArr.length; i++) {
    if (flatMatrix[i] !== winFlatArr[i]) return false;
  }
  return true;
}

//
/* Show Win */
const wonClass = 'fifteenWinner';
function addWonClass() {
  setTimeout(() => {
    containerBtn.classList.add(wonClass);

    setTimeout(() => {
      containerBtn.classList.remove(wonClass);
    }, 2400);
  }, 400);
}
