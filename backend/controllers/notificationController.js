
const db = require("../db");

const getNotifications = (req, res) => {
  const userId = req.params.userId;
  const userRole = req.params.role;

  const sql = `
    SELECT id, title, message, notification_type,
           related_id, is_read, created_at
    FROM notifications
    WHERE recipient_id = ?
      AND recipient_role = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId, userRole], (err, results) => {
    if (err) {
      console.error("Notifications fetch error:", err);
      return res.status(500).json({
        message: "Failed to fetch notifications"
      });
    }

    res.json(results);
  });
};

const markAsRead = (req, res) => {
  const notificationId = req.params.id;
  const userId = req.params.userId;
  const userRole = req.params.role;

  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
      AND recipient_id = ?
      AND recipient_role = ?
  `;

  db.query(
    sql,
    [notificationId, userId, userRole],
    (err, result) => {
      if (err) {
        console.error("Mark notification read error:", err);
        return res.status(500).json({
          message: "Failed to update notification"
        });
      }

      res.json({
        success: true,
        message: "Notification marked as read"
      });
    }
  );
};

module.exports = {
  getNotifications,
  markAsRead
};
