import React from "react";
import { WeightRecord } from "../../types";

interface Props {
  data: WeightRecord[];
}

const WeightEvolutionChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <span className="text-4xl mb-2">📊</span>
        <p className="text-gray-400 font-medium">
          Dados insuficientes para gerar o gráfico.
        </p>
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = 40;

  const weights = sortedData.map((d) => d.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const weightRange = maxWeight - minWeight;

  const points = sortedData.map((d, i) => {
    const x =
      padding + (i * (width - 2 * padding)) / (sortedData.length - 1 || 1);
    const y =
      height -
      padding -
      ((d.weight - minWeight) * (height - 2 * padding)) / (weightRange || 1);
    return { x, y, weight: d.weight, date: d.date };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area path for gradient
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-blue-500">📈</span> Evolução do Peso (kg)
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              Peso Corporale
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Grids */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i * (height - 2 * padding)) / 4;
            const labelWeight = maxWeight - (i * weightRange) / 4;
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-100 dark:text-gray-700"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-gray-400 font-bold"
                >
                  {labelWeight.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Definitions for gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="#3B82F6"
                className="stroke-white dark:stroke-gray-800 stroke-2"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="#3B82F6"
                className="opacity-0 group-hover:opacity-20 transition-opacity cursor-pointer"
              />

              {/* Tooltip on hover (simplified) */}
              <text
                x={p.x}
                y={p.y - 15}
                textAnchor="middle"
                className="text-[11px] font-black fill-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {p.weight}kg
              </text>

              {/* Date Label */}
              <text
                x={p.x}
                y={height - padding + 20}
                textAnchor="middle"
                className="text-[9px] fill-gray-400 font-bold uppercase"
              >
                {new Date(p.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default WeightEvolutionChart;
