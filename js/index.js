//Definisco funzioni utili
function post_request(data, variable) {
    if (variable == 1) { //se la variabile è tutte le lingue
        all_langs = data
        console.log(all_langs)
    } else if (variable == 2) { //se la variabile è lingua
        language = data
    }

}

function get_langs() {
    fetch("/lang/list.json").then(res => { return res.json() }).then(json => { post_request(json, 1) })
}

function get_lang(lang) {
    fetch("/lang/" + lang + ".json").then(res => { return res.json() }).then(json => { post_request(json, 2) })
}

function setuplang(lang) {
    fetch("/lang/" + lang + ".json").then(res => { return res.json }).then(json => {
        $(".page-header").text(lang.title)
        $("#Submit").html(lang.submit)
        $("title").html(lang.title)
        $(".modal-title").text(lang.modaltext);
        $("#close").text(lang.close)
    })
}

function get_url(url) {
    return proxy_url + url.replace("https://", "").replace("http://", "")
}

function forceDownload(url, fileName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function() {
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement("a");
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    };
    xhr.send();
}

function copy(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(textToCopy);
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
            document.execCommand("copy") ? res() : rej();
            textArea.remove();
        });
    }
}
//Sezione lingue 
var language = window.navigator.userLanguage || window.navigator.language;
language = language.substring(0, 3);
var all_langs;
get_langs()
console.log(all_langs);

if (language != null || language != undefined) {
    if (language != "en" && all_langs.langs.include(language)) {
        setuplang(language)
    } else {
        setuplang("en")
    }
} else {
    setuplang("en")
}
get_lang(language)

//Inizio codice sito

var correct = '<i class="bi bi-check-lg" style="color:green;"></i>'
var False = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"  style="color:red;" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg>'
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
var was = false;
var proxy_url = "https://api.codetabs.com/v1/proxy/?quest="
var animations = {
    idle: skinview3d.IdleAnimation,
    walk: skinview3d.WalkingAnimation,
    run: skinview3d.RunningAnimation,
    fly: skinview3d.FlyingAnimation,
}

