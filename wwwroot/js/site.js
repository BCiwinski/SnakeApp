const { event } = require("jquery");

function generateBoard(gridTag) {

    const size = 10;

    var columns = "auto";

    for (let i = 1; i < size; i++) {

        columns += " auto";
    }

    gridTag.style.gridTemplateColumns = columns;

    for (let i = 0; i < size * size; i++) {

        let tag = document.createElement("div");
        tag.className = "square";
        tag.style = "aspect-ratio: 1/ 1;display: block;align-items: center;background-color: black;"

        gridTag.appendChild(tag);
    }
}
