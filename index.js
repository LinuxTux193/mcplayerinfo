var lang = window.navigator.userLanguage || window.navigator.language;
if (lang != null || lang != undefined) {
    if (lang.includes("it")) {
        var script = document.createElement("script");
        script.setAttribute("src", "it.js");
        document.body.appendChild(script);
        $(".page-header").text("Informazioni su un giocatore di minecraft")
        $("#Submit").html("Invia")
        $("title").html("Informazioni su un giocatore di minecraft")
    } else {
        var script = document.createElement("script")
        script.setAttribute("src", "en.js");
        document.body.appendChild(script)
        $(".page-header").text("Informations about Minecraft player")
        $("#Submit").html("Submit")
        $("title").html("Informations about Minecraft player")
    }
} else {
    var script = document.createElement("script")
    script.setAttribute("src", "en.js");
    document.body.appendChild(script)
    $(".page-header").text("Get informations about Minecraft player")
    $("#Submit").html("Submit")
    $("title").html("Get informations about Minecraft player")
}