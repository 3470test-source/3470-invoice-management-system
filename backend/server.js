require("dotenv").config();
const express = require("express");
const cors = require("cors");   
const db = require("./db");

const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

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






















// app.get("/invoice-pdf/:invoice_no",(req,res)=>{

//     db.query(
//         "SELECT * FROM invoices WHERE invoice_no=?",
//         [req.params.invoice_no],
//         (err,result)=>{

//             if(err || result.length===0){
//                 return res.status(404).send("Invoice not found");
//             }

//             const invoice = result[0];

//             const PDFDocument =
//             require("pdfkit");

//             const doc =
//             new PDFDocument();

//             res.setHeader(
//                 "Content-Type",
//                 "application/pdf"
//             );

//             doc.pipe(res);

//             doc.fontSize(20)
//             .text("Invoice");

//             doc.moveDown();

//             doc.text(
//                 "Invoice No: " +
//                 invoice.invoice_no
//             );

//             doc.text(
//                 "Student: " +
//                 invoice.student_name
//             );

//             doc.text(
//                 "Course: " +
//                 invoice.course
//             );

//             doc.text(
//                 "Amount: ₹" +
//                 invoice.course_fee
//             );

//             doc.end();

//         }
//     );

// });


// const invoice = result[0];

//             const doc = new PDFDocument({
//                 size: "A4",
//                 margin: 40
//             });

//             res.setHeader(
//                 "Content-Type",
//                 "application/pdf"
//             );

//             res.setHeader(
//                 "Content-Disposition",
//                 `attachment; filename=${invoice.invoice_no}.pdf`
//             );

//             doc.pipe(res);

//             /* ===============================
//                COMPANY HEADER
//             =============================== */

//             doc
//             .fontSize(22)
//             .fillColor("#0d6efd")
//             .text("3470 Healthcare", 50, 40);

//             doc
//             .fontSize(10)
//             .fillColor("black")
//             .text("Healthcare & Employee Task Management System");

//             doc.moveDown();

//             doc
//             .fontSize(10)
//             .text("Office Address:");
            
//             doc.text("No.123, Anna Salai");
//             doc.text("Chennai - 600001");
//             doc.text("Tamil Nadu, India");
//             doc.text("Phone: +91 9876543210");
//             doc.text("Email: info@3470healthcare.com");

//             /* ===============================
//                INVOICE TITLE
//             =============================== */

//             doc.moveDown();

//             doc
//             .fontSize(20)
//             .fillColor("#198754")
//             .text("INVOICE", {
//                 align: "center"
//             });

//             doc.moveDown();

//             /* ===============================
//                CUSTOMER DETAILS
//             =============================== */

//             doc
//             .fontSize(12)
//             .fillColor("black");

//             doc.text(
//                 `Invoice No : ${invoice.invoice_no}`
//             );

//             doc.text(
//                 `Invoice Date : ${invoice.invoice_date}`
//             );

//             doc.text(
//                 `Due Date : ${invoice.due_date}`
//             );

//             doc.moveDown();

//             doc.text(
//                 `Student Name : ${invoice.student_name}`
//             );

//             doc.text(
//                 `Course : ${invoice.course}`
//             );

//             doc.moveDown(2);

//             /* ===============================
//                TABLE HEADER
//             =============================== */

//             const tableTop = 260;

//             doc.rect(50, tableTop, 500, 25)
//             .fill("#0d6efd");

//             doc
//             .fillColor("white")
//             .fontSize(11)
//             .text("Description", 60, tableTop + 8)
//             .text("Amount", 450, tableTop + 8);

//             /* ===============================
//                TABLE ROW
//             =============================== */

//             doc
//             .fillColor("black");

//             doc.rect(50, tableTop + 25, 500, 30)
//             .stroke();

//             doc.text(
//                 invoice.course,
//                 60,
//                 tableTop + 35
//             );

//             doc.text(
//                 `₹ ${invoice.course_fee}`,
//                 450,
//                 tableTop + 35
//             );

//             /* ===============================
//                TOTALS
//             =============================== */

//             let startY = tableTop + 90;

//             doc.text(
//                 `Course Fee : ₹ ${invoice.course_fee}`,
//                 350,
//                 startY
//             );

//             doc.text(
//                 `Discount : ₹ ${invoice.discount}`,
//                 350,
//                 startY + 20
//             );

//             doc.text(
//                 `Paid Amount : ₹ ${invoice.paid_amount}`,
//                 350,
//                 startY + 40
//             );

