const { z } = require("zod");

const createCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is too short"),
  email: z.string().email("Invalid email address"),
});

const updateCustomerSchema = createCustomerSchema.partial();

module.exports = { createCustomerSchema, updateCustomerSchema };