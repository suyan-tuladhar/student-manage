
const { pool } = require('../postgres/postgres.js');
const bcrypt = require('bcrypt');


async function getStudent(req,res){
    const {user_id} = req.params;
    try {
        const query =
        `SELECT *
        FROM user_details WHERE user_id IS $1;`
        const values = [user_id]; 
        const result = await pool.query(query,values);
        if (result.rows.length === 0){
            return res.status(404).json({Message:"Student not found"});
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error(`Error: ${err.message}, stack: ${err.stack}`);
        res.status(500).json({"error":"Internal Server Error"});
    }
}

async function getAdmin(req,res){
    try {
        const query =
        `SELECT *
        FROM users WHERE role_id IS 1;`
        const result = await pool.query(query);
        res.json(result.rows);
    }
    catch (err) {
        console.error(`Error: ${err.message}, stack: ${err.stack}`);
        res.status(500).json({"error":"Internal Server Error"});
    }
}

async function addUser(req,res){

    const {username,email,password} = req.body;
    try {
        const query =
        `INSERT INTO users (username, email, password, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`
        const values = [username, email, password, 2];
        const result = await pool.query(query, values);
        res.json({Message:"User Added Successfully"});
    }
    catch (err) {
        console.error(`Error: ${err.message}, stack: ${err.stack}`);
        res.status(500).json({"error":"Internal Server Error"});
    }
}

async function addParentdetails(req,res){
    const {father_name,mother_name,contact} = req.body;
    try{
        const query =
        `INSERT INTO parents (father_name, mother_name, contact)
        VALUES ($1, $2, $3)
        RETURNING *;`
        const values = [father_name, mother_name, contact];
        const result = await pool.query(query, values);
        res.json({Message:"Parent Details Added Successfully"});
    }
    catch(err){
        console.error(`Error: ${err.message}, stack: ${err.stack}`);
        res.status(500).json({"error":"Internal Server Error"});
    }
}

async function deleteStudent(req,res){
    
    const {user_id} = req.params;
    try{
        const query = 
        `DELETE FROM student_details
        WHERE user_id = $1
        RETURNING *;`
        const values = [user_id];
        const result = await pool.query(query, values);
        res.json({Message:"Student Deleted Successfully"});
    }
    catch(err){
        console.error(`Error: ${err.message}, stack: ${err.stack}`);
        res.status(500).json({"error":"Internal Server Error"});
    }   
}



async function addUserWithDetails(req, res) {
  const { username, email, password, firstname, lastname, gender, dob, rollno, grade, bloodg, religion, hobbies, avatar } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const rollnoInt = rollno && !isNaN(rollno) ? parseInt(rollno) : null;
  const gradeInt = grade && !isNaN(grade) ? parseInt(grade) : null;

  const formatName = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const formattedFirstname = formatName(firstname);
  const formattedLastname = formatName(lastname);

  const client = await pool.connect();
  try {
      await client.query("BEGIN");

      const userQuery = `
          INSERT INTO users (username, email, password, roleid)
          VALUES ($1, $2, $3, $4)
          RETURNING userid;`;
      const userValues = [username, email, hashedPassword, 2];

      const userResult = await client.query(userQuery, userValues);
      const userid = userResult.rows[0].userid;

      const studentQuery = `
          INSERT INTO user_details (userid, firstname, lastname, gender, dob, rollno, grade, bloodg, religion, hobbies, avatar)
          VALUES ($1, TRIM($2), TRIM($3), $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *;`;
      const studentValues = [userid, formattedFirstname, formattedLastname, gender, dob, rollnoInt, gradeInt, bloodg, religion, hobbies, avatar];

      await client.query(studentQuery, studentValues);

      await client.query("COMMIT");
      res.json({ Message: "User and Student Added Successfully", userid });
  } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Error: ${err.message}, stack: ${err.stack}`);
      res.status(500).json({ error: "Internal Server Error" });
  } finally {
      client.release();
  }
}


async function findUserByIdentifier(identifier) {
    const query = `
      SELECT userid, username, email, password, roleid
      FROM users
      WHERE email = $1 OR username = $1;
    `;
    const values = [identifier];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; 
  };

  async function getUserById(req, res) {
    let { userid } = req.params;
    userid = parseInt(userid, 10);
    if (isNaN(userid)) {
      return res.status(400).json({ success: false, error: "Invalid userid" });
    }
    try {
      const query = `
         SELECT u.userid, u.username, u.email, u.roleid,
        ud.firstname, ud.lastname, ud.gender, ud.dob,
        ud.rollno, ud.grade, ud.bloodg, ud.religion, ud.hobbies, ud.avatar, ud.address,
        p.father, p.mother, p.contact,
		    e.enrollmentdate, e.departuredate
        FROM users u
        LEFT JOIN user_details ud ON u.userid = ud.userid
        LEFT JOIN parents p ON u.userid = p.userid
		    LEFT JOIN enrollment e ON u.userid = e.userid
        WHERE u.userid = $1
      `;
      const values = [userid];
      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
        let user = result.rows[0];
        user.dob = formatDate(user.dob);
        user.enrollmentdate = formatDate(user.enrollmentdate);
        user.departuredate = formatDate(user.departuredate);
        res.json({ success: true, user: result.rows[0] });
      } else {
        res.json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  
  async function getAllStudents(req, res) {
    try {
      const query = `
        SELECT u.userid, u.username, u.email,
        ud.firstname, ud.lastname, ud.gender, ud.dob,
        ud.rollno, ud.grade, ud.bloodg, ud.religion, ud.hobbies, ud.avatar, ud.address
        FROM users u
        JOIN user_details ud ON u.userid = ud.userid
        WHERE u.roleid = 2
        ORDER BY ud.rollno ASC
      `;
      const result =  await pool.query(query);
      res.json({ success: true, students: result.rows });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  
  async function getAnnouncements(req, res) {
    try {
      const query = `SELECT * FROM announcements`;
      const result = await pool.query(query);
      res.json({ success: true, announcements: result.rows });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  
  async function getFAQs(req, res) {
    try {
      const query = `SELECT * FROM faqs`;
      const result = await pool.query(query);
      res.json({ success: true, faqs: result.rows });
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  
  async function postSupport(req, res) {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }
        try {
        const query = `INSERT INTO support (message) VALUES ($1)`; 
      const values = [message];
      const result = await pool.query(query, values);
      res.json({ success: true, id: result.rows[0]});
    } catch (error) {
      console.error("Error posting support message:", error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

const fieldToTableMap = {
    firstname: "user_details",
    lastname: "user_details",
    address: "user_details",
    gender: "user_details",
    dob: "user_details",
    bloodg: "user_details",
    father: "parents",
    mother: "parents",
    contact: "parents",
    hobbies: "user_details",
    religion: "user_details",
    rollno: "user_details",
    grade : "user_details",
    enrollmentdate: "enrollment",
    departuredate: "enrollment"
}

async function editUserDetails(req,res) {
   const {userid} = req.params;
   const updates = req.body;

  if (!userid){
      return res.status(400).json({"error":"User ID is required"});
  }

   try{
      const parentsUpdates = {};
      const userDetailsUpdates = {};
      const enrollmentUpdates = {};
      let userResult, parentsResult, enrollmentResult;

      for (const field of Object.keys(updates)) {
        const table = fieldToTableMap[field];
        if(table === "parents"){
          parentsUpdates[field] = updates[field];
        }
        else if(table === "user_details"){
          userDetailsUpdates[field] = updates[field];
        }
        else if(table === "enrollment"){
          enrollmentUpdates[field] = updates[field];
        }
      }

      if(Object.keys(userDetailsUpdates).length > 0){
        const userFields = Object.keys(userDetailsUpdates);
        const userSetClause = userFields.map((field, index) => `${field} = $${index + 1}`).join(",");
        const userValues = userFields.map(field => userDetailsUpdates[field]);

        const userQuery = `
        UPDATE user_details
        SET ${userSetClause} 
        WHERE userid = $${userFields.length + 1}
        RETURNING *;`

        userResult = await pool.query(userQuery, [...userValues, userid]);  
      }

      if (Object.keys(parentsUpdates).length > 0) {
        const parentsFields = Object.keys(parentsUpdates);
        const parentsValues = parentsFields.map(field => parentsUpdates[field]);
    
        const parentsSetClause = parentsFields.map((field, index) => `${field} = EXCLUDED.${field}`).join(", ");
    
        const parentsQuery = `
        INSERT INTO parents (userid, ${parentsFields.join(", ")})
        VALUES ($1, ${parentsFields.map((_, index) => `$${index + 2}`).join(", ")})
        ON CONFLICT (userid)
        DO UPDATE SET ${parentsSetClause}
        RETURNING *;`;
    
        parentsResult = await pool.query(parentsQuery, [userid, ...parentsValues]);
    }

      

      if (Object.keys(enrollmentUpdates).length > 0) {
        const enrollmentFields = Object.keys(enrollmentUpdates);
    
        const enrollmentValues = enrollmentFields.map(field => {
            let value = enrollmentUpdates[field];
            if (["enrollmentdate", "departuredate"].includes(field) && value) {
                const parsedDate = new Date(value);
                return isNaN(parsedDate) ? null : parsedDate.toISOString().split("T")[0]; 
            }
    
            return value;
        });
    
        const enrollmentSetClause = enrollmentFields.map((field, index) => `${field} = $${index + 2}`).join(", ");
    
        const enrollmentQuery = `
        INSERT INTO enrollment (userid, ${enrollmentFields.join(", ")})
        VALUES ($1, ${enrollmentFields.map((_, index) => `$${index + 2}`).join(", ")})
        ON CONFLICT (userid)
        DO UPDATE SET ${enrollmentSetClause}
        RETURNING *;`;
    
        enrollmentResult = await pool.query(enrollmentQuery, [userid, ...enrollmentValues]);
      }
  
      res.json({ 
        success: true, 
        userDetails: userResult ? userResult.rows : null,
        parentsDetails: parentsResult ? parentsResult.rows : null,
        enrollmentDetails: enrollmentResult ? enrollmentResult.rows : null
     });
   }
   catch(error) {
      console.error("Error editing:", error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
   }
}


module.exports = { findUserByIdentifier, getAdmin, addUserWithDetails, getStudent, addUser, addParentdetails, deleteStudent, getUserById, getAllStudents, getAnnouncements, getFAQs, postSupport, editUserDetails };