//             doc.text(
//                 `Pending Amount : ₹ ${invoice.pending_amount}`,
//                 350,
//                 startY + 60
//             );

//             /* ===============================
//                STATUS
//             =============================== */

//             const status =
//             Number(invoice.pending_amount) === 0
//             ? "PAID"
//             : "PENDING";

//             doc
//             .fontSize(14)
//             .fillColor(
//                 status === "PAID"
//                 ? "green"
//                 : "red"
//             )
//             .text(
//                 `STATUS : ${status}`,
//                 350,
//                 startY + 100
//             );

//             /* ===============================
//                REMARKS
//             =============================== */

//             doc
//             .fillColor("black")
//             .fontSize(11)
//             .text(
//                 "Remarks:",
//                 50,
//                 startY + 150
//             );

//             doc.text(
//                 invoice.remarks || "N/A",
//                 50,
//                 startY + 170
//             );

//             /* ===============================
//                SIGNATURE
//             =============================== */

//             doc.moveTo(
//                 400,
//                 startY + 250
//             )
//             .lineTo(
//                 550,
//                 startY + 250
//             )
//             .stroke();

//             doc.text(
//                 "Manager Signature",
//                 420,
//                 startY + 260
//             );

//             /* ===============================
//                FOOTER
//             =============================== */

//             doc.fontSize(10);

//             doc.text(
//                 "Thank you for choosing 3470 Healthcare.",
//                 50,
//                 760,
//                 {
//                     align: "center"
//                 }
//             );

//             doc.end();
//         }
//     );
// });


























// app.get("/invoice-pdf/:invoice_no", (req, res) => {

    
//     function formatDate(dateValue){

//     if(!dateValue) return "";

//     const date = new Date(dateValue);

//     const day =
//     String(date.getDate()).padStart(2,"0");

//     const month =
//     String(date.getMonth() + 1).padStart(2,"0");

//     const year =
//     date.getFullYear();

//     return `${day}-${month}-${year}`;
// }






//     const invoiceNo = req.params.invoice_no;

//     db.query(
//         "SELECT * FROM invoices WHERE invoice_no=?",
//         [invoiceNo],
//         (err, result) => {

//             if (err) {
//                 console.log(err);
//                 return res.status(500).send("Database Error");
//             }

//             if (result.length === 0) {
//                 return res.status(404).send("Invoice Not Found");
//             }

//             const invoice =
//             result[0];

//             const doc =
//             new PDFDocument({
//                 margin:40,
//                 size:"A4"
//             });

//             res.setHeader(
//                 "Content-Type",
//                 "application/pdf"
//             );

//             res.setHeader(
//                 "Content-Disposition",
//                 `inline; filename=${invoice.invoice_no}.pdf`
//             );

//             doc.pipe(res);

//             const logoPath =
//             path.join(
//                 __dirname,
//                 "/images",
//                 "Logo3470-health3-removebg-preview.png"
//             );

//             const signPath =
//             path.join(
//                 __dirname,
//                 "/images",
//                 "Receipt.png"
//             );



//             /*=========================
//                 COMPANY HEADER
//             =========================*/

//             doc.image(
//                 logoPath,
//                 40,
//                 20,
//                 { width:120 }
//             );

//             doc
//             .fontSize(24)
//             .fillColor("#00695c")
//             .text(
//                 "3470 Healthcare Pvt Ltd",
//                 170,
//                 35
//             );

//             doc
//             .fontSize(10)
//             .fillColor("black")
//             .text(
//                 "No:3/373, MCN Tower, 1st & 2nd Floor,\nOMR Mettukuppam, Chennai,\nTamil Nadu, India.",
//                 170,
//                 70
//             );

//             doc.text(
//                 "Phone : +91 9876346428",
//                 170,
//                 115
//             );

//             doc.text(
//                 "Email : info@3470healthcare.com",
//                 170,
//                 130
//             );



//             /*=========================
//                 INVOICE TITLE
//             =========================*/

//             doc
//             .fontSize(30)
//             .fillColor("#333")
//             .text(
//                 "INVOICE",
//                 420,
//                 40
//             );

//             doc
//             .fontSize(11)
//             .fillColor("black");

//             doc.text(
//                 `Invoice No : ${invoice.invoice_no}`,
//                 380,
//                 100
//             );

//             doc.text(
//                 `Invoice Date : ${formatDate(invoice.invoice_date)}`,
//                 380,
//                 120
//             );

//             doc.text(
//                 `Due Date : ${formatDate(invoice.due_date)}`,
//                 380,
//                 140
//             );



