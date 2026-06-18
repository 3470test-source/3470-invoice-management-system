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



/*--------------------------
          Start server
  --------------------------*/

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});