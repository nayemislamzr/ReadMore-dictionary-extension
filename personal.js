document.getElementById("name").addEventListener("click", () => {
    document.querySelector("div.nav-list").style.display = "block";
})
document.body.addEventListener("click", ((click) => {
    document.querySelector("div.nav-list").style.display = "none";
}), true);