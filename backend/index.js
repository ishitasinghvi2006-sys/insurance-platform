require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const policyRoutes = require("./routes/policies");
const paymentRoutes = require("./routes/payments");
const claimRoutes = require("./routes/claims");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Insurance Management Platform API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api", paymentRoutes);
app.use("/api", claimRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});