$("#username").keyup(function(event) {
    if (event.which == 13) {
        $("#Submit").focus();
        $("#Submit").click();
    }
})
$("#Submit").click(function() {
    var username = $("#username").val();
    if (username.length == 0) {
        was = true;
        $("#username").addClass("is-invalid");
        $(".red").text(language.insertusername);
    } else {
        if (was) {
            $(".red").text("");
            $("#username").removeClass("is-invalid");
            $("#username").addClass("was-validated");
            was = false;
        }
        var id;
        $.ajax({
            url: " https://api.ashcon.app/mojang/v2/user/" + username,
            method: "GET",
            statusCode: {
                404: function() {
                    $("#username").addClass("is-invalid");
                    $(".red").text(language.notfound);
                    was = true;
                },
                400: function() {
                    $("#username").addClass("is-invalid");
                    $(".red").text(language.notfound);
                    was = true;
                }
            },
            error: function(error) {
                was = true;
                $(".red").text(language.servererror);
            }
        }).done(function(data) {
            var custom;
            var slim;
            var legacy;
            username = data.username;

            if (data.textures.custom) {
                custom = correct
            } else {
                custom = False
            }
            if (data.textures.slim) {
                slim = correct
            } else {
                slim = False
            }
            if (data.legacy != undefined) {
                if (data.legacy) {
                    legacy = correct
                } else {
                    legacy = False
                }
            } else {
                legacy = False
            }

            var current_animation;
            var result = "";
            var controls_result = "";
            result += '<canvas id="skin_container"></canvas><br>'
            controls_result += '<div><input class="form-check-input" type="radio" id="idle" value="idle" checked name="animation"><label class="form-check-label" for="idle">' + language.idle + '</label>'
            controls_result += '<input class="form-check-input" type="radio" id="walk" value="walk" name="animation"><label class="form-check-label" for="walk">' + language.walk + '</label>'
            controls_result += '<input class="form-check-input" type="radio" id="run" value="run" name="animation"><label class="form-check-label" for="run">' + language.run + '</label>'
            controls_result += '<input class="form-check-input" type="radio" id="fly" value="fly" name="animation"><label class="form-check-label" for="fly">' + language.fly + '</label>'
            controls_result += '<input class="form-check-input" type="checkbox" id="rotating" value="rotating" name="animation"><label class="form-check-label" for="rotating">' + language.rotate + '</label>'
            result += '<div class="controls" id="controls"></div><br>';
            result += "<p><strong>Username </strong>: " + username + "</p>";
            result += "<p><strong>Uuid</strong>: " + data.uuid + "</p>";
            result += "<p><strong>" + language.legacy + "</strong>" + legacy + "</p>";
            if (data.created_at != null) {
                result += "<p><strong>" + language.createdat + "</strong>:" + data.created_at + "</p>";
            }
            if (data.username_history.length > 1) {
                result += "<p><strong>" + language.history + "</strong></p>";
                result += '<table class="table table-hover">';
                result += "<thead>";
                result += "<tr>";
                result += "<th>Username</th>";
                result += "<th>" + language.changeat + "</th></thead>";
                result += "<tbody>";
                data.username_history.forEach(function(Username) {
                    if (Username.changed_at != undefined) {
                        result += "<tr>";
                        result += "<td>" + Username.username + "</td> ";
                        result +=
                            "<td>" +
                            Username.changed_at.replace("Z", "").replace("T", " ") +
                            "</td>";
                        result += "</tr>";
                    } else {
                        result += "<tr >";
                        result += "<td >" + Username.username + "</td> ";
                        result += "<td>" + language.firstusername + "</td>";
                        result += "</tr>";
                    }
                });
                result += "</tbody></table><p></p>";
            }

            result += "<p><strong>" + language.custom + "</strong> " + custom + "</p>";
            result += "<p><strong>" + language.slim + "</strong> " + slim + "</p>";
            if (data.textures.skin.url != undefined) {
                result +=
                    '<button class="btn btn-primary" id="downloadskin">' + language.downloadskin + '</button><br><br>';
            }
            if (data.textures.cape != undefined) {
                controls_result += '<input class="form-check-input" type="checkbox" name="cape" value="cape" id="cape" checked><label class="form-check-label" for="cape">' + language.cape + '</label>';
                controls_result += '<input class="form-check-input" type="checkbox" name="elytra" value="elytra" id="elytra"><label class="form-check-label" for="elytra">Elytra</label>';
                result +=
                    '<button class="btn btn-primary" id="downloadcape">' + language.downloadcape + '</button><br><br>';
            }
            result +=
                '<button id="head" data-toggle="modal" data-target="#dialog" class="btn btn-primary">' + language.headcommand + '</button><br>';
            result +=
                '<br><button type="button" class="btn btn-primary" id="clear">' + language.clear + '</button>';
            $("#result").html(result);
            controls_result += '</div>'
            $("#controls").html(controls_result);
            let skinViewer = new skinview3d.SkinViewer({
                canvas: document.getElementById("skin_container"),
                width: 400,
                height: 500,
                skin: get_url(data.textures.skin.url)
            });
            var rotating = skinViewer.animations.add(skinview3d.RotatingAnimation);
            rotating.paused = true
            if (data.textures.cape != undefined) {
                skinViewer.loadCape(
                    get_url(data.textures.cape.url)
                );
            }
            $("#rotating").click(function() {
                if ($(this).is(":checked")) {
                    rotating.paused = false;
                } else {
                    rotating.paused = true;
                }
            })
            $("#cape").click(function() {
                if ($(this).is(":checked")) {
                    skinViewer.loadCape(
                        get_url(data.textures.cape.url)
                    );
                } else if ($(this).is(":not(:checked)")) {
                    if ($("#elytra").is(":checked")) {
                        skinViewer.loadCape(null, { backEquipment: "elytra" });
                    } else {
                        skinViewer.loadCape(null)
                    }

                }
            });
            $("#elytra").click(function() {
                if ($(this).is(":checked")) {
                    if ($("#cape").is(":not(:checked)")) {
                        $("#cape").prop("checked", true)
                    }
                    skinViewer.loadCape(
                        get_url(data.textures.cape.url), { backEquipment: "elytra" }
                    );
                } else if ($(this).is(":not(:checked)")) {
                    skinViewer.loadCape(get_url(data.textures.cape.url))
                }
            })
            let control = skinview3d.createOrbitControls(skinViewer);
            control.enableRotate = true;
            control.enableZoom = true;
            control.enablePan = false;
            skinViewer.fov = 50
            $('input[type="radio"][name="animation"]').change(function() {
                animation = $('input[type="radio"][name="animation"]:checked').val()
                if (animation !== "") {
                    if (current_animation != undefined) {
                        current_animation.resetAndRemove()
                    }
                    current_animation = skinViewer.animations.add(animations[animation]);
                }
            })

            $("#clear").click(function() {
                $("#result").html("");
                $("#username").val("");
            });
            $("#head").click(function() {
                copy("/give @p minecraft:player_head{SkullOwner:" + username + "}");
            });
            $("#downloadskin").click(function() {
                forceDownload(
                    get_url(data.textures.skin.url),
                    data.username + " skin.png"
                );
            });
            $("#downloadcape").click(function() {
                forceDownload(
                    get_url(data.textures.cape.url),
                    data.username + " " + language.cape.toLowerCase() + ".png"
                );
            });
        });
    }
});