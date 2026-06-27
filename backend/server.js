require("dotenv").config();
const express = require("express");
const cors = require("cors");   
const db = require("./db");

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

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






// Save first payment into payment_history
if (Number(paid_amount) > 0) {

    const paymentSql = `
        INSERT INTO payment_history
        (
            invoice_no,
            student_name,
            payment_amount,
            payment_method,
            payment_date
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        paymentSql,
        [
            invoice_no,
            student_name,
            paid_amount,
            payment_mode,
            invoice_date
        ],
        (paymentErr) => {

            if(paymentErr){
                console.log(paymentErr);
            }

        }
    );
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
                message:"🗑️ Invoice deleted successfully."
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
                message:"✅ Invoice updated successfully."
            });

        }
    );

});



/* ==== View Invoice Details ====*/
app.get("/invoice/:invoice_no", (req,res)=>{

const sql = `
            SELECT
                invoices.*,
                students.mobile,
                students.email,
                students.address,
                students.city,
                students.country,
                students.postcode
            FROM invoices
            LEFT JOIN students
            ON invoices.student_name = students.student_name
            WHERE invoices.invoice_no = ?
        `;

db.query(
    sql,
    [req.params.invoice_no],
    (err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(result[0]);

    }
);

});



/* ====== invoice bill generator ====== */
app.get("/invoice-pdf/:invoice_no", (req, res) => {

/*--- Date Formate ---*/
function formatDate(dateValue){

    if(!dateValue) return "";

    const date = new Date(dateValue);

    const day = String(date.getDate()).padStart(2,"0");
    const month = String(date.getMonth() + 1).padStart(2,"0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

const invoiceNo = req.params.invoice_no;

const sql = `
            SELECT
                invoices.*,
                students.mobile,
                students.email,
                students.address,
                students.city,
                students.country,
                students.postcode
            FROM invoices
            LEFT JOIN students
            ON invoices.student_name = students.student_name
            WHERE invoices.invoice_no = ?
        `;

db.query(
    sql,
    [invoiceNo],
    (err,result)=>{

        if(err){
            console.log(err);
            return res.status(500).send("Database Error");
        }

        if(result.length === 0){
            return res.status(404).send("Invoice Not Found");
        }

        const invoice = result[0];

        console.log(invoice);

        const doc = new PDFDocument({size:"A4", margin:40});

        /*--- Header - Background design ---*/
        doc
        .roundedRect(
            15,
            15,
            565,
            810,
            10
        )

        .fillAndStroke("#ffffff", "#c0bbbb");

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename=${invoice.invoice_no}.pdf`
        );

        doc.pipe(res);

        /*--- Logo image ---*/
        const logoPath = path.join(
            __dirname,
            "..",
            "image",
            "Logo3470-health3-removebg-preview.png"
        );

        /*--- Signature image ---*/
        const signPath = path.join(
            __dirname,
            "..",
            "image",
            "Receipt.png"
        );

            console.log("Logo Path:", logoPath);
            console.log("Logo Exists:", fs.existsSync(logoPath));

            console.log("Sign Path:", signPath);
            console.log("Sign Exists:", fs.existsSync(signPath));

    /* ====================================
                COMPANY HEADER
    ==================================== */

        doc
        .roundedRect(
            15,
            15,
            565,
            170,
            10
        )
        .fill("#eef6ff");

        try{

            if(fs.existsSync(logoPath)){

                doc.image(
                    logoPath,
                    40,
                    10,
                    {
                        width:130
                    }
                );

            }

        }catch(error){

            console.log(
                "Logo Error:",
                error.message
            );

        }

        doc
        .fontSize(10)
        .fillColor("black")
        .text("No: 3/373, MCN Tower, 1st & 2nd Floor,", 40, 95);

        doc.text("OMR Mettukuppam, Chennai,", 40, 110);

        doc.text("Tamil Nadu, India.", 40, 125);

        doc.font("Helvetica-Bold");
        doc.text("Phone", 40, 145);
        doc.text("Email", 40, 160);

        doc.font("Helvetica");
        doc.text(":", 75, 145);
        doc.text(":", 75, 160);

        doc.text("+91 9876543210", 85, 145);
        doc.text("info@3470healthcare.com", 85, 160);

        doc
        .lineWidth(1)
        .moveTo(40,185)
        .lineTo(555,185)
        .stroke();

    /* ====================================
                INVOICE TITLE
    ==================================== */

        doc
        .fontSize(30)
        .fillColor("#1a61be")
        .text("INVOICE", 430, 40);

        doc
        .fontSize(11)
        .fillColor("black");

        doc.font("Helvetica-Bold");
        doc.text("Invoice No", 370, 95);
        doc.text("Invoice Date", 370, 125);
        doc.text("Due Date", 370, 155);

        doc.font("Helvetica");
        doc.text(":", 440, 95);
        doc.text(":", 440, 125);
        doc.text(":", 440, 155);

        doc.text(invoice.invoice_no, 450, 95);
        doc.text(formatDate(invoice.invoice_date), 450, 125);
        doc.text(formatDate(invoice.due_date), 450, 155);

    /* ====================================
                BILL TO
    ==================================== */

        console.log(invoice);

        doc
        .fontSize(14)
        .fillColor("#1a61be")
        .text("Bill To:", 40, 205);

        doc
        .fontSize(10)
        .fillColor("black");

        doc.text(invoice.student_name,40,230);

        doc.text("Mobile No", 40, 245);
        doc.text("Email ID", 40, 260);

        doc.text(":", 90, 245);
        doc.text(":", 90, 260);

        doc.text(invoice.mobile || "", 100, 245);
        doc.text(invoice.email || "", 100, 260);

        doc.text(`${invoice.address || ""}`,40,280);
        doc.text(`${invoice.city || ""} - ${invoice.postcode || ""}`,40, 305);

    /* ====================================
                STATUS BOX
    ==================================== */

        const status =
        Number(invoice.pending_amount) <= 0
        ? "PAID"
        : "PENDING";

        doc
        .roundedRect(
            420,
            230,
            120,
            40,
            15
        )

        .fill(
            status === "PAID"
            ? "#28a745"
            : "#dc3545"
        );

        doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(
            status,
            420,
            245,
                {width:120, align:"center"}
        );

        doc.fillColor("black");

    /* ====================================
            COURSE TABLE - HEADER
    ==================================== */

        doc
        .roundedRect(
            40,
            330,
            515,
            25,
            4
        )
        .fill("#0e60ad");

        doc
        .fillColor("white")
        .fontSize(11);

        doc.text("Course Name", 50, 338);

        doc.text("Qty", 300, 338);

        doc.text("Course Fee", 430, 338);

    /* ==============================
            COURSE TABLE DATA
    ============================== */

        doc
        .roundedRect(
            40,
            355.5,
            515,
            30,
            4
        )
        .stroke();

        doc
        .fillColor("black");

        doc.text(invoice.course, 50, 366);

        doc.text("1", 305, 366);

        doc.text(`₹ ${invoice.course_fee}`, 430, 366);
        
    /* ====================================
                TOTAL SECTION
    ==================================== */

        doc.fontSize(11);

        /*-- Labels --*/
        doc.font("Helvetica-Bold");
        doc.text("Total Amount", 370, 410);
        doc.text("Discount", 370, 435);
        doc.text("Amount Paid", 370, 460);
        doc.text("Pending Amount", 370, 485);
        doc.text("Payment Mode", 370, 510);

        /*-- Colons --*/
        doc.font("Helvetica");
        doc.text(":", 470, 410);
        doc.text(":", 470, 435);
        doc.text(":", 470, 460);
        doc.text(":", 470, 485);
        doc.text(":", 470, 510);

        /*-- Values --*/
        doc.text(`₹ ${invoice.course_fee}`, 480, 410);
        doc.text(`₹ ${invoice.discount}`, 480, 435);
        doc.text(`₹ ${invoice.paid_amount}`, 480, 460);
        doc.text(`₹ ${invoice.pending_amount}`, 480, 485);
        doc.text(invoice.payment_mode, 485, 510);

    /* ====================================
                REMARKS
    ==================================== */

        doc.fontSize(13).fillColor("#1a61be").text("Remarks",
            40,
            410
        );

        doc.fontSize(10).fillColor("black").text(invoice.remarks || "No Remarks",
            40,
            435,
            {
                width:220
            }
        );

    /* ====================================
                SIGNATURE
    ==================================== */

        try{

            if(fs.existsSync(signPath)){

                doc.image(
                    signPath,
                    410,
                    560,
                    {
                        width:120
                    }
                );

            }

        }catch(error){

            console.log(
                "Signature Error:",
                error.message
            );

        }

       doc.fontSize(10);

        doc.text("For 3470 Healthcare Pvt Ltd", 400, 615,
            { width: 150, align: "center" }
        );

        doc.text("Authorized Signatory", 400, 630,
            { width: 150, align: "center" }
        );

    /* ====================================
                FOOTER
    ==================================== */

        doc.moveTo(40,700)
        .lineTo(555,700)
        .stroke();

        doc
        .fontSize(13)
        .fillColor("#168039")
        .text(
            "Thank you for choosing 3470 Healthcare Pvt Ltd",
            160,
            715
        );

        doc.end();
    }
);

});






