const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

// All customer routes require login
router.use(authMiddleware);

// CREATE customer (admin or agent only)
router.post("/", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const { name, dob, phone, address, email } = req.body;

    if (!name || !dob || !phone || !address || !email) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Customer with this email already exists" });
    }

    const customer = await prisma.customer.create({
      data: { name, dob: new Date(dob), phone, address, email },
    });

    res.status(201).json({ success: true, customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST customers (with search + pagination)
router.get("/", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: Number(limit), orderBy: { id: "desc" } }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      customers,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET single customer profile (with policies + documents)
router.get("/:id", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: { policies: true, documents: true },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE customer
router.put("/:id", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const { name, dob, phone, address, email } = req.body;

    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(dob && { dob: new Date(dob) }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(email && { email }),
      },
    });

    res.json({ success: true, customer });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE customer
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;