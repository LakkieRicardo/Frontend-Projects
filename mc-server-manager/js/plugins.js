window.addEventListener("load", () => {
    const pluginToggles = document.querySelectorAll(".plugin-toggle");
    pluginToggles.forEach((elem) => {
        // Retrieve content for this toggle
        const pluginContent = elem.parentElement.querySelector(".plugin-content");
        elem.parentElement.addEventListener("click", () => {
            if (elem.classList.contains("plugin-toggle-active")) {
                pluginContent.style.display = "none";
                elem.classList.remove("plugin-toggle-active");
            } else {
                pluginContent.style.display = "block";
                elem.classList.add("plugin-toggle-active");
            }
        });
    });
});