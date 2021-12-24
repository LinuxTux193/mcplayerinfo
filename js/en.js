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
        $(".red").text("Perfavore inserisci un username/uuid");
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
                    $(".red").text("Username/uuid not found");
                    was = true;
                },
                400: function() {
                    $("#username").addClass("is-invalid");
                    $(".red").text("Username/uuid not found");
                    was = true;
                }
            },
            error: function(error) {
                was = true;
                $(".red").text("Unable to find the server");
            }
        }).done(function(data) {
            var custom;
            var slim;
            var legacy;
            username = data.username;

            if (data.textures.custom) {
                custom = "Yes";
            } else {
                custom = "No";
            }
            if (data.textures.slim) {
                slim = "Yes";
            } else {
                slim = "No";
            }
            if (data.legacy != undefined) {
                if (data.legacy) {
                    legacy = "Yes";
                } else {
                    legacy = "No";
                }
            } else {
                legacy = "No";
            }

            var current_animation;
            var result = "";
            var controls_result = "";
            controls_result += '<div><input class="form-check-input" type="radio" id="idle" value="idle" checked name="animation"><label class="form-check-label" for="idle">Still</label>'
            controls_result += '<input class="form-check-input" type="radio" id="walk" value="walk" name="animation"><label class="form-check-label" for="walk">Walk</label>'
            controls_result += '<input class="form-check-input" type="radio" id="run" value="run" name="animation"><label class="form-check-label" for="run">Run</label>'
            controls_result += '<input class="form-check-input" type="radio" id="fly" value="fly" name="animation"><label class="form-check-label" for="fly">Fly</label>'
            controls_result += '<input class="form-check-input" type="checkbox" id="rotating" value="rotating" name="animation"><label class="form-check-label" for="rotating">Rotate</label>'
            result += '<canvas id="skin_container"></canvas><br>';
            result += '<div class="controls" id="controls"></div><br>';
            if (data.uuid == "5a94b57f-84cc-4248-a1d9-bdfe95cdf2c1") {
                result += "<strong>Wow, this is my account</strong><br>"
            }
            result += "<p><strong>Username </strong>: " + username + "</p>";
            result += "<p><strong>Uuid</strong>: " + data.uuid + "</p>";
            result += "<p><strong>Legacy account: </strong>" + legacy + "</p>";
            if (data.created_at != null) {
                result += "<p><strong>Created at </strong>:" + data.created_at + "</p>";
            }
            if (data.username_history.length > 1) {
                result += "<p><strong>Username history</strong></p>";
                result += '<table class="table table-hover">';
                result += "<thead>";
                result += "<tr>";
                result += "<th>Username</th>";
                result += "<th>Changed at</th></thead>";
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
                        result += "<td>First username</td>";
                        result += "</tr>";
                    }
                });
                result += "</tbody></table><p></p>";
            }

            result += "<p><strong>Custom skin</strong>: " + custom + "</p>";
            result += "<p><strong>Flat skin</strong>: " + slim + "</p>";
            if (data.textures.skin.url != undefined) {
                result +=
                    '<button class="btn btn-primary" id="downloadskin">Scarica skin</button><br><br>';
            }
            if (data.textures.cape != undefined) {
                controls_result += '<input class="form-check-input" type="checkbox" name="cape" value="cape" id="cape" checked><label class="form-check-label" for="cape">Cape</label>';
                controls_result += '<input class="form-check-input" type="checkbox" name="elytra" value="elytra" id="elytra"><label class="form-check-label" for="elytra">Elytra</label>';
                result +=
                    '<button class="btn btn-primary" id="downloadcape">Download cape</button><br><br>';
            }
            result +=
                '<button id="head" data-toggle="modal" data-target="#dialog" class="btn btn-primary">Copy command for the head</button><br>';
            result +=
                '<br><button type="button" class="btn btn-primary" id="clear">Clear</button>';
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
                    data.username + " cape.png"
                );
            });
        });
    }
});