String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
var was = false

$("#Submit").click(function() {
    var username = $("#username").val();
    if (username.length == 0) {
        was = true;
        $("#username").addClass("is-invalid")
        $(".red").text("Perfavore inserisci un username")
    } else if (username.length < 3) {
        was = true;
        $("#username").addClass("is-invalid")
        $(".red").text("Perfavore inserisci un username valido")
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
                    $(".red").text("Username non trovato")
                    was = true
                }
            }
        }).done(function(data) {
            var result = "<p><strong>Username</strong>:" + username + "</p>"
            result += "<p><strong>Uuid</strong>:" + data.uuid + "</p>"

            if (data.created_at != null) {
                result += "<p><strong>Creato il: </strong>" + data.created_at + "</p>"
            }
            if (data.username_history.length > 1) {
                result += '<p><strong>Storia degli username:</strong><br>'
                data.username_history.forEach(function(Username) {
                    if (Username.changed_at != undefined) {
                        result += '<u>Username:</u> ' + Username.username + " <u>Cambiato il:</u> " + Username.changed_at.replace("Z", "").replace("T", " ") + '<em>' + +'</em>' + "<br>"
                    } else {
                        result += '<u>Username:</u> ' + Username.username + "<br>"
                    }

                })
                result += '</p>'
            }
            result += '<p><strong>Skin personalizzata: </strong>' + data.textures.custom.toString().capitalize() + "</p>"
            result += '<p><strong>Skin magra: </strong>' + data.textures.slim.toString().capitalize() + "</p>"
            if (data.textures.skin.url != undefined) {
                result += '<a href="' + data.textures.skin.url + '" target="_blank"><button type="button" class="btn btn-primary">Guarda skin</button> </a><br>'
            }

            result += '<br><button type="button" class="btn btn-primary" id="clear">Pulisci</button>'
            $("#result").html(result)
            $("#clear").click(function() {
                $("#result").remove()
                $(".margin").append('<div id="result"></div>')
                $("#username").val("")
            })
        })
    }
})
