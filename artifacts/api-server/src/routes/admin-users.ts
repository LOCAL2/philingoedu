import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { adminUsersTable } from '@workspace/db';

const router = Router();

// All routes require auth
router.use(requireAuth);

// GET / - list all admin users (superadmin only)
router.get('/', requireRole('superadmin'), async (_req, res) => {
  try {
    const users = await db
      .select({
        id: adminUsersTable.id,
        email: adminUsersTable.email,
        name: adminUsersTable.name,
        role: adminUsersTable.role,
        isActive: adminUsersTable.isActive,
        lastLoginAt: adminUsersTable.lastLoginAt,
        createdAt: adminUsersTable.createdAt,
        updatedAt: adminUsersTable.updatedAt,
      })
      .from(adminUsersTable)
      .orderBy(adminUsersTable.createdAt);

    res.json({ data: users, total: users.length });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// POST / - create admin user
router.post('/', requireRole('superadmin'), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Bad Request', message: 'email, password, and name are required' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [created] = await db
      .insert(adminUsersTable)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        name,
        role: role || 'editor',
      })
      .returning({
        id: adminUsersTable.id,
        email: adminUsersTable.email,
        name: adminUsersTable.name,
        role: adminUsersTable.role,
        isActive: adminUsersTable.isActive,
        createdAt: adminUsersTable.createdAt,
      });

    res.status(201).json(created);
  } catch (err: unknown) {
    const errMsg = String(err);
    if (errMsg.includes('unique') || errMsg.includes('duplicate')) {
      res.status(409).json({ error: 'Conflict', message: 'Email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal Server Error', message: errMsg });
  }
});

// POST /me/change-password — change own password (any authenticated admin)
router.post('/me/change-password', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'กรุณาระบุรหัสผ่านปัจจุบันและรหัสผ่านใหม่' }); return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' }); return;
    }

    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: 'ไม่พบผู้ใช้' }); return; }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) { res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }); return; }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(adminUsersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(adminUsersTable.id, userId));

    res.json({ ok: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /:id - update user
router.patch('/:id', requireRole('superadmin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, role, isActive } = req.body;

    const updates: Partial<{ name: string; role: 'superadmin' | 'admin' | 'editor'; isActive: boolean; updatedAt: Date }> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(adminUsersTable)
      .set(updates)
      .where(eq(adminUsersTable.id, id))
      .returning({
        id: adminUsersTable.id,
        email: adminUsersTable.email,
        name: adminUsersTable.name,
        role: adminUsersTable.role,
        isActive: adminUsersTable.isActive,
        updatedAt: adminUsersTable.updatedAt,
      });

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'User not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// DELETE /:id - soft delete (set isActive=false)
router.delete('/:id', requireRole('superadmin'), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [updated] = await db
      .update(adminUsersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adminUsersTable.id, id))
      .returning({ id: adminUsersTable.id });

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'User not found' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
