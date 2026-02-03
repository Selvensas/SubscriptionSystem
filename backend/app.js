import express from "express"
import cors from "cors"  // ADD THIS
import { PORT } from "./config/env.js"
import authRouter from "./routes/auth.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import userRouter from "./routes/user.routes.js"
import workflowRouter from "./routes/workflow.routes.js"
import connectToDatabase from "./database/mongodb.js"
import errorMiddleware from "./middlewares/error.middlewar.js"
import cookieParser from "cookie-parser"
import arcjetMiddleware from "./middlewares/arcjet.middleware.js"
import path from "path"
import { fileURLToPath } from 'url';
const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS - Allow React frontend to connect
//asd
if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
    credentials: true  // Important for cookies/auth
  }))
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(arcjetMiddleware)

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)

// Serve static files from the frontend/dist folder
app.use(express.static(path.join(__dirname, "../frontend/dist")))

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    // If the request is for an API route that doesn't exist, don't serve index.html
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"))
  })
}

app.use(errorMiddleware)

app.get('/', (req, res) => {
  res.send('Welcome to the Subscription Tracker API!');
});

app.listen(PORT, async () => {
  console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app