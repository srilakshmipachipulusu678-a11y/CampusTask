
const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead
} = require("../controllers/notificationController");

router.get("/:userId/:role", getNotifications);
router.put("/:id/read/:userId/:role", markAsRead);

module.exports = router;
