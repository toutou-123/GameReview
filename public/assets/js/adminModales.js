const addCategoryBtn = document.getElementById('add-category');
const addGameBtn = document.getElementById('add-game');
const modifyGameBtns = document.querySelectorAll('.modifyGame');
const deleteGameBtns = document.querySelectorAll('.deleteGame');


const categoryModal = document.getElementById('categoryModal');
const gameModal = document.getElementById('addingGameModal');
const modifyGameModal = document.getElementById('modifyGameModal');
const deleteGameModal = document.getElementById('deleteGameModal');

const closeBtns = document.getElementsByClassName('close');

addCategoryBtn.onclick = function () {
    categoryModal.style.display = "block";
}

addGameBtn.onclick = function () {
    gameModal.style.display = "block";
}

deleteGameBtns.forEach(btn => {
    btn.onclick = function () {
        const gameId = this.getAttribute('data-game-id');
        deleteGameModal.style.display = "block";
        document.getElementById('deleteForm').action = "/deleteGame/" + gameId
    }
});

document.addEventListener('DOMContentLoaded', function () {

    modifyGameBtns.forEach(btn => {
        btn.onclick = function () {
            const gameId = this.getAttribute('data-game-id');

            Promise.all([
                fetch(`/game/${gameId}`).then(response => response.json()),
                fetch(`/categories`).then(response => response.json())
            ])
                .then(([game, categories]) => {
                    document.getElementById('modifyForm').action = "/modifyGame/" + gameId;
                    document.getElementById('modifyName').value = game.gameName;
                    document.getElementById('modifyDeveloper').value = game.developer;
                    document.getElementById('modifyDescription').value = game.description;
                    document.getElementById('modifyLinkFandom').value = game.linkFandom;
                    document.getElementById('modifyLinkSteam').value = game.linkSteam;

                    const categoriesContainer = document.getElementById('modal-categories');
                    categoriesContainer.innerHTML = '';
                    categories.forEach(category => {
                        input = document.createElement("input")
                        input.type = "checkbox"
                        input.name = "gameCategory"
                        input.value = category.id
                        input.checked = game.categories.some(gameCategory => gameCategory.id === category.id);
                        label = document.createElement("label")
                        label.for = "gameCategory"
                        label.innerHTML = category.name
                        categoriesContainer.appendChild(input);
                        categoriesContainer.appendChild(label);
                    });
                })
                .catch(error => console.error('Erreur:', error));
            modifyGameModal.style.display = "block"; // Affiche la modale

        }
    });
});

for (let i = 0; i < closeBtns.length; i++) {
    closeBtns[i].onclick = function () {
        categoryModal.style.display = "none";
        gameModal.style.display = "none";
        modifyGameModal.style.display = "none";
        deleteGameModal.style.display = "none";
    }
}

window.onclick = function (event) {
    if (event.target == categoryModal) {
        categoryModal.style.display = "none";
    }
    else if (event.target == gameModal) {
        gameModal.style.display = "none";
    }
    else if (event.target == modifyGameModal) {
        modifyGameModal.style.display = "none";
    }
    else if (event.target == deleteGameModal) {
        deleteGameModal.style.display = "none";
    }
}

