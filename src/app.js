import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import eventsRoutes from "./routes/events.routes.js";
import joinsRoutes from "./routes/joins.routes.js";

const app = express();

app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:3000").split(",") }));
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "HelpHive API is running...." });
});


app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/events", eventsRoutes);
app.use("/api/joins", joinsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
