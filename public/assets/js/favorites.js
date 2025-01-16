const favoriteButton = document.getElementById('favorite-button');
if (favoriteButton) {
    favoriteButton.addEventListener('click', function () {
        const gameId = this.getAttribute('data-game-id');
        console.log(gameId);

        if (this.classList.contains('favorited')) {
            this.classList.remove('favorited');
            this.innerText = 'Ajouter aux favoris';
            removeFromFavorites(gameId);
        } else {
            this.classList.add('favorited');
            this.innerText = 'Retirer des favoris';
            addToFavorites(gameId);
        }
    });
}


const removeFavoriteButtons = document.querySelectorAll('.remove-favorite-button');

removeFavoriteButtons.forEach(button => {

    button.addEventListener('click', function () {
        const gameId = this.getAttribute('data-game-id');
        console.log(gameId);
        removeFromFavorites(gameId);
    });
});

function addToFavorites(gameId) {
    fetch(`/favorites/add/${gameId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: gameId }),
    })
        .then(response => {
            response.json().then(data => {
                console.log(data);
            })
            console.log(response);
            location.reload()
            
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout aux favoris');

            }
            console.log(`Jeu ${gameId} ajouté aux favoris.`);
        })
        .catch(error => console.error('Erreur:', error));
}

function removeFromFavorites(gameId) {
    fetch(`/favorites/remove/${gameId}`, {
        method: 'DELETE'
    })
        .then(response => {
            response.json().then(data => {
                console.log(data);
            })
            console.log(response);

            location.reload()

            if (!response.ok) {
                throw new Error('Erreur lors du retrait des favoris');
            }
            console.log(`Jeu ${gameId} retiré des favoris.`);
        })
        .catch(error => console.error('Erreur:', error));
}
