import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const authRouter = express.Router();

export const inMemoryUsers = new Map<string, any>();

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  let user = inMemoryUsers.get(email.toLowerCase());

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    const namePart = email.split('@')[0] || 'Operator';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      id: "user_" + Date.now(),
      email: email.toLowerCase(),
      name: formattedName,
      passwordHash
    };
    inMemoryUsers.set(email.toLowerCase(), user);
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    return res.status(401).json({
      authenticated: false,
      message: "Invalid email or password",
    });
  }

  const sessionToken = crypto.randomBytes(32).toString("hex");

  return res.status(200).json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token: sessionToken,
  });
});
