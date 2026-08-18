import { connectDb } from "@/lib/db";
import { hasFirebaseMessaging, hasMongo } from "@/lib/env";
import { AdminPushTokenModel } from "@/models";
import { firebaseAdmin, publicOrigin } from "@/lib/firebase-admin";

export type AdminPush = {
  title: string;
  body: string;
  url?: string;
};

function absoluteUrl(path: string) {
  const origin = publicOrigin();
  const next = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${next}` : next;
}

export async function saveAdminPushToken(token: string, userAgent = "") {
  if (!hasMongo()) throw new Error("MongoDB is not configured.");
  const value = token.trim();
  if (value.length < 20) throw new Error("Invalid push token.");
  await connectDb();
  await AdminPushTokenModel.findOneAndUpdate(
    { token: value },
    { token: value, userAgent: userAgent.slice(0, 300) },
    { upsert: true },
  );
}

export async function deleteAdminPushToken(token: string) {
  if (!hasMongo()) return;
  await connectDb();
  await AdminPushTokenModel.deleteOne({ token: token.trim() });
}

export async function sendAdminPush(payload: AdminPush): Promise<{ sent: number }> {
  if (!hasFirebaseMessaging() || !hasMongo()) return { sent: 0 };
  await connectDb();
  const docs = await AdminPushTokenModel.find().select("token").lean();
  const tokens = [...new Set(docs.map((item) => String(item.token || "").trim()).filter(Boolean))];
  if (!tokens.length) return { sent: 0 };

  const link = absoluteUrl(payload.url || "/admin");
  const origin = publicOrigin();
  const icon = origin ? `${origin}/logo-at.png` : "/logo-at.png";
  const messaging = firebaseAdmin();
  const result = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title.slice(0, 80),
      body: payload.body.slice(0, 180),
    },
    data: { url: payload.url || "/admin" },
    webpush: {
      fcmOptions: { link },
      notification: { icon },
    },
  });

  const stale: string[] = [];
  result.responses.forEach((item, index) => {
    const code = item.error?.code ?? "";
    if (
      code.includes("registration-token-not-registered") ||
      code.includes("invalid-registration-token") ||
      code.includes("invalid-argument")
    ) {
      stale.push(tokens[index] ?? "");
    }
  });
  if (stale.length) {
    await AdminPushTokenModel.deleteMany({ token: { $in: stale.filter(Boolean) } });
  }
  return { sent: result.successCount };
}
