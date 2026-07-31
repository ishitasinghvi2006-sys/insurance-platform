const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);

// RECORD a payment for a policy
router.post("/policies/:policyId/payments", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const { amount, paymentStatus } = req.body;
    const policyId = Number(req.params.policyId);

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }

    const payment = await prisma.premiumPayment.create({
      data: {
        policyId,
        amount: Number(amount),
        paymentStatus: paymentStatus || "paid",
      },
    });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST payment history for a policy
router.get("/policies/:policyId/payments", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const policyId = Number(req.params.policyId);

    const payments = await prisma.premiumPayment.findMany({
      where: { policyId },
      orderBy: { paymentDate: "desc" },
    });

    res.json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST all overdue/pending payments (across all policies) - for dashboard/admin use
router.get("/overdue", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const overduePayments = await prisma.premiumPayment.findMany({
      where: { paymentStatus: { in: ["pending", "overdue"] } },
      include: {
        policy: {
          include: { customer: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { paymentDate: "asc" },
    });

    res.json({ success: true, overduePayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE payment status (e.g., mark pending -> paid)
router.put("/payments/:id", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const payment = await prisma.premiumPayment.update({
      where: { id: Number(req.params.id) },
      data: { paymentStatus },
    });

    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;