const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const protection = require("./protection");

const router = express.Router();
const dataFile = path.join(__dirname, "../data/students.json");

// Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });


const getStudents = () => {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]");
  return JSON.parse(fs.readFileSync(dataFile));
};


const saveStudents = (students) => {
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
};

//Get all students
router.get("/", protection, (req, res) => {
  const students = getStudents();
  res.json(students);
});

//Add student
router.post("/", protection, upload.single("Image"), (req, res) => {
  const { StudentName, Mobile, City } = req.body;
  const Image = req.file ? `/uploads/${req.file.filename}` : "";

  const students = getStudents();
  const newStudent = {
    id: Date.now().toString(),
    StudentName,
    Mobile,
    City,
    Image,
  };

  students.push(newStudent);
  saveStudents(students);
  res.status(201).json(newStudent);
});

//update
router.put("/:id", protection, upload.single("Image"), (req, res) => {
  const { id } = req.params;
  const { StudentName, Mobile, City } = req.body;

  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Student not found" });

  const existingStudent = students[index];

  // Delete 
  if (req.file) {
    if (existingStudent.Image) {
      const oldImagePath = path.join(__dirname, "..", existingStudent.Image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }
    existingStudent.Image = `/uploads/${req.file.filename}`;
  }

  existingStudent.StudentName = StudentName;
  existingStudent.Mobile = Mobile;
  existingStudent.City = City;

  students[index] = existingStudent;
  saveStudents(students);
  res.json(existingStudent);
});

//Delete student
router.delete("/:id", protection, (req, res) => {
  const { id } = req.params;
  let students = getStudents();
  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  //Delete image
  if (student.Image) {
    const imagePath = path.join(__dirname, "..", student.Image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  students = students.filter((s) => s.id !== id);
  saveStudents(students);
  res.json({ message: "Student deleted" });
});

module.exports = router;
