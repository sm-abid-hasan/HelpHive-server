import { createRemoteJWKSet, jwtVerify } from "jose";


let jwks = null;

function getJwks() {
  if (!jwks) {
    const url = process.env.JWKS_URL || `${process.env.CLIENT_URL}/api/auth/jwks`;
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}


export async function verifyJWT(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: please log in first.." });
  }

  const token = header.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: process.env.CLIENT_URL,
      audience: process.env.CLIENT_URL,
    });

    if (!payload.email) {
      return res.status(401).json({ message: "Unauthorized: invalid token.." });
    }

   
    req.user = {
      id: payload.id || payload.sub,
      email: payload.email,
      name: payload.name || "",
      image: payload.image || "",
    };
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res.status(401).json({ message: "Unauthorized: your session expired. Please log in again." });
  }
}
