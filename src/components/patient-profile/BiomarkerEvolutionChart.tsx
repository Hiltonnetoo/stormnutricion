import React from "react";

interface BiomarkerData {
  date: string;
  value: number;
}

interface BiomarkerEvolutionChartProps {
  data: BiomarkerData[];
  label: string;
  unit: string;
  color?: string;
}

const BiomarkerEvolutionChart: React.FC<BiomarkerEvolutionChartProps> = ({
  data,
  label,
  unit,
  color = "#10b981",
}) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Dados insuficientes para gráfico de evolução
        </p>
      </div>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const values = sortedData.map((d) => d.value);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1;
  const range = max - min;

  const width = 400;
  const height = 150;
  const padding = 20;

  const points = sortedData
    .map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (sortedData.length - 1);
      const y =
        height - padding - ((d.value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-xl font-black text-gray-800 dark:text-white">
            {sortedData[sortedData.length - 1].value}{" "}
            <span className="text-xs font-normal text-gray-500">{unit}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Tendência
          </p>
          <p
            className={`text-sm font-bold ${sortedData[sortedData.length - 1].value > sortedData[0].value ? "text-amber-500" : "text-green-500"}`}
          >
            {sortedData[sortedData.length - 1].value > sortedData[0].value
              ? "↑ Aumento"
              : "↓ Redução"}
          </p>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-32 overflow-visible"
      >
        {/* Area under the line */}
        <path
          d={`M ${padding},${height - padding} ${points} L ${width - padding},${height - padding} Z`}
          fill={color}
          fillOpacity="0.1"
        />
        {/* Main line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-sm"
        />
        {/* Data points */}
        {sortedData.map((d, i) => {
          const x =
            padding + (i * (width - 2 * padding)) / (sortedData.length - 1);
          const y =
            height -
            padding -
            ((d.value - min) / range) * (height - 2 * padding);
          return (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke={color}
                strokeWidth="2"
              />
              <title>{`${new Date(d.date).toLocaleDateString("pt-BR")}: ${d.value} ${unit}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase">
        <span>{new Date(sortedData[0].date).toLocaleDateString("pt-BR")}</span>
        <span>
          {new Date(sortedData[sortedData.length - 1].date).toLocaleDateString(
            "pt-BR",
          )}
        </span>
      </div>
    </div>
  );
};

export default BiomarkerEvolutionChart;
