import { createFileRoute } from "@tanstack/react-router";
import AleriaGame from "@/game/AleriaGame";
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
  return <AleriaGame />;
}
