const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const validate = require("../middleware/validate");
const { createPolicySchema, updatePolicySchema } = require("../validators/policyValidator");

const router = express.Router();

router.use(authMiddleware);

// Helper: generate a simple unique policy number
function generatePolicyNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `POL-${timestamp}-${random}`;
}

// CREATE policy (admin or agent only)
router.post("/", requireRole(["admin", "agent"]), validate(createPolicySchema), async (req, res, next) => {
  try {
    const { customerId, policyType, premiumAmount, startDate, termMonths } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + termMonths);

    const policy = await prisma.policy.create({
      data: {
        customerId,
        policyType,
        policyNumber: generatePolicyNumber(),
        premiumAmount,
        startDate: start,
        endDate: end,
        status: "active",
      },
    });

    res.status(201).json({ success: true, policy });
  } catch (err) {
    next(err);
  }
});

// LIST policies (filter by status, search by policy number, pagination)
router.get("/", requireRole(["admin", "agent"]), async (req, res, next) => {
  try {
    const { status, search = "", page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { status }),
      ...(search && { policyNumber: { contains: search, mode: "insensitive" } }),
    };

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { id: "desc" },
        include: { customer: { select: { id: true, name: true, email: true } } },
      }),
      prisma.policy.count({ where }),
    ]);

    res.json({
      success: true,
      policies,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET single policy (with claims + payments)
router.get("/:id", requireRole(["admin", "agent", "customer"]), async (req, res, next) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, claims: true, payments: true },
    });

    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }

    // Customers can only view their own policy
    if (req.user.role === "customer" && policy.customer.email !== req.user.email) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, policy });
  } catch (err) {
    next(err);
  }
});

// UPDATE / RENEW policy
router.put("/:id", requireRole(["admin", "agent"]), validate(updatePolicySchema), async (req, res, next) => {
  try {
    const { policyType, premiumAmount, endDate, status } = req.body;

    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(policyType && { policyType }),
        ...(premiumAmount && { premiumAmount }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
    });

    res.json({ success: true, policy });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }
    next(err);
  }
});

// CANCEL policy (status change, not deletion)
router.put("/:id/cancel", requireRole(["admin", "agent"]), async (req, res, next) => {
  try {
    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: { status: "cancelled" },
    });

    res.json({ success: true, message: "Policy cancelled", policy });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }
    next(err);
  }
});

module.exports = router;