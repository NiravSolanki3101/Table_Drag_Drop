let nextRowNumber = 0;
let colNumber = 3;
let moveHistory = [];
let initialRowNumber = 3;

function createBox(number, color) {
    const box = document.createElement('div');
    box.className = 'box';
    box.textContent = number;
    box.style.backgroundColor = color;
    box.draggable = true;
    return box;
}

function createTable(rowCount) {
    const table = document.getElementById('dragDropTable');
    for (let i = 0; i < rowCount; i++) {
        const row = table.insertRow();
        for (let j = 1; j <= colNumber; j++) {
            const cell = row.insertCell();
            const number = (i * colNumber + j) * 100;
            const box = createBox(number, getRandomColor());
            cell.appendChild(box);
        }
        nextRowNumber++;
    }
}

function addEventListeners() {
    const table = document.getElementById('dragDropTable');
    table.addEventListener('dragstart', dragStart);
    table.addEventListener('dragover', dragOver);
    table.addEventListener('drop', drop);
    document.getElementById('undoButton').addEventListener('click', undo);
    document.getElementById('addRowButton').addEventListener('click', addRow);
    document.getElementById("undoButton").disabled = true
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const draggedElement = document.querySelector('.box.dragging');
    const targetElement = e.target.closest('.box');

    if (draggedElement && targetElement && draggedElement !== targetElement) {
        const sourceCell = draggedElement.parentNode;
        const targetCell = targetElement.parentNode;

        // add move
        moveHistory.push({
            newRowAdd : false,
            source: sourceCell,
            target: targetCell,
            draggedElement: draggedElement,
            targetElement: targetElement
        });

        animateSwap(draggedElement, targetElement);
    }

    draggedElement.classList.remove('dragging');

    // enable undo option
    document.getElementById("undoButton").disabled = false;
}

function animateSwap(elem1, elem2) {
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();

    // Create clones for animation
    const clone1 = elem1.cloneNode(true);
    const clone2 = elem2.cloneNode(true);

    // Set initial positions
    setFixedPosition(clone1, rect1);
    setFixedPosition(clone2, rect2);

    // Add clones to the body and add 'moving' class
    document.body.appendChild(clone1);
    document.body.appendChild(clone2);
    clone1.classList.add('moving');
    clone2.classList.add('moving');

    // Hide original elements
    elem1.style.visibility = 'hidden';
    elem2.style.visibility = 'hidden';

    // Animate clones
    setTimeout(() => {
        setFixedPosition(clone1, rect2);
        setFixedPosition(clone2, rect1);

        // After animation, swap original elements and remove clones
        setTimeout(() => {
            // Swap the elements
            const parent1 = elem1.parentNode;
            const parent2 = elem2.parentNode;
            parent1.appendChild(elem2);
            parent2.appendChild(elem1);

            // Show original elements
            elem1.style.visibility = 'visible';
            elem2.style.visibility = 'visible';

            // Remove clones
            document.body.removeChild(clone1);
            document.body.removeChild(clone2);
        }, 500);
    }, 50);
}

function setFixedPosition(element, rect) {
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
}

function undo() {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        if (lastMove.newRowAdd == true)
        {
            document.getElementById('dragDropTable').deleteRow(-1);
            nextRowNumber--;
        }
        else
        {
            animateSwap(lastMove.targetElement, lastMove.draggedElement);
        }
    }
    if (moveHistory.length <= 0){
        document.getElementById("undoButton").disabled = true;
    }
}

function addRow() {
    const table = document.getElementById('dragDropTable');
    const newRow = table.insertRow();
    for (let j = 1; j <= colNumber; j++) {
        const cell = newRow.insertCell();
        const number = (nextRowNumber * colNumber) * 100 + j * 100;
        const box = createBox(number, getRandomColor());
        cell.appendChild(box);
    }
    nextRowNumber++;

    moveHistory.push({
        newRowAdd : true,
        source: null,
        target: null,
        draggedElement: null,
        targetElement: null
    });

    // enable undo option
    document.getElementById("undoButton").disabled = false;
}

// generate random colors
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

createTable(initialRowNumber);
addEventListeners();