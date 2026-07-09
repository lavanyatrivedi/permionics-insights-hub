import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { checkPassword } from "../lib/auth";

const router: IRouter = Router();

router.post("/settings/change-password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Both current and new passwords are required" });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }

  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  if (!checkPassword(currentPassword, adminPassword)) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  // In this architecture, ADMIN_PASSWORD is an env var / secret.
  // Changing it at runtime only affects the current process.
  // The new password should be updated in Replit Secrets for persistence.
  // We update the in-process env var so the change works for the session.
  process.env["ADMIN_PASSWORD"] = newPassword;

  req.log.info("Admin password changed");
  res.json({
    authenticated: true,
    message: "Password updated for this session. Update ADMIN_PASSWORD in Replit Secrets to persist across restarts.",
  });
});

export default router;
