import jwt from "jsonwebtoken";

const generateAndSetToken = (res, userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
  }

  let token;
  try {
    token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  } catch (error) {
    console.error(`Token generation error: ${error.message}`);
    throw new Error("Token generation failed");
  }

  // Set JWT as an HTTP-Only Cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
  });

  return token;
};

export default generateAndSetToken;
