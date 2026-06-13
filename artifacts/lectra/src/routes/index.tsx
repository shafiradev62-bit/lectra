import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    // Detect on client; on server default to "id"
    const accept =
      typeof navigator !== "undefined" ? (navigator.language || "id").toLowerCase() : "id";
    const lang = accept.startsWith("en") ? "en" : "id";
    throw redirect({ to: "/$lang", params: { lang }, search: location.search });
  },
  component: () => null,
});
