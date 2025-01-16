document.addEventListener('DOMContentLoaded', function() {
    const burgerIcon = document.querySelector('.burger-icon');
    const menuItems = document.querySelector('.menu-items');

    burgerIcon.addEventListener('click', function() {
        menuItems.classList.toggle('active');
    });
});