const bcrypt = require('bcrypt');

module.exports = {
  hash: async (plain) => await bcrypt.hash(plain, 10),
  compare: async (plain, hash) => await bcrypt.compare(plain, hash)
};
