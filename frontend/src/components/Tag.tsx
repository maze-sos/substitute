const TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
  "nut-free": "Nut-free",
  spicy: "Spicy",
  quick: "Quick",
  "comfort-food": "Comfort food",
};

interface Props {
  tag: string;
  tone?: "sand" | "olive";
}

export function Tag({ tag, tone = "sand" }: Props) {
  const label = TAG_LABELS[tag] ?? tag;
  const toneClasses =
    tone === "olive"
      ? "bg-olive/15 text-olive-dark"
      : "bg-sand text-ink-soft";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses}`}>
      {label}
    </span>
  );
}
