export function getSenderSession(): { email: string } | null {
  const email = localStorage.getItem("session_email");
  const token = localStorage.getItem("session_token");
  if (!email || !token) return null;
  return { email };
}

export function setSenderSession(email: string, token: string): void {
  localStorage.setItem("session_email", email);
  localStorage.setItem("session_token", token);
}

export function clearSenderSession(): void {
  localStorage.removeItem("session_email");
  localStorage.removeItem("session_token");
}

export function getAdminToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function setAdminToken(token: string): void {
  localStorage.setItem("admin_token", token);
}

export function clearAdminToken(): void {
  localStorage.removeItem("admin_token");
}
