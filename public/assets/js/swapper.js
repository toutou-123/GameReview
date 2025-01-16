const swapadmin = document.getElementById("swapping")
const useradmin = document.getElementById("showuser")
const gameadmin = document.getElementById("showgame")

var toggle = false

swapadmin.addEventListener("click", function () {
    if (toggle === true) {
        useradmin.style.display = "table"
        gameadmin.style.display = "none"
        console.log(useradmin);
        console.log(gameadmin);
        toggle = false
    }
    else {
        useradmin.style.display = "none"
        gameadmin.style.display = "table"
        console.log(useradmin);
        console.log(gameadmin);
        toggle = true
    }
})