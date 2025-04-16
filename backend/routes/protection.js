//only works for the token generated by the dayanada-sagar-college-of-engineering app
module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (
    authHeader &&
    authHeader.split(" ")[1]?.includes("dayanada-sagar-college-of-engineering")
  ) {
    next();
  } else {
    res.status(401).json({ message: "Invalid Token" });
  }
};
