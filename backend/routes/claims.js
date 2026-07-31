const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);

// SUBMIT a claim for a policy (customer-facing, but agents/admins can also file on behalf of a customer)
router.post("/policies/:policyId/claims", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const policyId = Number(req.params.policyId);
    const { claimAmount, reason } = req.body;

    if (!claimAmount || !reason) {
      return res.status(400).json({ success: false, message: "Claim amount and reason are required" });
    }

    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }

    if (policy.status !== "active") {
      return res.status(400).json({ success: false, message: "Cannot file a claim on a non-active policy" });
    }

    const claim = await prisma.claim.create({
      data: {
        policyId,
        claimAmount: Number(claimAmount),
        reason,
        status: "pending",
      },
    });

    res.status(201).json({ success: true, claim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST all claims (agent/admin view, filterable by status)
router.get("/claims", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status ? { status } : {};

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { submissionDate: "desc" },
        include: {
          policy: {
            include: { customer: { select: { id: true, name: true, email: true } } },
          },
        },
      }),
      prisma.claim.count({ where }),
    ]);

    res.json({
      success: true,
      claims,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET single claim detail
router.get("/claims/:id", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        policy: {
          include: { customer: true },
        },
      },
    });

    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }

    res.json({ success: true, claim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// APPROVE or REJECT a claim (agent/admin only)
router.put("/claims/:id/status", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }

    const claim = await prisma.claim.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json({ success: true, claim });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST claims for a specific policy (used on PolicyDetails page)
router.get("/policies/:policyId/claims", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { policyId: Number(req.params.policyId) },
      orderBy: { submissionDate: "desc" },
    });

    res.json({ success: true, claims });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;