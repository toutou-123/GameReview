const swapadmin = document.getElementById("swapping")
const useradmin = document.getElementById("showuser")
const gameadmin = document.getElementById("showgame")
const sidebar = document.getElementById("sidebar")
var toggle = true

swapadmin.addEventListener("click", function () {
    if (toggle === true) {
        useradmin.style.display = "flex"
        gameadmin.style.display = "none"
        sidebar.style.display = "none"
        toggle = false
    }
    else {
        useradmin.style.display = "none"
        gameadmin.style.display = "table"
        sidebar.style.display = "block"
        toggle = true
    }
})

// Set initial display states
useradmin.style.display = "none"
gameadmin.style.display = "table"
sidebar.style.display = "block"