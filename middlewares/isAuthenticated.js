const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: token }).select("account");
    console.log(user); // { account: { username: 'JohnDoe' }, _id: new ObjectId('664dafd097ee5fca74b60d52') }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.log(error);
  }
};
module.exports = isAuthenticated;
