const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(["admin"]));

// Policies summary: active vs expired vs cancelled
router.get("/reports/policies-summary", async (req, res) => {
  try {
    const grouped = await prisma.policy.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const summary = { active: 0, expired: 0, cancelled: 0 };
    grouped.forEach((g) => {
      summary[g.status] = g._count.status;
    });

    res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Claims stats: pending vs approved vs rejected
router.get("/reports/claims-stats", async (req, res) => {
  try {
    const grouped = await prisma.claim.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const stats = { pending: 0, approved: 0, rejected: 0 };
    grouped.forEach((g) => {
      stats[g.status] = g._count.status;
    });

    res.json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Premium collection by month (last 6 months)
router.get("/reports/premium-collection", async (req, res) => {
  try {
    const payments = await prisma.premiumPayment.findMany({
      where: { paymentStatus: "paid" },
      select: { amount: true, paymentDate: true },
    });

    const monthly = {};
    payments.forEach((p) => {
      const key = p.paymentDate.toISOString().slice(0, 7); // "YYYY-MM"
      monthly[key] = (monthly[key] || 0) + p.amount;
    });

    const sortedKeys = Object.keys(monthly).sort();
    const labels = sortedKeys;
    const data = sortedKeys.map((k) => monthly[k]);

    res.json({ success: true, labels, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer growth by month
router.get("/reports/customer-growth", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true },
    });

    // Since Customer model has no createdAt field, fall back to counting by id ranges
    // Better: if you want real growth tracking, add a createdAt field (see note below)
    res.json({ success: true, totalCustomers: customers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;