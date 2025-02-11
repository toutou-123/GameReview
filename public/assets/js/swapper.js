const swapadmin = document.getElementById("swapping")
const useradmin = document.getElementById("showuser")
const gameadmin = document.getElementById("showgame")

var toggle = false

swapadmin.addEventListener("click", function () {
    if (toggle === true) {
        useradmin.style.display = "table"
        gameadmin.style.display = "none"
        toggle = false
    }
    else {
        useradmin.style.display = "none"
        gameadmin.style.display = "table"
        toggle = true
    }
})