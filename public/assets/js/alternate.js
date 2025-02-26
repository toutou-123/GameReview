let connform = document.getElementById("login-section")
let inscrform = document.getElementById("signup-section")
let newly = document.getElementById("newbutton")
let older = document.getElementById("oldbutton")


newly.addEventListener("click", function() {
    connform.style.display = "none"
    inscrform.style.display = "block"
    older.style.display = "flex"
});

older.addEventListener("click", function(){
    connform.style.display = "flex"
    inscrform.style.display = "none"
    newly.style.display = "flex"
})