'use client';

import React, { useState } from 'react';

interface DataPoint {
  label: string;
  rides: number;
  distance: number;
  savings: number;
}

const data: DataPoint[] = [
  { label: 'Week 1', rides: 24, distance: 480, savings: 1500 },
  { label: 'Week 2', rides: 32, distance: 640, savings: 2100 },
  { label: 'Week 3', rides: 28, distance: 560, savings: 1800 },
  { label: 'Week 4', rides: 45, distance: 900, savings: 3000 },
  { label: 'Week 5', rides: 39, distance: 780, savings: 2500 },
  { label: 'Week 6', rides: 42, distance: 840, savings: 2800 },
];

export default function AnalysisGraph() {
  const [metric, setMetric] = useState<'rides' | 'distance' | 'savings'>('rides');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Chart sizing parameters
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;
  
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Metric-specific parameters
  const getMetricData = () => {
    switch (metric) {
      case 'rides':
        return {
          title: 'Rides Completed',
          maxVal: 50,
          unit: 'Rides',
          color: '#38bdf8', // sky-400
          gradientId: 'skyGrad',
          valKey: 'rides' as const,
        };
      case 'distance':
        return {
          title: 'Distance Traveled',
          maxVal: 1000,
          unit: 'Km',
          color: '#10b981', // emerald-500
          gradientId: 'emeraldGrad',
          valKey: 'distance' as const,
        };
      case 'savings':
        return {
          title: 'Fuel Savings',
          maxVal: 3500,
          unit: 'Rs.',
          color: '#fbbf24', // amber-400
          gradientId: 'amberGrad',
          valKey: 'savings' as const,
        };
    }
  };

  const { title, maxVal, unit, color, gradientId, valKey } = getMetricData();

  // Generate SVG coordinates for each data point
  const points = data.map((d, index) => {
    const value = d[valKey];
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    // Map value so that higher values are closer to the top (lower Y in SVG space)
    const y = svgHeight - paddingBottom - (value / maxVal) * chartHeight;
    return { x, y, value, label: d.label };
  });

  // SVG drawing strings
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  return (
    <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 backdrop-blur-md space-y-6">
      
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{title} Analysis</h3>
          <p className="text-xs text-zinc-400">Weekly operational performance insights.</p>
        </div>

        {/* Tab-styled Selectors */}
        <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-lg self-start sm:self-center">
          <button
            onClick={() => setMetric('rides')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              metric === 'rides' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Rides
          </button>
          <button
            onClick={() => setMetric('distance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              metric === 'distance' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Distance
          </button>
          <button
            onClick={() => setMetric('savings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              metric === 'savings' ? 'bg-amber-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Savings
          </button>
        </div>
      </div>

      {/* SVG Plot Wrapper */}
      <div className="relative">
        
        {/* Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg shadow-2xl text-[11px] backdrop-blur-sm transition-all duration-200"
            style={{
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
              top: `${(points[hoveredIndex].y / svgHeight) * 100 - 2}%`,
            }}
          >
            <div className="font-semibold text-zinc-400 mb-0.5">{points[hoveredIndex].label}</div>
            <div className="text-zinc-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {unit === 'Rs.' ? `Rs. ${points[hoveredIndex].value}` : `${points[hoveredIndex].value} ${unit}`}
            </div>
          </div>
        )}

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          className="overflow-visible select-none"
        >
          {/* Definitions for gradients */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines (Horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * chartHeight;
            const val = maxVal - ratio * maxVal;
            return (
              <g key={ratio} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#27272a" /* zinc-800 */
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#71717a" /* zinc-500 */
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {unit === 'Rs.' ? `₹${Math.round(val)}` : Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill Under Curve */}
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            className="transition-all duration-500 ease-in-out"
          />

          {/* Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-in-out"
          />

          {/* Data Points & Active Handles */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Invisible interactive hover zone */}
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* Visible dot indicator */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? '6' : '4'}
                fill="#09090b" /* zinc-950 */
                stroke={color}
                strokeWidth={hoveredIndex === idx ? '3.5' : '2'}
                className="pointer-events-none transition-all duration-200"
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={svgHeight - paddingBottom + 20}
              fill="#71717a" /* zinc-500 */
              fontSize="10"
              textAnchor="middle"
              className="font-medium"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
