String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
var was = false

$("#Submit").click(function() {
    var username = $("#username").val();
    if (username.length == 0) {
        was = true;
        $("#username").addClass("is-invalid")
        $(".red").text("Please enter a username")
    } else if (username.length < 3) {
        was = true;
        $("#username").addClass("is-invalid")
        $(".red").text("Please enter a valid username")
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
                    $(".red").text("Username not found")
                    was = true
                }
            },
            error: function(error) {
                was = true;
                $(".red").text("Cannot find the server")
            }
        }).done(function(data) {
            var custom;
            var slim
            if (data.textures.custom) { custom = "Yes" } else { custom = "No" }
            if (data.textures.slim) { slim = "Yes" } else { slim = "No" }
            var result = "<p><strong>Username</strong>:" + username + "</p>"
            result += "<p><strong>Uuid</strong>:" + data.uuid + "</p>"

            if (data.created_at != null) {
                result += "<p><strong>Created at: </strong>" + data.created_at + "</p>"
            }
            if (data.username_history.length > 1) {
                result += '<p><strong>Username history:</strong><br>'
                data.username_history.forEach(function(Username) {
                    if (Username.changed_at != undefined) {
                        result += '<u>Username:</u> ' + Username.username + " <u>Changed at:</u> " + Username.changed_at.replace("Z", "").replace("T", " ") + '<em>' + +'</em>' + "<br>"
                    } else {
                        result += '<u>Username:</u> ' + Username.username + "<br>"
                    }

                })
                result += '</p>'
            }
            result += '<p><strong>Custom skin: </strong>' + custom + "</p>"
            result += '<p><strong>Slim skin: </strong>' + slim + "</p>"
            if (data.textures.skin.url != undefined) {
                result += '<a href="' + data.textures.skin.url + '" target="_blank"><button type="button" class="btn btn-primary">View skin</button> </a><br>'
            }

            result += '<br><button type="button" class="btn btn-primary" id="clear">Clear</button>'
            $("#result").html(result)
            $("#clear").click(function() {
                $("#result").remove()
                $(".margin").append('<div id="result"></div>')
                $("#username").val("")
            })
        })
    }
})