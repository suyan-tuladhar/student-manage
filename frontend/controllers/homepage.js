import {usersUrl, announcementsUrl, faqsUrl, supportUrl, studentsUrl, editUrl} from "../config/config.js";

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userid = urlParams.get('userid');
  const role = urlParams.get('role');

  if (!userid || (role !== "admin" && role !== "student"))  {
      alert("Missing credentials, please log in.");
      window.location.href = "../views/index.html";
      return;
  }

  if (role === "admin") {
      $("#studentProfileContainer").hide();
      $("#enrollment").hide();
      $("#announcements").hide();
      $("#faq").hide();
      $("#support").hide();
      $("#adminView").show();
      displayAdminProfileList();
  } else if (role === "student") {
      $("#adminView").hide();
      $("#nav-admin").hide();
      fetch(usersUrl+`/${userid}`)
          .then((response) => response.json())
          .then((data) => {
              if (data.success) {
                  displayStudentProfile(data.user);
              } else {
                  console.error("User data not found.");
              }
          })
          .catch((error) => console.error("Error fetching user data:", error));

    displayAnnouncements();
    displayFAQs();
    setupSupportSection();
  } else {
      alert("Invalid role or missing role parameter.");
  }
  
  $("#adminLogoutBtn, #studentLogoutBtn").click(function () {
      window.location.href = "../views/index.html";
  });
});

function displayStudentProfile(user) {
  $('#studentProfileContainer').show();
  $('#firstName').text(user.firstname);
  $('#lastName').text(user.lastname);
  $('#email').text(user.email);
  $('#username').text(user.username);
  $('#gender').text(user.gender);
  $('#address').text(user.address);
  $('#rollno').text(user.rollno);
  $('#grade').text(user.grade);
  $('#father').text(user.father);
  $('#mother').text(user.mother);
  $('#contact').text(user.contact);
  $('#profilePic').attr('src', user.avatar);
  $("#dateofbirth").text(user.dob);
  $('#hobbies').text(user.hobbies);
  $('#bloodgroup').text(user.bloodg);
  $('#religion').text(user.religion);
  $('#enrollmentdate').text(user.enrollmentdate);
  $('#departure').text(user.departuredate);
}

