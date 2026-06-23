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
        .fillColor("#333")
        .text("INVOICE", 430, 40);

        doc
        .fontSize(11)
        .fillColor("black");

        doc.font("Helvetica-Bold");
        doc.text("Invoice No", 370, 95);
        doc.text("Invoice Date", 370, 115);
        doc.text("Due Date", 370, 135);

        doc.font("Helvetica");
        doc.text(":", 440, 95);
        doc.text(":", 440, 115);
        doc.text(":", 440, 135);

        doc.text(invoice.invoice_no, 450, 95);
        doc.text(formatDate(invoice.invoice_date), 450, 115);
        doc.text(formatDate(invoice.due_date), 450, 135);

    /* ====================================
                BILL TO
    ==================================== */

        console.log(invoice);

        doc
        .fontSize(14)
        .fillColor("#00695c")
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

        // doc
        // .rect(
        //     40,
        //     270,
        //     515,
        //     25
        // )
        // .fill("#d9edf7");

        // doc
        // .fillColor("black")
        // .fontSize(11);

        // doc.text(
        //     "Course Name",
        //     50,
        //     278
        // );

        // doc.text(
        //     "Qty",
        //     300,
        //     278
        // );

        // doc.text(
        //     "Course Fee",
        //     430,
        //     278
        // );

        // doc
        // .rect(
        //     40,
        //     295,
        //     515,
        //     40
        // )
        // .stroke();

        // doc.text(
        //     invoice.course,
        //     50,
        //     310
        // );

        // doc.text(
        //     "1",
        //     305,
        //     310
        // );

        // doc.text(
        //     `₹ ${invoice.course_fee}`,
        //     430,
        //     310
        // );






        
    /* ====================================
                TOTAL SECTION
    ==================================== */

        // doc.fontSize(11);

        // doc.text(`Total Amount : ₹ ${invoice.course_fee}`,
        //     400,
        //     390
        // );

        // doc.text(`Discount : ₹ ${invoice.discount}`,
        //     400,
        //     415
        // );

        // doc.text(`Amount Paid : ₹ ${invoice.paid_amount}`,
        //     400,
        //     440
        // );

        // doc.text(`Pending Amount : ₹ ${invoice.pending_amount}`,
        //     400,
        //     465
        // );

        // doc.text(`Payment Mode : ${invoice.payment_mode}`,
        //     400,
        //     490
        // );

    /* ====================================
                REMARKS
    ==================================== */

        // doc.fontSize(13).fillColor("#00695c").text("Remarks",
        //     40,
        //     390
        // );

        // doc.fontSize(10).fillColor("black").text(invoice.remarks || "No Remarks",
        //     40,
        //     415,
        //     {
        //         width:220
        //     }
        // );









        /*====================================
                SIGNATURE
        ====================================*/

        // try{

        //     if(fs.existsSync(signPath)){

        //         doc.image(
        //             signPath,
        //             390,
        //             560,
        //             {
        //                 width:120
        //             }
        //         );

        //     }

        // }catch(error){

        //     console.log(
        //         "Signature Error:",
        //         error.message
        //     );

        // }

        // doc
        // .fontSize(10)
        // .text(
        //     "Authorized Signature",
        //     395,
        //     650
        // );

        /*====================================
                FOOTER
        ====================================*/

        // doc.moveTo(40,730)
        // .lineTo(555,730)
        // .stroke();

        // doc
        // .fontSize(12)
        // .fillColor("#00695c")
        // .text(
        //     "Thank you for choosing 3470 Healthcare Pvt Ltd",
        //     140,
        //     750
        // );

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