import express from "express";
import Cors from "cors";
import dotenv from "dotenv";
import db from "./models/index.js";
import routes from "./routes/route.js";
import path from "path";
dotenv.config();
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const sequelize = db.sequelize;

const PORT = process.env.PORT || 9090;
const env = process.env.NODE_ENV || "development";

app.use(Cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/health", (req, res) => {
  return res.status(200).json({
    success: true,
  });
});

app.use("/api", routes);

(async () => {
  try {
    // Test the database connection
     db.sequelize
      .sync()
      .then(() => {
        console.log("Database synced successfully");
      })
      .catch((err) => {
        console.error("Database sync failed:", err);
      });
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync();
   

    // Start the server
    app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT} in ${env} mode`
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
