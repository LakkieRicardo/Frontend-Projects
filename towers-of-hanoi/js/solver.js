import * as GameManager from './game-manager.js';

export let solverActive = false;

/**
 * Describes a movement from tower A to tower B
 */
class Move {

  /**
   * @param {Number} from Tower to move from
   * @param {Number} to Tower to move to
   */
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

}

function SetSolver(value) {
  solverActive = value;
  if (solverActive) {
    $(".solver-note").css("display", "block");
    $(".solver").addClass("solver--active");
  } else {
    $(".solver-note").css("display", "none");
    $(".solver").removeClass("solver--active");
  }
}

/**
 * Starts the solver using specified steps
 * @param {Array<Move>} steps Array of moves to complete solver
 * @param {Number} targetTimer Extra delay added to slow down solver animation. -1 for default delay
 */
async function StartSolver(steps, targetTimer) {

  let moveCount = steps.length;
  for (let i = 0; i < steps.length; i++) {
    const element = steps[i];
    await GameManager.AnimateDiskMovement(element.from, element.to, targetTimer / moveCount);
    let progressPercentage = (i / moveCount * 100).toFixed(2);
    if (progressPercentage <= 100)
      $(".solver-note").text(`Solver is active(${progressPercentage}%)...`);
    else
      $(".solver-note").text("Solver is active...");
  }
  $(".solver-note").text("Solver is active...");
}

//#region Iterative helper functions

/**
 * @param {Array<Number>} towerSizes all 3 tower sizes with tower IDs corresponding to indexes
 * @returns ID ot largest tower, if none found then -1
 */
function FindLargestTower(towerSizes) {
  if (towerSizes[0] > towerSizes[1] && towerSizes[0] > towerSizes[2]) return 0;
  if (towerSizes[1] > towerSizes[0] && towerSizes[1] > towerSizes[2]) return 1;
  if (towerSizes[2] > towerSizes[0] && towerSizes[2] > towerSizes[1]) return 2;
  return -1;
}

/**
 * @param {Array<Number>} towerSizes all 3 tower sizes with tower IDs corresponding to indexes
 * @returns ID of middle tower, if none found then -1
 */
function FindMiddleTower(towerSizes) {
  let sortedSizes = [...towerSizes].sort((a, b) => a - b);
  let middleSizeValue = sortedSizes[1];
  for (let i = 0; i < towerSizes.length; i++) {
    if (towerSizes[i] === middleSizeValue) return i;
  }
  return -1;
}

/**
 * @param {Array<Number>} towerSizes all 3 tower sizes with tower IDs corresponding to indexes
 * @returns ID of smallest tower, if none found then -1
 */
function FindSmallestTower(towerSizes) {
  if (towerSizes[0] < towerSizes[1] && towerSizes[0] < towerSizes[2]) return 0;
  if (towerSizes[1] < towerSizes[0] && towerSizes[1] < towerSizes[2]) return 1;
  if (towerSizes[2] < towerSizes[0] && towerSizes[2] < towerSizes[1]) return 2;
  return -1;
}

/**
 * @returns {Array<Array<Number>>} array representation of disks. First dimension is tower, second dimension is disk sizes
 * @example [[500], [300], [50, 120]]
 */
function GetDiskRepresentation() {
  const representation = [[], [], []];
  representation[0] = GameManager.GetDiskSizesInTower(0);
  representation[1] = GameManager.GetDiskSizesInTower(1);
  representation[2] = GameManager.GetDiskSizesInTower(2);
  return representation;
}

function GetTowerSizes(diskRepresentation) {
  let towerSizes = [];
  if (diskRepresentation[0].length > 0) {
    towerSizes.push(diskRepresentation[0][0]);
  } else {
    towerSizes.push(10000);
  }
  if (diskRepresentation[1].length > 0) {
    towerSizes.push(diskRepresentation[1][0]);
  } else {
    towerSizes.push(10001);
  }
  if (diskRepresentation[2].length > 0) {
    towerSizes.push(diskRepresentation[2][0]);
  } else {
    towerSizes.push(10002);
  }
  return towerSizes;
}

//#endregion

/**
 * Starts an iterative implementation of Towers of Hanoi
 * @param {Number} targetTimer Extra delay added to slow down solver animation. -1 for default delay
 * @returns {Promise} when the solver is complete
 */
export async function StartSolverIterative(targetTimer) {
  /*******
  
    This implementation is non-recursive; this algorithm iterates until correct position is found while staying at 2^n-1 moves(where n is the num of disks), so long as the target tower is 3(right)

   *******/
  if (solverActive) return;
  SetSolver(true);

  const diskCount = GameManager.FindDiskCount();
  GameManager.ClearDisks();
  GameManager.InsertDisks(diskCount);

  // Using this algorithm, the solving process must essentially be repeated if the target tower is changed to 1
  const targetTower = 2;

  let diskRepresentation = GetDiskRepresentation();
  let steps = [];

  let counter = 0;
  while (diskRepresentation[targetTower].length < diskCount) {
    if (counter % 2 === 0) {
      // Move smallest
      let smallestTower = FindSmallestTower(GetTowerSizes(diskRepresentation));
      let targetTower;
      if (diskCount % 2 === 0) {
        targetTower = smallestTower + 1;
        if (targetTower > 2) targetTower = 0;
      } else {
        targetTower = smallestTower - 1;
        if (targetTower < 0) targetTower = 2;
      }
      steps.push(new Move(smallestTower, targetTower));
      diskRepresentation[targetTower].splice(0, 0, diskRepresentation[smallestTower].shift());
    } else {
      // Move non-smallest
      // There should be only one legal move in this scenario; just move middle-sized piece to largest piece
      let towerSizes = GetTowerSizes(diskRepresentation);
      let middleIndex = FindMiddleTower(towerSizes);
      let largestIndex = FindLargestTower(towerSizes);
      steps.push(new Move(middleIndex, largestIndex));
      diskRepresentation[largestIndex].splice(0, 0, diskRepresentation[middleIndex].shift());
    }
    counter++;
  }
  
  // Actually execute moves
  await StartSolver(steps, targetTimer);

  SetSolver(false);

};
