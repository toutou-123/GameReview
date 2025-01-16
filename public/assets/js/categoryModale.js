
const addCategoryBtn = document.getElementById('add-category');
const addGameBtn = document.getElementById('add-game');

const categoryModal = document.getElementById('categoryModal');
const gameModal = document.getElementById('addingGameModal');

const closeBtns = document.getElementsByClassName('close');

addCategoryBtn.onclick = function () {
    categoryModal.style.display = "block";
}

addGameBtn.onclick = function () {
    gameModal.style.display = "block";
}

for (let i = 0; i < closeBtns.length; i++) {
    closeBtns[i].onclick = function () {
        categoryModal.style.display = "none";
        gameModal.style.display = "none";
    }
}

window.onclick = function (event) {
    if (event.target == categoryModal) {
        categoryModal.style.display = "none";
    }
    if (event.target == gameModal) {
        gameModal.style.display = "none";
    }
}