/* ==== Record Payment ====*/
app.post("/record-payment", (req,res)=>{

const {
    invoice_no,
    payment_amount,
    payment_method,
    payment_date
} = req.body;

db.query(
    "SELECT * FROM invoices WHERE invoice_no=?",
    [invoice_no],
    (err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        const invoice = result[0];

        const newPaid = Number(invoice.paid_amount) + Number(payment_amount);

        const newPending = Number(invoice.course_fee) - Number(invoice.discount) - newPaid;

        db.query(
        `UPDATE invoices
         SET paid_amount=?,
             pending_amount=?,
             payment_mode=?
         WHERE invoice_no=?`,
        [
            newPaid,
            newPending,
            payment_method,
            invoice_no
        ],
        (err)=>{

            if(err){
                return res.status(500).json(err);
            }

            db.query(
            `INSERT INTO payment_history
            (
                invoice_no,
                student_name,
                payment_amount,
                payment_method,
                payment_date
            )
            VALUES (?,?,?,?,?)`,
            [
                invoice_no,
                invoice.student_name,
                payment_amount,
                payment_method,
                payment_date
            ]
            );

            res.json({
                message:"✅ Payment recorded successfully."
            });

        });

    });

});




/* ===== Get All Pending Invoices ===== */
app.get("/pending-invoices", (req, res) => {

    const sql = `
    SELECT
        invoice_no,
        student_name,
        course,
        course_fee,
        discount,
        paid_amount,
        pending_amount
    FROM invoices
    WHERE pending_amount > 0
    ORDER BY student_name ASC
    `;

    db.query(sql, (err, result) => {

        if(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:"Database Error"
            });
        }

        res.json(result);

    });

});