//             /*=========================
//                 BILL TO
//             =========================*/

//             doc
//             .fontSize(14)
//             .fillColor("#00695c")
//             .text(
//                 "Bill To",
//                 40,
//                 190
//             );

//             doc
//             .fontSize(11)
//             .fillColor("black");

//             doc.text(
//                 invoice.student_name,
//                 40,
//                 220
//             );

//             doc.text(
//                 invoice.remarks || "",
//                 40,
//                 240
//             );



//             /*=========================
//                 STATUS BOX
//             =========================*/

//             const status =
//             Number(invoice.pending_amount) <= 0
//             ? "PAID"
//             : "PENDING";

//             doc
//             .rect(
//                 420,
//                 200,
//                 120,
//                 40
//             )
//             .stroke();

//             doc
//             .fontSize(16)
//             .fillColor(
//                 status === "PAID"
//                 ? "green"
//                 : "red"
//             )
//             .text(
//                 status,
//                 450,
//                 212
//             );

//             doc.fillColor("black");



//             /*=========================
//                 TABLE HEADER
//             =========================*/

//             doc
//             .rect(
//                 40,
//                 290,
//                 520,
//                 25
//             )
//             .fill("#e5e5e5");

//             doc
//             .fillColor("black")
//             .fontSize(11);

//             doc.text(
//                 "Course",
//                 50,
//                 298
//             );

//             doc.text(
//                 "Qty",
//                 250,
//                 298
//             );

//             doc.text(
//                 "Fee",
//                 450,
//                 298
//             );



//             /*=========================
//                 TABLE ROW
//             =========================*/

//             doc
//             .rect(
//                 40,
//                 315,
//                 520,
//                 40
//             )
//             .stroke();

//             doc.text(
//                 invoice.course,
//                 50,
//                 330
//             );

//             doc.text(
//                 "1",
//                 255,
//                 330
//             );

//             doc.text(
//                 `₹${invoice.course_fee}`,
//                 440,
//                 330
//             );



//             /*=========================
//                 SUMMARY
//             =========================*/

//             doc
//             .fontSize(11);

//             doc.text(
//                 `Total : ₹${invoice.course_fee}`,
//                 350,
//                 420
//             );

//             doc.text(
//                 `Discount : ₹${invoice.discount}`,
//                 350,
//                 440
//             );

//             doc.text(
//                 `Amount Paid : ₹${invoice.paid_amount}`,
//                 350,
//                 460
//             );

//             doc.text(
//                 `Pending Amount : ₹${invoice.pending_amount}`,
//                 350,
//                 480
//             );

//             doc.text(
//                 `Payment Mode : ${invoice.payment_mode}`,
//                 350,
//                 510
//             );



//             /*=========================
//                 REMARKS
//             =========================*/

//             doc
//             .fontSize(12)
//             .fillColor("#00695c")
//             .text(
//                 "Remarks",
//                 40,
//                 560
//             );

//             doc
//             .fontSize(10)
//             .fillColor("black")
//             .text(
//                 invoice.remarks || "No Remarks",
//                 40,
//                 585
//             );



//             /*=========================
//                 SIGNATURE
//             =========================*/

//             doc.image(
//                 signPath,
//                 400,
//                 560,
//                 {
//                     width:120
//                 }
//             );

//             doc.text(
//                 "Manager Signature",
//                 395,
//                 650
//             );



//             /*=========================
//                 FOOTER
//             =========================*/

//             doc
//             .fontSize(12)
//             .fillColor("#00695c")
//             .text(
//                 "Thank you for choosing 3470 Healthcare",
//                 140,
//                 760
//             );

//             doc.end();

//         }
//     );

// });










