String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
var was = false


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
        $(".red").text("Perfavore inserisci un username/uuid")
    }  else {
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
                    $(".red").text("Username/uuid non trovato")
                    was = true
                },
                400: function() {
                    $("#username").addClass("is-invalid");
                    $(".red").text("Errore nella richiesta");
                    was = true;
                }
            },
            error: function(error) {
                was = true;
                $(".red").text("Impossibile raggiungere il server");
            }
        }).done(function(data) {
            var custom;
            var slim;
            var legacy;
            username = data.username
            if (data.textures.custom) { custom = "Si" } else { custom = "No" }
            if (data.textures.slim) { slim = "Si" } else { slim = "No" }
            if (data.legacy != undefined) { if (data.legacy) { legacy = "Si" } else { legacy = "No" } } else { legacy = "No" }
            var result = "<p><strong>Username </strong>: " + username + "</p>"
            result += "<p><strong>Uuid</strong>: " + data.uuid + "</p>"
            result += "<p><strong>Account legacy: </strong>" + legacy + "</p>"
            if (data.created_at != null) {
                result += "<p><strong>Creato il </strong>:" + data.created_at + "</p>"
            }
            if (data.username_history.length > 1) {
                result += '<p><strong>Storia degli username</strong></p>'
                result += "<table class=\"table table-hover\">";
                result += "<thead>"
                result += "<tr>";
                result += "<th>Username</th>";
                result += "<th>Cambiato il</th></thead>";
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
                        result += '<td>Primo username</td>';
                        result += '</tr>';
                    }
                })
                result += '</tbody></table><p></p>'
            }
            result += '<p><strong>Skin personalizzata</strong>: ' + custom + "</p>"
            result += '<p><strong>Skin magra</strong>: ' + slim + "</p>"
            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                result += "<p><strong>Testa su minecraft</strong>: <code>/give @p minecraft:player_head{SkullOwner:" + username + '}</code> <button class="btn btn-primary" id="head" data-toggle="modal" data-target="#dialog">Copia</button><br>'
            }
            if (data.textures.skin.url != undefined) {
                result += '<a href="' + data.textures.skin.url + '" target="_blank"><button type="button" class="btn btn-primary">Vedi skin</button> </a><br>'
            }
            result += '<br><button type="button" class="btn btn-primary" id="clear">Pulisci</button>'
            $("#result").html(result)
            $("#clear").click(function() {
                $("#result").html("")
                $("#username").val("")
            })
            $("#head").click(function() {
                copy("/give @p minecraft:player_head{SkullOwner:" + username + "}")
            })
        })
    }
})