/* ===== Payment History ===== */
app.get("/payment-history", (req, res) => {

    const sql = `
    SELECT *
    FROM payment_history
    ORDER BY payment_date DESC
    `;

    db.query(sql, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});








/* ==== invoice report summary ==== */
app.get("/invoice-report-summary", (req, res) => {

    const sql = `
    SELECT
        COUNT(*) AS totalInvoices,

        SUM(CASE
            WHEN pending_amount = 0
            THEN 1 ELSE 0
        END) AS paidInvoices,

        SUM(CASE
            WHEN pending_amount > 0
            THEN 1 ELSE 0
        END) AS pendingInvoices,

        SUM(paid_amount) AS totalRevenue

    FROM invoices
    `;

    db.query(sql, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});




/* ==== Invoice Report Table ==== */
app.get("/invoice-reports", (req,res)=>{

    const sql = `
    SELECT
        invoice_no,
        student_name,
        course,
        course_fee,
        discount,
        paid_amount,
        pending_amount,
        invoice_date
    FROM invoices
    ORDER BY id DESC
    `;

    db.query(sql,(err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});





























/* ==============================
   Student Report Summary
================================= */
app.get("/student-report-summary", (req, res) => {

    const sql = `
        SELECT

        (SELECT COUNT(*) FROM students) AS totalStudents,

        (
            SELECT COUNT(DISTINCT student_name)
            FROM invoices
        ) AS activeStudents,

        (
            SELECT COUNT(*)
            FROM courses
        ) AS totalCourses,

        (
            SELECT COUNT(*)
            FROM students
            WHERE MONTH(created_at)=MONTH(CURDATE())
            AND YEAR(created_at)=YEAR(CURDATE())
        ) AS newStudents
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});















/* ==============================
   Student Report Table
================================= */
app.get("/student-report", (req, res) => {

    const sql = `
        SELECT
            student_id,
            student_name,
            course_name,
            email,
            mobile
        FROM students
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});








/* ==============================
   Search Student
================================= */
app.get("/student-report/search/:keyword", (req, res) => {

    const keyword = "%" + req.params.keyword + "%";

    const sql = `
        SELECT
            student_id,
            student_name,
            course_name,
            email,
            mobile
        FROM students
        WHERE student_name LIKE ?
        ORDER BY id DESC
    `;

    db.query(sql, [keyword], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});





/* ==============================
   Filter Students by Course
================================= */
app.get("/student-report/course/:course", (req, res) => {

    const sql = `
        SELECT
            student_id,
            student_name,
            course_name,
            email,
            mobile
        FROM students
        WHERE course_name = ?
        ORDER BY id DESC
    `;

    db.query(sql, [req.params.course], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});






/*--------------------------
          Start server
  --------------------------*/

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});