function displayAnnouncements() {
  fetch(announcementsUrl)
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

function setupSupportSection() {
  $("#submitSupport").click(function () {
      const message = $("#supportMessage").val().trim();
      if (message) {
          fetch(supportUrl, {
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

function displayFAQs() {
  fetch(faqsUrl)
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

function displayAdminProfileList() {
    fetch(studentsUrl)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const students = data.students;
                const profileList = $('#profileList');
                profileList.empty();
                students.forEach(student => {
                    const studentCard = `
                        <div class="col-md-4 mb-4 px-3">
                            <div class="card student-card" style="width: 320px;">
                                <img src="${student.avatar}" class="card-img-top student-img" style="height:170px; width:150px; display:block; margin:0 auto; padding-top:15px;" alt="Student Picture">
                                <div class="card-body" style="padding-left:20px">
                                    <h5 class="card-title student-title"><br>${student.firstname} ${student.lastname}<br><br></h5>
                                    <p class="card-text student-text"><strong>Address:</strong> ${student.address || ""}</p>
                                    <p class="card-text student-text"><strong>Roll No:</strong> ${student.rollno || ""}</p>
                                    <p class="card-text student-text"><strong>Grade:</strong> ${student.grade || ""}</p>
                                    <button class="btn btn-primary btn-sm student-btn mt-2" onclick="showStudentDetails(${student.userid})">Details</button>
                                </div>
                            </div>
                        </div>
                    `;
                    profileList.append(studentCard);
                });
            }
        })
        .catch(error => console.error("Error fetching students:", error));
  }


window.showStudentDetails = function (userid) {

  fetch(usersUrl+`/${userid}`)
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              const user = data.user;
              document.getElementById('detailsModal').dataset.userid = userid;
              $('#modalFirstName').text(user.firstname || "");
              $('#modalLastName').text(user.lastname || "");
              $('#modalEmail').text(user.email || "");
              $('#modalUsername').text(user.username || "");
              $('#modalGender').text(user.gender || "");
              $('#modalAddress').text(user.address || "");
              $('#modalRollno').text(user.rollno || "");
              $('#modalGrade').text(user.grade || "");
              $('#modalBloodgroup').text(user.bloodg || "");
              $('#modalHobbies').text(user.hobbies || "");
              $('#modalDateofbirth').text(user.dob || "");
              $('#modalReligion').text(user.religion || "");
              $('#modalFather').text(user.father || "");
              $('#modalMother').text(user.mother || "");
              $('#modalContact').text(user.contact || "");
              $('#modalImage').attr('src', user.avatar || "default.jpg");
              $('#modalEnrollmentdate').text(user.enrollmentdate || "");
              $('#modalDeparturedate').text(user.departuredate || "");
              $('#detailsModal').modal('show');
          } else {
              console.error("Student details not found.");
          }
      })
      .catch(error => console.error("Error fetching student details:", error));
}
function showSuccessToast(message) {
    let successContainer = document.getElementById('successMessage');

    successContainer.innerHTML = '';

    let toastHTML = `
       <div id="toastMessage" class="toast align-items-center text-white bg-success border-0 show" role="alert" 
            aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
       </div>
    `;

    successContainer.innerHTML = toastHTML;

    let toastElement = document.getElementById('toastMessage');
    if (toastElement) {
        let toast = new bootstrap.Toast(toastElement, { delay: 3000 });

        toastElement.classList.remove('fade', 'hide');
        toastElement.classList.add('show');
        toast.show();
    } else {
        console.error("Toast element not found!");
    }
}
window.showSuccessToast = showSuccessToast;

function updateUserDetails(user) {
    fetch(`${editUrl}/${user.userid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessToast("Details updated successfully!");

            displayAdminProfileList();
        } else {
            alert("Failed to update details.");
        }
    })
    .catch(error => {
        console.error("Error updating details:", error);
        alert("An error occurred while updating details.");
    });
}



function toggleEdit() {
    const icon = document.querySelector('.bi-pencil, .bi-save');
    const allowedFields = ['Address', 'Father', 'Mother', 'Contact', 'Hobbies', 'Religion', 'Roll no', 'Grade'];
    
    if (!icon.dataset.mode || icon.dataset.mode === '') {
        icon.dataset.mode = 'edit';
        const table = document.getElementById('details-table');

        for (let i = 0; i < table.rows.length; i++) {
            const fieldLabel = table.rows[i].cells[0].innerText.trim();
            if (allowedFields.includes(fieldLabel)) {
                const cell = table.rows[i].cells[1];
                const currentValue = cell.innerText.trim();
                cell.innerHTML = `<input type="text" class="form-control" value="${currentValue}" data-original="${currentValue}" />`;
            }
        }
        icon.classList.remove('bi-pencil');
        icon.classList.add('bi-save');
    }
    else {
        const table = document.getElementById('details-table');
        let updates = {};
    
        for (let i = 0; i < table.rows.length; i++) {
            const fieldLabel = table.rows[i].cells[0].innerText.trim();
            if (allowedFields.includes(fieldLabel)) {
                const cell = table.rows[i].cells[1];
                const input = cell.querySelector('input');
    
                if (input) {
                    let newValue = input.value.trim();
    
                    const originalValue = input.getAttribute('data-original');
                    if (newValue !== originalValue) {
                        const fieldName = fieldLabel.toLowerCase().replace(/\s/g, '');
                        updates[fieldName] = newValue;
                    }
    
                    cell.innerText = newValue;
                }
            }
        }
    
        if (Object.keys(updates).length === 0) {
            icon.classList.remove('bi-save');
            icon.classList.add('bi-pencil');
            icon.dataset.mode = '';
            return;
        }
    
        const urlParams = new URLSearchParams(window.location.search);
        const userid = urlParams.get('userid');
        if (!userid) {
            alert("User ID not found. Unable to save changes.");
            return;
        }
        updates['userid'] = userid;
    
        updateUserDetails(updates);
    
        icon.classList.remove('bi-save');
        icon.classList.add('bi-pencil');
        icon.dataset.mode = '';
    }
}

window.toggleEdit = toggleEdit;

function toggleEditModal() {
    const icon = document.querySelector('#detailsModal .bi-pencil, #detailsModal .bi-save');
    const modal = document.getElementById('detailsModal');
    const userid = modal.dataset.userid; 
    const allowedFields = ['First name','Last name', 'Gender', 'Date of birth', 'Blood group', 'Address', 'Father', 'Mother', 'Contact', 'Hobbies', 'Religion', 'Roll no', 'Grade', 'Enrollment date', 'Departure date'];
    
    if (!userid) {
        alert("User ID not found. Unable to save changes.");
        return;
    }

    if (!icon.dataset.mode || icon.dataset.mode === '') {
        icon.dataset.mode = 'edit';
        const table = document.getElementById('details-table-modal');

        for (let i = 0; i < table.rows.length; i++) {
            const fieldLabel = table.rows[i].cells[0].innerText.trim();
            if (allowedFields.includes(fieldLabel)) {
                const cell = table.rows[i].cells[1];
                const currentValue = cell.innerText.trim();
                if (fieldLabel === 'Gender') {
                    cell.innerHTML = `<div>
                                        <label>
                                        <input type="radio" name="gender" value="Male" ${currentValue === 'Male' ? 'checked' : ''} /> Male
                                        </label>
                                        <label>
                                        <input type="radio" name="gender" value="Female" ${currentValue === 'Female' ? 'checked' : ''} /> Female
                                        </label>
                                    </div>`;
                    }
                    else if (fieldLabel === 'Blood group') {
                        const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
                        cell.innerHTML = `
                            <select class="form-control" name="bloodg">
                                ${bloodGroups.map(bg => `
                                    <option value="${bg}" ${currentValue === bg ? 'selected' : ''}>${bg}</option>
                                `).join('')}
                            </select>
                        `;
                    }
                else if (fieldLabel === 'Date of birth' || fieldLabel === 'Enrollment date' || fieldLabel === 'Departure date') {
                    cell.innerHTML = `<input type="date" class="form-control" value="${currentValue}" data-original="${currentValue}" />`;
                }
                else {
                    cell.innerHTML = `<input type="text" class="form-control" value="${currentValue}" data-original="${currentValue}" />`;
                }
            }
        }
        icon.classList.remove('bi-pencil');
        icon.classList.add('bi-save');
    }
    else {
        const table = document.getElementById('details-table-modal');
        let updates = {};
    
        for (let i = 0; i < table.rows.length; i++) {
            const fieldLabel = table.rows[i].cells[0].innerText.trim();
            if (allowedFields.includes(fieldLabel)) {
                const cell = table.rows[i].cells[1];
                const input = cell.querySelector('input, select');
    
                if (input) {
                    let newValue = input.value.trim();
    
                    if (fieldLabel === 'Gender') {
                        const selectedGender = cell.querySelector('input[name="gender"]:checked');
                        newValue = selectedGender.value;
                    }
                    
                    else if (fieldLabel === 'Blood group') {
                        const selectedBloodGroup = cell.querySelector('select[name="bloodg"]');
                        newValue = selectedBloodGroup.value;
                    }
                    
                    else if (fieldLabel === 'Date of birth' || fieldLabel === 'Enrollment date' || fieldLabel === 'Departure date') {
                        newValue = new Date(newValue).toISOString().split('T')[0];
                    }
                    const originalValue = input.getAttribute('data-original');
                    if (newValue !== originalValue) {
                        const fieldName = fieldLabel.toLowerCase().replace(/\s/g, '');
                        updates[fieldName] = newValue;
                    }
    
                    cell.innerText = newValue;
                }
            }
        }
    
        if (Object.keys(updates).length === 0) {
            icon.classList.remove('bi-save');
            icon.classList.add('bi-pencil');
            icon.dataset.mode = '';
            return;
        }
    
        updates['userid'] = userid;
    
        updateUserDetails(updates);
    
        icon.classList.remove('bi-save');
        icon.classList.add('bi-pencil');
        icon.dataset.mode = '';
    }
}
window.toggleEditModal = toggleEditModal;
