var modal = document.getElementById("modal");

var images = document.querySelectorAll('.clickable-image');

images.forEach(function (image) {
    image.onclick = function () {
        modal.style.display = "block";
    }
});

images.forEach(function (image) {
    image.onclick = function () {
        var gameId = this.getAttribute('data-game-id'); // Assurez-vous que chaque image a un attribut data-game-id

        fetch(`/game/${gameId}`)

            .then(response => response.json())
            .then(game => {
                // Mettez à jour le contenu de la modale avec les données du jeu
                document.getElementById('modal-title').innerText = `Titre : ${game.gameName}`; // Nom du jeu
                document.getElementById('modal-image').src = `/assets/img/uploads/gamePic/${game.gameImage}`; // Image du jeu
                document.getElementById('modal-description').innerText = `Description : ${game.description}`; // Description du jeu
                document.getElementById('modal-developer').innerText = `Développeur: ${game.developer}`; // Développeur
                document.getElementById('modal-linkFandom').innerHTML = `<a href="${game.linkFandom}" target="_blank">Voir le wiki</a>`; // Lien vers le wiki
                document.getElementById('modal-linkSteam').innerHTML = `<a href="${game.linkSteam}" target="_blank">Voir le jeu</a>`; // Lien vers le jeu
                document.getElementById('favorite-button').dataset.gameId = game.gameId

                const categoriesContainer = document.getElementById('modal-categories');
                categoriesContainer.innerHTML = '';


                game.categories.forEach(category => {
                    const categoryLink = document.createElement('a');
                    categoryLink.href = `/home?category=${category}`; // Lien vers la page d'accueil avec le paramètre de catégorie
                    categoryLink.innerText = category.name; // Nom de la catégorie
                    categoryLink.style.marginRight = '10px'; // Ajoute un espacement entre les catégories
                    categoriesContainer.appendChild(categoryLink);
                });

                console.log(categoriesContainer);

            })
            .catch(error => console.error('Erreur:', error));
        modal.style.display = "block"; // Affiche la modale
    }
});

var span = document.getElementsByClassName("close")[0];

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}