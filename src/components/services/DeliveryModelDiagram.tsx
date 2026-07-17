import type { DeliveryModel } from "@/lib/data/services";

const MODELS: Record<DeliveryModel, { label: string; nodes: [string, string, string] }> = {
  project: { label: "Project Delivery", nodes: ["Your Brief", "Trivoxa Team", "Delivered Solution"] },
  retainer: { label: "Ongoing Retainer", nodes: ["Your Goals", "Trivoxa Team", "Monthly Delivery"] },
  "staff-aug": { label: "Team Augmentation", nodes: ["Trivoxa Team", "Integrates With", "Your Team"] },
  flexible: { label: "Flexible Engagement", nodes: ["Your Need", "Trivoxa Team", "Right-Fit Model"] },
};

/** Static three-node engagement-model diagram: node → connector → node.
 * Pure SVG, no animation — the model is information, not spectacle. */
export default function DeliveryModelDiagram({ model }: { model: DeliveryModel }) {
  const { label, nodes } = MODELS[model];
  return (
    <div className="delivery-model">
      <span className="delivery-model__label">{label}</span>
      <svg className="delivery-model__svg" viewBox="0 0 640 120" role="img" aria-label={`${label}: ${nodes.join(" → ")}`}>
        {nodes.map((node, i) => {
          const cx = 110 + i * 210;
          return (
            <g key={node}>
              <circle cx={cx} cy="44" r="7" className="delivery-model__dot" />
              {i < nodes.length - 1 && (
                <line x1={cx + 16} y1="44" x2={cx + 194} y2="44" className="delivery-model__line" />
              )}
              <text x={cx} y="86" textAnchor="middle" className="delivery-model__text">
                {node}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
