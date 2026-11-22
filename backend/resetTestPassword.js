
const bcrypt = require("bcrypt");
const db = require("./db");

async function resetPassword() {
  const email = "test.student@example.com";
  const newPassword = "Test@12345";

  const hash = await bcrypt.hash(newPassword, 10);

  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hash, email],
    (err, result) => {
      if (err) {
        console.error("Password reset failed:", err.message);
      } else {
        console.log("Password reset successful!");
        console.log("Email:", email);
        console.log("Password:", newPassword);
      }

      db.end();
    }
  );
}

resetPassword();
