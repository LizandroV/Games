const menuIcon = document.getElementById('menuIcon');
const nav = document.getElementById('nav');

menuIcon.addEventListener('click', () => {
    nav.classList.toggle('show');
});