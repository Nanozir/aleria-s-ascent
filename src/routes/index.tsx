import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX game module without types
import App from "@/game/App.jsx";
import "@/game/aleria.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aleria: Contractor" },
      { name: "description", content: "A dark fantasy RPG of contracts, races, and the Underworld." },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
