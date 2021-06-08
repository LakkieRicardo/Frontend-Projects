import * as GameManager from './game-manager.js';

export let solverActive = false;

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

function FindMiddleTower(towerSizes) {
  let sortedSizes = [...towerSizes].sort((a, b) => a - b);
  let middleSizeValue = sortedSizes[1];
  for (let i = 0; i < towerSizes.length; i++) {
    if (towerSizes[i] === middleSizeValue) return i;
  }
  return -1;
}

function FindLargestTower(towerSizes) {
  if (towerSizes[0] > towerSizes[1] && towerSizes[0] > towerSizes[2]) return 0;
  if (towerSizes[1] > towerSizes[0] && towerSizes[1] > towerSizes[2]) return 1;
  if (towerSizes[2] > towerSizes[0] && towerSizes[2] > towerSizes[1]) return 2;
  return -1;
}

export async function StartSolver(targetTimer = -1) {
  /*******
  
    This implementation is non-recursive; this algorithm iterates until correct position is found while staying at 2^n-1 moves(where n is the num of disks), so long as the target tower is 3(right)

   *******/
  if (solverActive) return;
  SetSolver(true);

  // Label each tower left to right as 0, 1, 2
  let towerNames = ["#tower-1", "#tower-2", "#tower-3"];

  // Using this algorithm, the solving process must essentially be repeated if the target tower is changed to 1
  const targetTower = 2;
  const diskCount = GameManager.FindDiskCount();

  GameManager.ClearDisks();
  GameManager.InsertDisks(diskCount);

  let counter = 0;
  while (GameManager.FindDisksInTower(targetTower) < diskCount) {
    if (counter % 2 === 0) {
      // Move smallest
      let smallestTower = GameManager.FindSmallestTowerAtTop();
      let targetTower;
      if (diskCount % 2 === 0) {
        targetTower = smallestTower + 1;
        if (targetTower > 2) targetTower = 0;
      } else {
        targetTower = smallestTower - 1;
        if (targetTower < 0) targetTower = 2;
      }
      if (targetTimer === -1)
        await GameManager.AnimateDiskMovement(smallestTower, targetTower);
      else
        await GameManager.AnimateDiskMovement(smallestTower, targetTower, targetTimer / (Math.pow(2, diskCount) - 1));
    } else {
      // Move non-smallest
      // There should be only one legal move in this scenario; just move middle-sized piece to largest piece
      let towerSizes = GameManager.FindTowerSizesAtTop();
      let middleIndex = FindMiddleTower(towerSizes);
      let largestIndex = FindLargestTower(towerSizes);
      if (targetTimer === -1)
        await GameManager.AnimateDiskMovement(middleIndex, largestIndex);
      else
        await GameManager.AnimateDiskMovement(middleIndex, largestIndex, targetTimer / (Math.pow(2, diskCount) - 1));
    }
    counter++;
  }

  SetSolver(false);

};
