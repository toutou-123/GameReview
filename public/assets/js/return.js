let cards = document.getElementsByClassName('card');


for(let card of cards) {
    card.addEventListener('mouseover', () => {
        card.classList.add('flip');
    });
};

