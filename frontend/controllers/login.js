import {loginUrl} from "../config/config.js";

$(document).ready(function () {
    submitLogin();
}); 

function submitLogin() {
    $(document).keypress(function (event) {
        if (event.which === 13) { //13 is the ascii value for enter key
            handleLogin();
        }
    });

    $("#submitButton").click(handleLogin);
}

function handleLogin() {
    const emailOrUsername = $("#emailOrUsername").val().trim();
    const password = $("#password").val().trim();

    $("#emailError").text("");
    $("#passwordError").text("");

    if (!validateInput(emailOrUsername, password)) return;

    fetch(loginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ emailOrUsername, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.userid) {
            redirectToHomepage(data);
        } else {
            $("#passwordError").text(data.error || "Invalid email/username or password.");
        }
    })
    .catch(error => {
        console.error("Login error:", error);
        $("#passwordError").text("An error occurred during login.");
    });
}

function validateInput(emailOrUsername, password) {
    let isValid = true;
    if (!emailOrUsername) {
        $("#emailError").text("Email/Username is missing.");
        isValid = false;
    }
    if (!password) {
        $("#passwordError").text("Password is missing.");
        isValid = false;
    }
    return isValid;
}//----------------------------------------------------------------//

function redirectToHomepage(user) {
    const role = getRoleFromId(user.roleid);
    if (role) {
        window.location.href = `/frontend/views/homepage.html?role=${role}&userid=${user.userid}`;
    } else {
        console.error('Role not found!');
    }
}

function getRoleFromId(roleid) {
    if (roleid === 1) return "admin";
    if (roleid === 2) return "student";
    return null;
}//----------------------------------------------------------------//

