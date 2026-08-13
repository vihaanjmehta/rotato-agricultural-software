import {
  Bean,
  Circle,
  Crosshair,
  Flower,
  Flower2,
  Leaf,
  LineChart,
  Repeat,
  Sprout,
  Wheat,
  Workflow,
} from "lucide-react";
import type { Family, StrategyId } from "../engine/types";
import { familyColor } from "../engine/crops";

const FAMILY_ICONS: Record<Family, typeof Leaf> = {
  cereal: Wheat,
  legume: Bean,
  brassica: Flower2,
  solanaceous: Sprout,
  oilseed: Flower,
  grass: Leaf,
  allium: Circle,
};

export function CropGlyph({
  family,
  size = 22,
  strokeWidth = 1.8,
}: {
  family: Family;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = FAMILY_ICONS[family];
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      style={{ color: familyColor(family) }}
    />
  );
}

export function CropTile({
  family,
  size = 46,
  iconSize = 22,
  bg = "rgba(22,38,28,0.05)",
  ring = "rgba(22,38,28,0.08)",
}: {
  family: Family;
  size?: number;
  iconSize?: number;
  bg?: string;
  ring?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        display: "grid",
        placeItems: "center",
        background: bg,
        border: `1px solid ${ring}`,
      }}
    >
      <CropGlyph family={family} size={iconSize} />
    </div>
  );
}

const STRATEGY_ICONS: Record<StrategyId, typeof Leaf> = {
  baseline: Repeat,
  greedy: Crosshair,
  adaptive: Workflow,
  rl: LineChart,
};

export function StrategyBadge({
  id,
  color,
  size = 46,
  iconSize = 20,
}: {
  id: StrategyId;
  color: string;
  size?: number;
  iconSize?: number;
}) {
  const Icon = STRATEGY_ICONS[id];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        background: `${color}14`,
        border: `1px solid ${color}3d`,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.9} style={{ color }} />
    </div>
  );
}

export function Logo({
  size = 36,
  iconSize = 20,
}: {
  size?: number;
  iconSize?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 3.2,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg,#2f9a53,#0f9b5e)",
        color: "#fff",
        boxShadow: "0 8px 22px -8px rgba(15,155,94,0.7)",
      }}
    >
      <Sprout size={iconSize} strokeWidth={2.2} />
    </div>
  );
}