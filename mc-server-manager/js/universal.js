function setPopupDisplay(displayValue) {
    const debugOptions = document.querySelector("#debug-options-container .debug-options");
    const debugOptionsBackground = document.querySelector("#debug-options-container .debug-options-background");
    debugOptions.style.display = displayValue;
    debugOptionsBackground.style.display = displayValue;
}

window.addEventListener("load", () => {
    const buttonDebugOptions = document.querySelector("#btn-debug-options");
    buttonDebugOptions.addEventListener("click", (e) => {
        // Display pop-up
        setPopupDisplay("block");
    });
    const buttonDebugOptionsExit = document.querySelector("#debug-options-container .exit-button");
    buttonDebugOptionsExit.addEventListener("click", (e) => {
        setPopupDisplay("none");
    });
});