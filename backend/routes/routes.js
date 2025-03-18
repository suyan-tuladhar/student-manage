const express = require('express');
const { getAdmin, addUserWithDetails, addUser, addParentdetails, deleteStudent, getUserById, getAllStudents, getAnnouncements, getFAQs, postSupport, editUserDetails } = require('../model/userSchema.js');
const { login } = require('../controller/loginController.js');
const router = express.Router();



router.get("/admin", getAdmin);
router.post("/students", addUserWithDetails);
router.post("/user", addUser);
router.post("/parents", addParentdetails);
router.delete("/students/:user_id", deleteStudent);
router.post('/login', login);
router.get('/users/:userid', getUserById);
router.get('/students', getAllStudents);
router.get('/announcements', getAnnouncements);
router.get('/faqs', getFAQs);
router.post('/support', postSupport);
router.patch('/edit/:userid', editUserDetails)

module.exports = {
    router
}