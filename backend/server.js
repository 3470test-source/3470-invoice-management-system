require("dotenv").config();
const express = require("express");
const cors = require("cors");   
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());



/*==== Add Course ====*/
app.post("/add-course",(req,res)=>{

    const { course_name, course_fee } = req.body;

    const sql =
    `INSERT INTO courses
    (course_name,course_fee)
    VALUES (?,?)`;

    db.query(
        sql,
        [course_name,course_fee],
        (err,result)=>{

            if(err){
                return res.send(err);
            }

            res.send("✅ Course added successfully.");

        }
    );

});



/*==== Get All Courses ====*/
app.get("/courses",(req,res)=>{

    db.query(

        "SELECT * FROM courses",

        (err,result)=>{

            if(err){
                return res.send(err);
            }

            res.json(result);

        }

    );

});



/*==== students-with-course ====*/
app.get("/students-with-course", (req, res) => {

    const sql = `
    SELECT
        students.id,
        students.student_name,
        students.course,
        courses.course_fee
    FROM students
    LEFT JOIN courses
    ON students.course = courses.course_name
    `;

    db.query(sql, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});



/*==== Delete course ====*/
app.delete("/courses/:id", (req,res)=>{

    const id = req.params.id;

    db.query(
        "DELETE FROM courses WHERE id=?",
        [id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"✅ Course deleted successfully."
            });

        }
    );

});



/*==== Edit & Updates Course ====*/
app.put("/courses/:id",(req,res)=>{

    const id = req.params.id;

    const {
        course_name,
        course_fee
    } = req.body;

    db.query(
        "UPDATE courses SET course_name=?, course_fee=? WHERE id=?",
        [course_name,course_fee,id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: "✅ Course updated successfully."
            });

        }
    );

});





/*==== Add Student ====*/
app.post("/add-student", (req,res)=>{

    const {
        student_name, email, mobile, course, address, city, country, postcode
    } = req.body;

    const sql = `
    INSERT INTO students
    (
        student_name, email, mobile, course, address, city, country, postcode
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            student_name, email, mobile, course, address, city, country, postcode
        ],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"✅ Student added successfully"
            });

        }
    );

});



/*==== Get All Students ====*/
app.get("/students", (req, res) => {

    db.query(
        "SELECT * FROM students",
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});



/*==== Delete students ====*/
app.delete("/delete-student/:id",(req,res)=>{

    const id = req.params.id;

    db.query(
        "DELETE FROM students WHERE id=?",
        [id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"🗑️ Student deleted successfully."
            });
        }
    );
});



/*==== Edit & Updates Student ====*/
app.put("/update-student/:id",(req,res)=>{

    const id = req.params.id;

    const { student_name } = req.body;

    db.query(
        "UPDATE students SET student_name=? WHERE id=?",
        [student_name,id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"✏️ Student updated successfully."
            });
        }
    );
});






/* ==== Create invoice ====*/
app.post("/create-invoice", (req, res) => {

    const {
        invoice_no, student_name, course, course_fee, discount, paid_amount,
        pending_amount, payment_mode, invoice_date, due_date, remarks
    } = req.body;

    const sql = `
    INSERT INTO invoices
    (
        invoice_no, student_name, course, course_fee, discount, paid_amount, 
        pending_amount, payment_mode, invoice_date, due_date, remarks
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            invoice_no, student_name, course, course_fee, discount, paid_amount, pending_amount,
            payment_mode, invoice_date, due_date, remarks
        ],
        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).json({
                    message: "Invoice creation failed"
                });
            }

            res.json({
                message: "✅ Invoice created successfully"
            });

        }
    );

});



/*==== Get All invoice ====*/
app.get("/invoices", (req, res) => {

    db.query(
        "SELECT * FROM invoices ORDER BY id DESC",
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});



/* ==== delete invoice ====*/
app.delete("/invoice/:id",(req,res)=>{

    db.query(
        "DELETE FROM invoices WHERE id=?",
        [req.params.id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"Invoice deleted successfully"
            });
        }
    );

});



/* ==== Edit & Update invoice ====*/ 
app.put("/invoice/:id", (req,res)=>{

    const id = req.params.id;

    const {
        student_name, course, course_fee, discount, paid_amount, pending_amount,
        payment_mode, invoice_date, due_date, remarks
    } = req.body;

    const sql = `
    UPDATE invoices
    SET
        student_name=?, course=?, course_fee=?, discount=?, paid_amount=?,
        pending_amount=?, payment_mode=?, invoice_date=?, due_date=?, remarks=?
    WHERE id=?
    `;

    db.query(
        sql,
        [
            student_name, course, course_fee, discount, paid_amount, pending_amount,
            payment_mode, invoice_date, due_date, remarks,id
        ],
        (err,result)=>{

            if(err){
                console.log(err);

                return res.status(500).json({
                    message:"Invoice update failed"
                });
            }

            res.json({
                message:"Invoice updated successfully"
            });

        }
    );

});



/* ==== View Invoice Details ====*/
app.get("/invoice/:invoice_no", (req,res)=>{

const sql =
"SELECT * FROM invoices WHERE invoice_no=?";

db.query(
sql,
[req.params.invoice_no],
(err,result)=>{

if(err){
return res.status(500).json(err);
}

res.json(result[0]);

});

});

















const PDFDocument =
require("pdfkit");

app.get(
"/download-invoice/:id",
(req,res)=>{

    const id =
    req.params.id;

    db.query(
    "SELECT * FROM invoices WHERE id=?",
    [id],
    (err,result)=>{

        if(err) return res.status(500).send();

        const invoice =
        result[0];

        const doc =
        new PDFDocument();

        res.setHeader(
        "Content-Type",
        "application/pdf"
        );

        res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${invoice.invoice_no}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(20)
        .text("Invoice");

        doc.moveDown();

        doc.text(
        "Invoice No: " +
        invoice.invoice_no
        );

        doc.text(
        "Student: " +
        invoice.student_name
        );

        doc.text(
        "Course: " +
        invoice.course
        );

        doc.text(
        "Amount: ₹" +
        invoice.course_fee
        );

        doc.end();

    });

});










/*--------------------------
          Start server
  --------------------------*/

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});