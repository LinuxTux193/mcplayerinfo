String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
var was = false

function forceDownload(url, fileName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function() {
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
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
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
}

$("#Submit").click(function() {
    var username = $("#username").val();
    if (username.length == 0) {
        was = true;
        $("#username").addClass("is-invalid")
        $(".red").text("Please enter a username/uuid")
    } else {
        if (was) {
            $(".red").text("")
            $("#username").removeClass("is-invalid")
            $("#username").addClass("was-validated")
            was = false
        }
        var id;
        $.ajax({
            url: " https://api.ashcon.app/mojang/v2/user/" + username,
            method: "GET",
            statusCode: {
                404: function() {
                    $("#username").addClass("is-invalid")
                    $(".red").text("Username/uuid not found")
                    was = true
                },
                400: function() {
                    $("#username").addClass("is-invalid");
                    $(".red").text("Request error");
                    was = true;
                }
            },
            error: function(error) {
                was = true;
                $(".red").text("Cannot find the server")
            }
        }).done(function(data) {
            var custom;
            var slim;
            var legacy;
            username = data.username

            if (data.textures.custom) { custom = "Yes" } else { custom = "No" }
            if (data.textures.slim) { slim = "Yes" } else { slim = "No" }
            if (data.legacy != undefined) { if (data.legacy) { legacy = "Yes" } else { legacy = "No" } } else { legacy = "No" }
            var result = "";
            result += '<canvas id="skin_container"></canvas><br>'

            result += "<p><strong>Username </strong>: " + username + "</p>"
            result += "<p><strong>Uuid</strong>: " + data.uuid + "</p>"
            result += "<p><strong>Legacy account: </strong>" + legacy + "</p>"
            if (data.created_at != null) {
                result += "<p><strong>Created at </strong>:" + data.created_at + "</p>"
            }
            if (data.username_history.length > 1) {
                result += '<p><strong>Username history</strong></p>'
                result += "<table class=\"table table-hover\">";
                result += "<thead>"
                result += "<tr>";
                result += "<th>Username</th>";
                result += "<th>Changed at</th></thead>";
                result += "<tbody>";
                data.username_history.forEach(function(Username) {
                    if (Username.changed_at != undefined) {
                        result += "<tr>"
                        result += '<td>' + Username.username + '</td> ';
                        result += '<td>' + Username.changed_at.replace("Z", "").replace("T", " ") + '</td>';
                        result += '</tr>';
                    } else {
                        result += '<tr >';
                        result += '<td >' + Username.username + '</td> ';
                        result += '<td>First username</td>';
                        result += '</tr>';
                    }
                })
                result += '</tbody></table><p></p>'
            }

            result += '<p><strong>Custom skin</strong>: ' + custom + "</p>"
            result += '<p><strong>Slim skin</strong>: ' + slim + "</p>"
            if (data.textures.skin.url != undefined) {
                result += '<button class="btn btn-primary" id="downloadskin">Download skin</button><br><br>'
            }
            if (data.textures.cape != undefined) {
                result += '<button class="btn btn-primary" id="downloadcape">Download cape</button><br><br>'
            }
            if (!/iPhone|Kindle|iPad|iPod|Android/i.test(navigator.userAgent)) {
                result += '<button id="head" data-toggle="modal" data-target="#dialog" class="btn btn-primary">Copy command for the head</button><br>'
            }
            result += '<br><button type="button" class="btn btn-primary" id="clear">Clear</button>'
            $("#result").html(result)
            let skinViewer = new skinview3d.SkinViewer({
                canvas: document.getElementById("skin_container"),
                width: 300,
                height: 400,
                skin: "https://cors-anywhere.herokuapp.com/" + data.textures.skin.url
            });
            if (data.textures.cape != undefined) {
                skinViewer.loadCape("https://cors-anywhere.herokuapp.com/" + data.textures.cape.url)
            }
            skinViewer.animations.add(skinview3d.WalkingAnimation);
            skinViewer.animations.add(skinview3d.RotatingAnimation);
            $("#clear").click(function() {
                $("#result").html("")
                $("#username").val("")
            })
            $("#head").click(function() {
                copy("/give @p minecraft:player_head{SkullOwner:" + username + "}")
            })
            $("#downloadskin").click(function() {
                forceDownload("https://cors-anywhere.herokuapp.com/" + data.textures.skin.url, data.username + " skin.png")
            })
            $("#downloadcape").click(function() {
                forceDownload("https://cors-anywhere.herokuapp.com/" + data.textures.cape.url, data.username + " mantello.png")
            })
        })
    }
})