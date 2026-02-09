const User = require('../models/User');

exports.register = async (req, res) => {
  // placeholder
  res.json({ ok: true, message: 'register endpoint' });
};

exports.login = async (req, res) => {
  res.json({ ok: true, message: 'login endpoint' });
};
