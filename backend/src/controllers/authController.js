const { asyncHandler } = require("../utils/errors");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
  });
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password,
  });
  res.json({ success: true, data: result });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    },
  });
});

module.exports = { register, login, me };
