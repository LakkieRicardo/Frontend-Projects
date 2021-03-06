let lastMouseX = -1;

export function GetLastMouseX() { return lastMouseX; };

/**
 * @param {Number} value 
 */
export function SetLastMouseX(value) { lastMouseX = value; };

export function GetScreenWidth() { return parseInt($("body").css("width")); };

/**
 * @param {HTMLElement} tower DOM element of the tower
 * @param {Number} mousePosX mouse position(0 = left boundary of screen, screen width = right boundary)
 * @returns {void}
 */
export function SelectPieceFromTower(tower, mousePosX = -1) {
  if ($(".selected-item").length !== 0 || !tower.classList.contains("tower")) return;
  if (mousePosX === -1) mousePosX = lastMouseX;
  let child = $(tower).children().last();
  if (child.hasClass("item")) child.addClass("selected-item").detach().appendTo("#container").css("left", `${mousePosX}px`);
};

export function ReturnSelectedPiece() {
  if ($(".selected-item").length === 0) return;
  let selectedPos = $(".selected-item").css("left");
  selectedPos = parseInt(selectedPos.substring(0, selectedPos.length - "px".length));
  let screenWidth = GetScreenWidth();
  if (selectedPos < screenWidth / 3) {
    // First third
    if ($("#tower-1 .item").length === 0 || $("#tower-1 .item").last().width() > $(".selected-item").width() / 3)
      $(".selected-item").detach().appendTo("#tower-1").removeClass("selected-item");
  } else if (selectedPos < screenWidth / 3 * 2) {
    // Second third
    if ($("#tower-2 .item").length === 0 || $("#tower-2 .item").last().width() > $(".selected-item").width() / 3)
      $(".selected-item").detach().appendTo("#tower-2").removeClass("selected-item");
  } else {
    // Final third
    if ($("#tower-3 .item").length === 0 || $("#tower-3 .item").last().width() > $(".selected-item").width() / 3)
      $(".selected-item").detach().appendTo("#tower-3").removeClass("selected-item");
  }
};

/**
 * @param {Number} mousePosX 
 * @returns {void}
 */
export function UpdateSelectedPiecePosition(mousePosX = -1) {
  if ($(".selected-item").length === 0) return;
  if (mousePosX === -1) mousePosX = lastMouseX;
  $(".selected-item").css("left", `${mousePosX}px`);
};

export function ClearDisks() {
  $(".tower .item").remove();
};

/**
 * @param {Number} count
 */
export function InsertDisks(count) {
  let minWidth = 10;
  let maxWidth = 90;
  let widthStep = (maxWidth - minWidth) / count;
  for (let i = 0; i < count; i++) {
    let width = maxWidth - widthStep * i;
    let newDisk = document.createElement("div");
    newDisk.classList.add("item");
    newDisk.style.width = width + "%";
    newDisk.style.height = (55 / count) + "%";
    document.querySelector("#tower-1").appendChild(newDisk);
  }
  document.querySelector("#disk-counter").value = count;
  document.querySelector("#disk-counter-text").value = count;
};

export function FindDiskCount() {
  return $("#tower-1").children().length + $("#tower-2").children().length + $("#tower-3").children().length - 3;
};

/**
 * 
 * @param {Number} towerFrom ID of the origin tower
 * @param {Number} towerTo ID of the target tower
 * @param {Number} delay Additional delay in milliseconds
 * @returns {Promise<void>}
 */
export function AnimateDiskMovement(towerFrom, towerTo, delay = 500) {
  if (towerFrom > 2 || towerFrom < 0 || towerTo > 2 || towerTo < 0) throw new Error("Tower number out of bounds");
  if (delay > 1) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        SetLastMouseX(GetScreenWidth() / 3 * towerFrom + 100);
        let towerFromElem = document.querySelector("#tower-" + (towerFrom + 1));
        SelectPieceFromTower(towerFromElem);
        setTimeout(() => {
          SetLastMouseX(GetScreenWidth() / 3 * towerTo + 100);
          UpdateSelectedPiecePosition();
          ReturnSelectedPiece();
          res();
        }, delay / 2);
      }, delay / 2);
    });
  } else {
    return new Promise((res, rej) => {
      SetLastMouseX(GetScreenWidth() / 3 * towerFrom + 100);
      let towerFromElem = document.querySelector("#tower-" + (towerFrom + 1));
      SelectPieceFromTower(towerFromElem);
      SetLastMouseX(GetScreenWidth() / 3 * towerTo + 100);
      UpdateSelectedPiecePosition();
      ReturnSelectedPiece();
      res();
    });
  }
};

/**
 * Finds the size of each top disk for each tower, and if the tower is empty, returns 10,000
 * @returns Array<Number> tower sizes left to right
 */
export function FindTowerSizesAtTop() {
  let tower1Width = $("#tower-1").children().length > 1 ? $("#tower-1").children().last().width() : 10000;
  let tower2Width = $("#tower-2").children().length > 1 ? $("#tower-2").children().last().width() : 10001;
  let tower3Width = $("#tower-3").children().length > 1 ? $("#tower-3").children().last().width() : 10002;
  return [tower1Width, tower2Width, tower3Width];
};

/**
 * Finds the tower with the piece that is smallest at the top
 * @returns ID of the tower
 */
export function FindSmallestTowerAtTop() {
    let towerSizes = FindTowerSizesAtTop();
    if (towerSizes[0] < towerSizes[1] && towerSizes[0] < towerSizes[2]) return 0;
    if (towerSizes[1] < towerSizes[0] && towerSizes[1] < towerSizes[2]) return 1;
    if (towerSizes[2] < towerSizes[0] && towerSizes[2] < towerSizes[1]) return 2;
    return -1;
};

/**
 * @param {Number} towerNum ID of the tower
 * @returns Number of disks in specified tower
 */
export function FindDisksInTower(towerNum) {
  if (towerNum < 0 || towerNum > 2) throw new Error("Tower number out of bounds");
  return $("#tower-" + (towerNum + 1)).children().length - 1;
};

/**
 * Gets all disk sizes in the tower
 * @param {Number} towerNum ID of the tower (0 to 2)
 * @returns {Array<Number>} disk sizes from smallest to largest
 */
export function GetDiskSizesInTower(towerNum) {
  const result = [];
  document.querySelectorAll("#tower-" + (towerNum + 1) + " .item").forEach((elem) => {
    result.push(elem.getBoundingClientRect().width);
  });
  result.sort((a, b) => a - b);
  return result;
}