app.get("/invoice-pdf/:invoice_no", (req, res) => {


function formatDate(dateValue){

    if(!dateValue) return "";

    const date = new Date(dateValue);

    const day = String(date.getDate()).padStart(2,"0");
    const month = String(date.getMonth() + 1).padStart(2,"0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

const invoiceNo = req.params.invoice_no;

db.query(
    "SELECT * FROM invoices WHERE invoice_no=?",
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

        const doc = new PDFDocument({
            size:"A4",
            margin:40
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename=${invoice.invoice_no}.pdf`
        );

        doc.pipe(res);

        const logoPath = path.join(
            __dirname,
            "image",
            "Logo3470-health3-removebg-preview.png"
        );

        const signPath = path.join(
            __dirname,
            "image",
            "Receipt.png"
        );

        /*====================================
                COMPANY HEADER
        ====================================*/

        try{

            if(fs.existsSync(logoPath)){

                doc.image(
                    logoPath,
                    40,
                    20,
                    {
                        width:90
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
        .fontSize(22)
        .fillColor("#00695c")
        .text(
            "3470 Healthcare Pvt Ltd",
            150,
            30
        );

        doc
        .fontSize(10)
        .fillColor("black")
        .text(
            "No:3/373, MCN Tower, 1st & 2nd Floor",
            150,
            65
        );

        doc.text(
            "OMR Mettukuppam, Chennai",
            150,
            80
        );

        doc.text(
            "Tamil Nadu, India",
            150,
            95
        );

        doc.text(
            "Phone : +91 9876543210",
            150,
            110
        );

        doc.text(
            "Email : info@3470healthcare.com",
            150,
            125
        );

        doc.moveTo(40,155)
        .lineTo(555,155)
        .stroke();

        /*====================================
                INVOICE TITLE
        ====================================*/

        doc
        .fontSize(26)
        .fillColor("#333")
        .text(
            "INVOICE",
            420,
            40
        );

        doc
        .fontSize(11)
        .fillColor("black");

        doc.text(
            `Invoice No : ${invoice.invoice_no}`,
            380,
            90
        );

        doc.text(
            `Invoice Date : ${formatDate(invoice.invoice_date)}`,
            380,
            110
        );

        doc.text(
            `Due Date : ${formatDate(invoice.due_date)}`,
            380,
            130
        );

        /*====================================
                BILL TO
        ====================================*/

        doc
        .fontSize(14)
        .fillColor("#00695c")
        .text(
            "Bill To",
            40,
            180
        );

        doc
        .fontSize(11)
        .fillColor("black");

        doc.text(
            invoice.student_name,
            40,
            205
        );

        doc.text(
            "Student",
            40,
            220
        );

        /*====================================
                STATUS BOX
        ====================================*/

        const status =
        Number(invoice.pending_amount) <= 0
        ? "PAID"
        : "PENDING";

        doc
        .roundedRect(
            420,
            180,
            120,
            40,
            5
        )
        .stroke();

        doc
        .fontSize(16)
        .fillColor(
            status === "PAID"
            ? "green"
            : "red"
        )
        .text(
            status,
            450,
            193
        );

        doc.fillColor("black");

        /*====================================
                COURSE TABLE
        ====================================*/

        doc
        .rect(
            40,
            270,
            515,
            25
        )
        .fill("#d9edf7");

        doc
        .fillColor("black")
        .fontSize(11);

        doc.text(
            "Course Name",
            50,
            278
        );

        doc.text(
            "Qty",
            300,
            278
        );

        doc.text(
            "Course Fee",
            430,
            278
        );

        doc
        .rect(
            40,
            295,
            515,
            40
        )
        .stroke();

        doc.text(
            invoice.course,
            50,
            310
        );

        doc.text(
            "1",
            305,
            310
        );

        doc.text(
            `₹ ${invoice.course_fee}`,
            430,
            310
        );






        
    /* ====================================
                TOTAL SECTION
    ==================================== */

        doc.fontSize(11);

        doc.text(`Total Amount : ₹ ${invoice.course_fee}`,
            400,
            390
        );

        doc.text(`Discount : ₹ ${invoice.discount}`,
            400,
            415
        );

        doc.text(`Amount Paid : ₹ ${invoice.paid_amount}`,
            400,
            440
        );

        doc.text(`Pending Amount : ₹ ${invoice.pending_amount}`,
            400,
            465
        );

        doc.text(`Payment Mode : ${invoice.payment_mode}`,
            400,
            490
        );

    /* ====================================
                REMARKS
    ==================================== */

        doc.fontSize(13).fillColor("#00695c").text("Remarks",
            40,
            390
        );

        doc.fontSize(10).fillColor("black").text(invoice.remarks || "No Remarks",
            40,
            415,
            {
                width:220
            }
        );









        /*====================================
                SIGNATURE
        ====================================*/

        try{

            if(fs.existsSync(signPath)){

                doc.image(
                    signPath,
                    390,
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

        doc
        .fontSize(10)
        .text(
            "Authorized Signature",
            395,
            650
        );

        /*====================================
                FOOTER
        ====================================*/

        doc.moveTo(40,730)
        .lineTo(555,730)
        .stroke();

        doc
        .fontSize(12)
        .fillColor("#00695c")
        .text(
            "Thank you for choosing 3470 Healthcare",
            140,
            750
        );

        doc.end();
    }
);


});





/*--------------------------
          Start server
  --------------------------*/

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});