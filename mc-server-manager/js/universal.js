function setPopupDisplayVisibility(displayValue) {
    const debugOptions = document.querySelector("#debug-options-container .debug-options");
    const debugOptionsBackground = document.querySelector("#debug-options-container .debug-options-background");
    if (displayValue) {
        debugOptions.style.display = "block";
        debugOptionsBackground.style.display = "block";
        debugOptions.style.opacity = 1;
        debugOptionsBackground.style.opacity = 0.2;
        debugOptions.style.transform = "translate(-50%, -50%)";
    } else {
        debugOptions.style.opacity = 0;
        debugOptionsBackground.style.opacity = 0;
        // Default will be centered, so -50%, -50%, this is actually offsetting
        debugOptions.style.transform = "none";
        setTimeout(() => {
            debugOptions.style.display = "none";
            debugOptionsBackground.style.display = "none";
        }, 300);
    }
}

window.addEventListener("load", () => {
    const buttonDebugOptions = document.querySelector("#btn-debug-options");
    buttonDebugOptions.addEventListener("click", (e) => {
        // Display pop-up
        setPopupDisplayVisibility(true);
    });
    const buttonDebugOptionsExit = document.querySelector("#debug-options-container .exit-button");
    const debugOptionsBackground = document.querySelector("#debug-options-container .debug-options-background");
    buttonDebugOptionsExit.addEventListener("click", (e) => {
        setPopupDisplayVisibility(false);
    });
    debugOptionsBackground.addEventListener("click", (e) => {
        setPopupDisplayVisibility(false);
    });
});