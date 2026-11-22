
const bcrypt = require("bcryptjs");
const db = require("./db");

async function resetPassword() {
    const password = "Faculty@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "UPDATE users SET password = ? WHERE email = ? AND role = 'faculty'",
        [hashedPassword, "sreenivasulu@gmail.com"],
        (err, result) => {
            if (err) {
                console.log(err);
            } else if (result.affectedRows === 1) {
                console.log("Faculty password updated successfully!");
            } else {
                console.log("Faculty account not found!");
            }

            process.exit();
        }
    );
}

resetPassword();
