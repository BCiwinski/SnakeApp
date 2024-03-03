function startGame(gridTag, sizeNumber) {

    clearBoard(gridTag);
    generateBoard(gridTag, sizeNumber);
}

function clearBoard(gridTag) {

    while (gridTag.hasChildNodes()) {

        gridTag.removeChild(gridTag.firstElementChild);
    }
}

function generateBoard(gridTag, sizeNumber) {

    var columns = "auto";

    for (let i = 1; i < sizeNumber; i++) {

        columns += " auto";
    }

    gridTag.style.gridTemplateColumns = columns;

    for (let i = 0; i < sizeNumber * sizeNumber; i++) {

        let tag = document.createElement("div");
        tag.className = "square";

        gridTag.appendChild(tag);
    }
}
