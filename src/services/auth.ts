export type TruveAuthRole = "user" | "operator";

export type TruveAuthSession = {
  provider: "google";
  role: TruveAuthRole;
  email: string;
  name: string;
  picture?: string;
  sub?: string;
  issuedAt: string;
  demo?: boolean;
};

const STORAGE_KEY = "truve_google_auth_session_v1";
const FALLBACK_OPERATOR_EMAILS = ["admin@truve.foundation", "operator@truve.foundation"];

export function getConfiguredOperatorEmails(): string[] {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env;
  const configured = env?.VITE_OPERATOR_EMAILS ?? env?.VITE_ADMIN_EMAILS ?? "";
  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRoleForEmail(email: string): TruveAuthRole {
  const normalized = email.trim().toLowerCase();
  const operatorEmails = [...FALLBACK_OPERATOR_EMAILS, ...getConfiguredOperatorEmails()];
  return operatorEmails.includes(normalized) ? "operator" : "user";
}

export function getAuthSession(): TruveAuthSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<TruveAuthSession>;
    if (!session.email || !session.name) return null;
    return {
      provider: "google",
      role: session.role ?? resolveRoleForEmail(session.email),
      email: session.email,
      name: session.name,
      picture: session.picture,
      sub: session.sub,
      issuedAt: session.issuedAt ?? new Date().toISOString(),
      demo: session.demo,
    };
  } catch {
    return null;
  }
}

export function setAuthSession(session: TruveAuthSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isOperatorSession(session: TruveAuthSession | null = getAuthSession()): boolean {
  return session?.role === "operator";
}

export function sessionDisplayName(session: TruveAuthSession | null): string {
  if (!session) return "로그인";
  return session.name || session.email || "Google 계정";
}

export function decodeGoogleCredential(token: string): Partial<TruveAuthSession> {
  const payload = token.split(".")[1];
  if (!payload) return {};
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = decodeURIComponent(
    Array.from(window.atob(normalized))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
  const data = JSON.parse(decoded) as { email?: string; name?: string; picture?: string; sub?: string };
  return {
    email: data.email ?? "",
    name: data.name ?? data.email ?? "Google User",
    picture: data.picture,
    sub: data.sub,
  };
}

export function createDemoGoogleSession(): TruveAuthSession {
  return {
    provider: "google",
    role: "user",
    email: "demo@truve.foundation",
    name: "Truve Demo User",
    issuedAt: new Date().toISOString(),
    demo: true,
  };
}

export function createDemoOperatorSession(): TruveAuthSession {
  return {
    provider: "google",
    role: "operator",
    email: "operator@truve.foundation",
    name: "Truve Operator",
    issuedAt: new Date().toISOString(),
    demo: true,
  };
}
