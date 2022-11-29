const router = require("express").Router();
const { updateStatus }  = require('../controllers/userController')

router.post("/update-status", updateStatus);

module.exports = router;