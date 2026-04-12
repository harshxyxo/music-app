import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@groovra/database';
import { ENV } from '../config/env';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validate request body
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for existing users to prevent conflicts
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already in use' });
    }

    // Robust password hashing via Bcrypt salt algorithms
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save to PostgreSQL via Prisma
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: passwordHash,
      },
    });

    // Provide initial JSON Web Token mapped to standard 7 days
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Strip out the passwordHash manually before responding
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare supplied flat text mapped securely against persisted hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};
