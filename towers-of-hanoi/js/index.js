import * as GameManager from './game-manager.js';
import * as Solver from './solver.js';

$("body").on("mousemove", e => {
  if (Solver.solverActive) return;
  GameManager.SetLastMouseX(e.originalEvent.pageX);
  GameManager.UpdateSelectedPiecePosition(GameManager.GetLastMouseX());
}).on("click", e => {
  if (Solver.solverActive) return;
  if ($(".selected-item").length === 0) {
    if (e.target.classList.contains("item") && !e.target.classList.contains("selected-item"))
      GameManager.SelectPieceFromTower(e.target.parentElement);
    else
      GameManager.SelectPieceFromTower(e.target);
  } else {
    GameManager.ReturnSelectedPiece();
  }
});

$("#disk-counter").on("input", e => {
  if (Solver.solverActive) return;
  let diskCount = parseInt(document.querySelector("#disk-counter").value);
  GameManager.ClearDisks();
  GameManager.InsertDisks(diskCount);
});

$("#disk-counter-text").on("change", e => {
  if (Solver.solverActive) return;
  let diskCount = parseInt(document.querySelector("#disk-counter-text").value);
  GameManager.ClearDisks();
  GameManager.InsertDisks(diskCount);
});

GameManager.InsertDisks(3);

// 10000 = number of additional milliseconds to complete
// The actual solver will be much slower than this due to the delay of setTimeout and interacting with DOM
$(".solver").on("click", () => Solver.StartSolver(3000));
