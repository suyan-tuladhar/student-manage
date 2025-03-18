import {studentsUrl} from "../config/config.js";

$(document).ready(function () {
    submitRegistration();
});

function submitRegistration() {
    $(document).keypress(function (event) {
        if (event.which === 13) { //13 is the ascii value for enter key
            handleRegistration();
        }
    });
    $("#registerButton").click(handleRegistration);
}

function handleRegistration() {
    const userData = getUserInput();
    
    if (!validateInput(userData)) {
        $("#message").text("Fill all the details please.");
        return;
    }
    
    registerUser(userData);
}

function getUserInput() {
    return {
        firstname: $("#firstName").val().trim(),
        lastname: $("#lastName").val().trim(),
        gender: $("input[name='gender']:checked").val(),
        dob: $("#dob").val().trim(),
        bloodg: $("#bloodgroup").val().trim(),
        username: $("#username").val().trim(),
        email: $("#email").val().trim(),
        password: $("#password").val(),
        rollno: "",
        grade: "",
        religion: "",
        hobbies: "",
        avatar: $("input[name='avatar']:checked").val()
    };
}

function validateInput(userData) {
    return userData.firstname &&
           userData.lastname &&
           userData.gender &&
           userData.dob &&
           userData.bloodg &&
           userData.username &&
           userData.email &&
           userData.password;
}

function registerUser(userData) {
    fetch(studentsUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.userid) {
            $("#message").text("Registration successful!");
            window.location.href = "/frontend/views/index.html";
        } else {
            $("#message").text(data.error || "Registration failed.");
        }
    })
    .catch(error => {
        console.error("Error during registration:", error);
        $("#message").text("An error occurred during registration.");
        console.error(`Error: ${err.message}, stack: ${err.stack}`);
    });
}
