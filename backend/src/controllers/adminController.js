const { asyncHandler } = require("../utils/errors");
const adminService = require("../services/adminService");

const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  res.json({ success: true, data: users });
});

const promoteUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(req.user.id, req.params.id, req.body.role);
  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

module.exports = { listUsers, promoteUser };
