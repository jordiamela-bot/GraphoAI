import React, { useState } from 'react';

const RadarChart = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const labels = [
    { name: "Lideratge", key: "lideratge" },
    { name: "Organització", key: "organitzacio" },
    { name: "Creativitat", key: "creativitat" },
    { name: "Empatia", key: "empatia" },
    { name: "Constància", key: "constancia" },
    { name: "Comunicació", key: "comunicacio" },
    { name: "Iniciativa", key: "iniciativa" },
    { name: "Flexibilitat", key: "flexibilitat" },
    { name: "Autocontrol", key: "autocontrol" },
    { name: "Treball en equip", key: "treball_en_equip" }
  ];

  const size = 340;
  const center = size / 2;
  const radius = 100;
  const angleStep = (2 * Math.PI) / labels.length;

  // Calculate coordinates for a given radius and angle index
  const getCoordinates = (index, valRadius) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + valRadius * Math.cos(angle);
    const y = center + valRadius * Math.sin(angle);
    return { x, y };
  };

  // Generate grid lines (decagons) at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridDecagons = gridLevels.map((level) => {
    const r = radius * level;
    const points = labels.map((_, idx) => {
      const { x, y } = getCoordinates(idx, r);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Calculate coordinates for the actual values
  const dataPoints = labels.map((label, idx) => {
    const score = data[label.key] || 50;
    const r = radius * (score / 100);
    return getCoordinates(idx, r);
  });

  const dataPolygonString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
        Índexs de Competències
      </h3>
      
      <div className="relative w-full max-w-[340px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto overflow-visible">
          {/* Radial Grid Lines (Decagons) */}
          {gridDecagons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              className="fill-none stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="0.75"
            />
          ))}

          {/* Core Axis Lines & Labels */}
          {labels.map((label, idx) => {
            const outer = getCoordinates(idx, radius);
            const labelPos = getCoordinates(idx, radius + 22);
            
            // Adjust label text alignment
            let textAnchor = "middle";
            const angle = idx * angleStep - Math.PI / 2;
            const cos = Math.cos(angle);
            if (cos > 0.15) textAnchor = "start";
            else if (cos < -0.15) textAnchor = "end";

            // Vertical adjustment
            let dy = "0.33em";
            const sin = Math.sin(angle);
            if (sin > 0.8) dy = "0.8em";
            else if (sin < -0.8) dy = "-0.2em";

            const score = data[label.key] || 0;
            const isHovered = hoveredIdx === idx;

            return (
              <g key={label.key} className="group">
                {/* Axis Line */}
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="0.75"
                  strokeDasharray="2,2"
                />
                {/* Text Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  dy={dy}
                  textAnchor={textAnchor}
                  className={`text-[9.5px] font-medium transition-colors cursor-pointer select-none
                    ${isHovered 
                      ? 'fill-blue-600 dark:fill-blue-400 font-bold' 
                      : 'fill-slate-600 dark:fill-slate-400 group-hover:fill-slate-900 dark:group-hover:fill-slate-100'
                    }`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {label.name}
                </text>
              </g>
            );
          })}

          {/* Filled Data Area */}
          <polygon
            points={dataPolygonString}
            className="fill-blue-500/15 dark:fill-blue-500/10 stroke-blue-600 dark:stroke-blue-400"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Interactive Data Vertices */}
          {dataPoints.map((p, idx) => {
            const score = data[labels[idx].key] || 0;
            const isHovered = hoveredIdx === idx;
            
            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Larger transparent hover target */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  className="fill-transparent"
                />
                {/* Visual Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "5" : "3.5"}
                  className={`transition-all duration-150 stroke-white dark:stroke-slate-900
                    ${isHovered 
                      ? 'fill-blue-700 dark:fill-blue-300 ring-4 ring-blue-500/30' 
                      : 'fill-blue-600 dark:fill-blue-400'
                    }`}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Center Details Tooltip */}
      <div className="mt-2 h-7 flex items-center justify-center">
        {hoveredIdx !== null ? (
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-900/50 transition-all duration-200 animate-fadeIn">
            {labels[hoveredIdx].name}: <span className="font-bold text-sm">{data[labels[hoveredIdx].key] || 0}</span>/100
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Passa el cursor pels punts per veure el valor
          </span>
        )}
      </div>
    </div>
  );
};

export default RadarChart;
