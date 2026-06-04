import { handlers } from "@/auth";

// Expose NextAuth GET and POST handlers to manage the session handshake
export const { GET, POST } = handlers;