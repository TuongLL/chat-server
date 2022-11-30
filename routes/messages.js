const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  addMessage,
  getMessages,
  addFile,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/addfile/", upload.single("file"), addFile);

module.exports = router;
