const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const cookieParser = require("cookie-parser");
const session = require('express-session');

let generated_otp = ''

app.use(bodyParser.json());
app.use(cors());

app.use(cookieParser());

// creating 24 hours from milliseconds

const oneDay = 1000 * 60 * 60 * 24;

// session middleware
app.use(session({
  secret: "thisismysecrctkeyasdfghjkloiuyt",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'SCOPEINDIAdemo',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.get('/app/products', (req, res) => {
  connection.query('SELECT * FROM registration', (error, data) => {
    if (error) throw error;
    res.send(data);
  });
});

app.post('/app/products', (req, res) => {
  const formData = req.body;
  console.log(formData);

  const full_name = formData.full_name;
  const dob = formData.dob;
  const gender = formData.gender;
  const education = formData.education;
  const course = "formData.course";
  const mobile = formData.mobile;
  const email = formData.email;
  const g_mobile = formData.g_mobile;
  const training = formData.training;
  const location = formData.location;
  const g_name = formData.g_name;
  const g_occupation = formData.g_occupation;
  const training_time = formData.training_time;
  const address = formData.address;
  const country = "India";
  const state = "Kerala";
  const city = formData.city;
  const pincode = formData.pincode;
  const password = "123"
  const User_id = "s123"

  connection.query(
    `INSERT INTO registration (full_name, dob, gender,education, course, mobile, email, g_mobile,training, location, g_name, g_occupation,training_time,address,country,state,city,pincode ,password,User_id) values ('${full_name}','${dob}','${gender}','${education}','${course}','${mobile}','${email}','${g_mobile}','${training}','${location}','${g_name}','${g_occupation}','${training_time}','${address}','${country}','${state}','${city}','${pincode}',${password},'${User_id}')`,
    (error) => {
      if (error) {
        console.error('Error inserting into MySQL database:', error);
        res.status(500).send('Error submitting the form');
      } else {
        // Send an email using Nodemailer
        const email = formData.email;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sovin1994@gmail.com',
            pass: 'koqgqkcpnoitdnmu',
          },
        });

        const mailOptions = {
          from: 'sovin1994@gmail.com',
          to: email,
          subject: 'Registration Form Submission',
          text: 'Your Registration form submission',
          html: `
            <p><strong>Name:</strong> ${full_name}</p>
         
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
            <p><strong>Course:</strong> ${course}</p>
            <p><italic>Your Registration form submission is Successfull.</italic></p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
          } else {
            console.log('Email sent:', info.response);
            res.send('Form submitted successfully!');
          }
        });
        res.send('Form submitted successfully!');
      }
    }
  );
});
// option to fetch data from database 

app.get('/data/options', (req, res) => {
  const query = 'SELECT * FROM Courses';

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    res.json(results);
    // console.log(results);
  });
});

app.post('/sendmail', (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({

    service: 'gmail',
    auth: {
      user: 'sovin1994@gmail.com',
      pass: 'koqgqkcpnoitdnmu',
    },
  });


  // Setup email data

  const mailOptions = {
    from: `${name} <${email}>`,
    to: 'sovin1994@gmail.com',
    subject: subject,
    text: message
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Unable to send an email right now. Please try again later.');
    } else {
      console.log('Email sent:', info.response);
      res.send('Your message has been sent successfully!');
    }
  });
});


//first time login

const generatedOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;
  generated_otp = generatedOtp();
  console.log(generated_otp);

  setTimeout(() => {
    generated_otp = null;
    console.log('OTP expired and deleted');
  }, 60 * 1000);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sovin1994@gmail.com',
      pass: 'koqgqkcpnoitdnmu',
    },
  });

  const mailOptions = {
    from: 'sovin1994@gmail.com',
    to: email,
    subject: 'One-Time Password (OTP) Verification',
    text: `Your OTP: ${generated_otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Failed to send OTP');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({
        message: 'OTP sent successfully',
        generated_otp: generated_otp
      });
      // Verify OTP

      app.post('/api/verify-otp', (req, res) => {
        const { otp } = req.body;
        if (otp === generated_otp) {
          res.sendStatus(200);

        } else {
          res.status(400).json({ error: 'Invalid OTP' });
        }
      });

      // Set a new password

      app.post('/api/set-password', (req, res) => {
        const { password } = req.body;
        const { User_id } = req.body;
        const { email } = req.body;
        

        connection.query(
          `UPDATE registration SET password = '${password}', User_id = '${User_id}' WHERE email = '${email}'`,
          (error, results) => {
            if (error) {
              console.error('Error updating password in the database:', error);
              res.status(500).json({ error: 'Failed to set a new password' });
            } else {
              console.log(email);
              console.log(User_id, typeof (User_id));
              console.log(password);
              console.log('Password updated in the database');
              res.status(200).json({ message: 'Password set successfully' });
            }
          }
        );
      });

    }
  });


})

//Login Route

app.post('/app/login', (req, res) => {
  const { User_id, password, rememberMe } = req.body;
  connection.query(
    'SELECT * FROM registration WHERE User_id = ? AND password = ?',
    [User_id, password],
    (error, results) => {
      if (error) {
        console.error('Error executing the login query:', error);
        res.status(500).send('Error executing the login query');
      } else {
        if (results.length > 0) {
          req.session.User_id = User_id; 

          if (rememberMe) {
            res.cookie('User_id', User_id, { maxAge:  60 * 1000 });
          }
          res.sendStatus(200);
        } else {
          res.status(401).send('Invalid userid or password');
        }
      }
    }
  );
});

// Data fetching

app.get('/app/profile/:User_id', (req, res) => {
  const User_id = req.params.User_id;

  connection.query(
    'SELECT * FROM registration WHERE User_id = ?',
    [User_id],
    (error, data) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Error fetching data');
      } else if (data.length === 0) {
        res.status(404).send('User not found');
      } else {
        const profileData = data[0];
        res.send(profileData);
      }
    }
  );
});
// after edit to save the data 

app.put('/app/profile/:User_id', (req, res) => {
  const User_id = req.params.User_id;
  const updatedProfileData = req.body; 

  connection.query(
    `UPDATE registration SET ? WHERE User_id = ?`,
    [updatedProfileData, User_id],
    (error) => {
      if (error) {
        console.error('Error updating profile in MySQL database:', error);
        res.status(500).send('Error updating profile');
      } else {
        res.send('Profile updated successfully');
      }
    }
  );
});
// update course details

app.put('/app/course/:User_id', (req, res) => {
  const User_id = req.params.User_id;
  const { course } = req.body;

  connection.query(
    `UPDATE registration SET course = ? WHERE User_id = ?`,
    [course, User_id],
    (error, results) => {
      if (error) {
        console.error('Error updating profile data:', error);
        res.status(500).send('Error updating profile data');
      } else {
        res.send('Profile data updated successfully!');
      }
    }
  );
});
// Logout route
app.get('/app/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('User_id');
  res.sendStatus(200); 
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});