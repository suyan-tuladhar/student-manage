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

function redirectToHomepage(user) {
    const role = getRoleFromId(user.roleid);
    if (role) {
        window.location.href = `/frontend/views/homepage.html?role=${role}&userId=${user.userid}`;
    } else {
        console.error('Role not found!');
    }
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
}

function getRoleFromId(roleid) {
    if (roleid === 1) return "admin";
    if (roleid === 2) return "student";
    return null;
}

function displayAnnouncements() {
    fetch("http://localhost:5000/announcements")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const announcements = data.announcements;
                const announcementList = $('#announcementList');
                announcementList.empty();
                announcements.forEach(announcement => {
                    const card = `
                        <div class="col-md-6 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${announcement.title}</h5>
                                    <p class="card-text">${announcement.description}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    announcementList.append(card);
                });
            }
        })
        .catch(error => console.error("Error fetching announcements:", error));
}

function displayFAQs() {
    fetch("http://localhost:5000/faqs")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const faqs = data.faqs;
                const faqAccordion = $('#faqAccordion');
                faqAccordion.empty();
                faqs.forEach((faq, index) => {
                    const faqItem = `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${index}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                                    ${faq.question}
                                </button>
                            </h2>
                            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    ${faq.answer}
                                </div>
                            </div>
                        </div>
                    `;
                    faqAccordion.append(faqItem);
                });
            }
        })
        .catch(error => console.error("Error fetching FAQs:", error));
}

function setupSupportSection() {
    $("#submitSupport").click(function () {
        const message = $("#supportMessage").val().trim();
        if (message) {
            fetch("http://localhost:5000/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Your message has been submitted. We will get back to you soon!");
                        $("#supportMessage").val("");
                    } else {
                        alert("Failed to submit message.");
                    }
                })
                .catch(error => {
                    console.error("Support submission error:", error);
                    alert("An error occurred while submitting your message.");
                });
        } else {
            alert("Please enter a message before submitting.");
        }
    });
  }

function displayStudentProfile(user) {
    $('#studentProfileContainer').show();
    $('#firstName').text(user.firstName);
    $('#lastName').text(user.lastName);
    $('#email').text(user.email);
    $('#username').text(user.username);
    $('#gender').text(user.gender);
    $('#address').text(user.address);
    $('#rollno').text(user.rollno);
    $('#class').text(user.class);
    $('#father').text(user.father);
    $('#mother').text(user.mother);
    $('#contact').text(user.contact);
    $('#profilePic').attr('src', user.image);
    $("#dateofbirth").text(user.dob);
    $('#hobbies').text(user.hobbies);
    $('#bloodgroup').text(user.bloodg);
    $('#religion').text(user.religion);
    $('#enrollmentdate').text(user.enrollmentdate);
    $('#departure').text(user.departuredate);
}

function handleLogin() {
    const emailOrUsername = $("#emailOrUsername").val().trim();
    const password = $("#password").val().trim();

    $("#emailError").text("");
    $("#passwordError").text("");

    if (!validateInput(emailOrUsername, password)) return;

    fetch("http://localhost:5000/login", {
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

module.export = { displayAnnouncements, displayFAQs, displayStudentProfile, handleLogin} 