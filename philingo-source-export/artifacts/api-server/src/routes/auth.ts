import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { sign } from '../lib/jwt.js';
import { requireAuth } from '../middlewares/auth.js';
import { adminUsersTable } from '@workspace/db';

const router = Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
      return;
    }

    const [user] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
      return;
    }

    // Update last login
    await db
      .update(adminUsersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsersTable.id, user.id));

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = sign(payload, '24h');

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// POST /auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token');
  res.json({ ok: true });
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: adminUsersTable.id,
        email: adminUsersTable.email,
        name: adminUsersTable.name,
        role: adminUsersTable.role,
        isActive: adminUsersTable.isActive,
        lastLoginAt: adminUsersTable.lastLoginAt,
        createdAt: adminUsersTable.createdAt,
      })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, req.user!.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// POST /auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Bad Request', message: 'oldPassword and newPassword are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Bad Request', message: 'New password must be at least 8 characters' });
      return;
    }

    const [user] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, req.user!.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Unauthorized', message: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(adminUsersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(adminUsersTable.id, user.id));

    res.json({ ok: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
