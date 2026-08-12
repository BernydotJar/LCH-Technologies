import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check, Cpu, FileText, Database, GitMerge, Layers, ArrowRight } from 'lucide-react';

interface HeroSystemAnimationProps {
  isPlaying?: boolean;
}

export const HeroSystemAnimation: React.FC<HeroSystemAnimationProps> = ({ isPlaying = true }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      setPhase(4); // Immediate resolved state when motion is paused
      return;
    }

    // Storyboard sequence: 0s -> 2s -> 4s -> 6s -> 8s -> loop
    const interval = setInterval(() => {
      setPhase((prev) => (prev < 4 ? prev + 1 : 1));
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const activePhase = !isPlaying ? 4 : phase;

  // Spanish Source Nodes (Input Elements)
  const sourceNodes = [
    { label: 'CONTRATOS', icon: FileText, x: 70, y: 70 },
    { label: 'POLÍTICAS', icon: ShieldCheck, x: 330, y: 60 },
    { label: 'PROCESOS', icon: GitMerge, x: 40, y: 220 },
    { label: 'DATOS ERP', icon: Database, x: 360, y: 220 },
    { label: 'SISTEMAS', icon: Layers, x: 90, y: 360 },
    { label: 'DOCUMENTOS', icon: FileText, x: 320, y: 360 },
  ];

  // Spanish Telemetry Badges (High Contrast Output States)
  const telemetryItems = [
    { label: 'Evidencia verificada', icon: ShieldCheck, isVerified: activePhase >= 3 },
    { label: 'Aprobación humana', icon: Check, isVerified: activePhase >= 3 },
    { label: 'Operación trazable', icon: Cpu, isVerified: activePhase >= 4 },
    { label: 'Lista para automatización', icon: GitMerge, isVerified: activePhase >= 4 },
  ];

  return (
    <div className="relative w-full max-w-[540px] mx-auto flex flex-col items-center justify-center p-2 sm:p-3 select-none">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none rounded-lg overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 500 400" fill="none">
          <pattern id="isoGrid" width="60" height="103.92" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 60 51.96 L 30 103.92 L 0 51.96 Z" fill="none" stroke="#155E75" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="0" y1="51.96" x2="60" y2="51.96" stroke="#155E75" strokeWidth="0.5" strokeOpacity="0.6" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#isoGrid)" />
        </svg>
      </div>

      {/* Narrative Header Tag above Diagram */}
      <div className="w-full flex items-center justify-between mb-2 px-1 text-[11px] font-mono tracking-wider text-neutral-300">
        <span className="flex items-center gap-1.5 font-semibold text-accent uppercase">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          Fuentes dispersas
        </span>
        <ArrowRight size={12} className="text-neutral-400" />
        <span className="font-semibold text-emerald-400 uppercase">Sistema trazable</span>
      </div>

      {/* Main Interactive Diagram SVG */}
      <svg className="w-full aspect-[4/3] relative z-10" viewBox="0 0 440 380" fill="none">
        <defs>
          <linearGradient id="tealGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#155E75" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0C0A50" stopOpacity="0.95" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* CONNECTION VECTORS from Source Nodes to Central Hub (220, 190) */}
        {sourceNodes.map((node, index) => {
          const isConnected = activePhase >= 1;
          const isConverged = activePhase >= 2;

          return (
            <g key={`connection-${index}`}>
              <line
                x1={node.x}
                y1={node.y}
                x2={220}
                y2={190}
                stroke={isConnected ? '#10B981' : '#155E75'}
                strokeWidth={isConnected ? (isConverged ? '2' : '1.25') : '0.8'}
                strokeDasharray={isConnected ? 'none' : '4 4'}
                strokeOpacity={isConnected ? (isConverged ? '0.9' : '0.6') : '0.35'}
                className="transition-all duration-700 ease-in-out"
              />

              {isConnected && isPlaying && (
                <circle r="3.5" fill="#10B981">
                  <animateMotion
                    path={`M ${node.x} ${node.y} L 220 190`}
                    dur={`${2.0 + index * 0.25}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* SOURCE NODES (Input Elements) */}
        {sourceNodes.map((node, index) => {
          const isActive = activePhase >= 1;

          return (
            <g
              key={`node-${index}`}
              transform={`translate(${node.x}, ${node.y})`}
              className="transition-all duration-500 cursor-pointer"
            >
              <polygon
                points="0,-16 15,0 0,16 -15,0"
                fill={isActive ? '#0C0A50' : '#090838'}
                stroke={isActive ? '#10B981' : '#155E75'}
                strokeWidth={isActive ? '1.5' : '1'}
                strokeOpacity={isActive ? '0.95' : '0.5'}
                className="transition-colors duration-500"
              />

              <rect
                x="-38"
                y="19"
                width="76"
                height="17"
                rx="3"
                fill="#050524"
                fillOpacity="0.95"
                stroke={isActive ? '#155E75' : '#3B4252'}
                strokeWidth="0.75"
              />
              <text
                x="0"
                y="31"
                textAnchor="middle"
                fill={isActive ? '#FFFFFF' : '#9CA3AF'}
                fontSize="8.5"
                fontFamily="League Spartan, sans-serif"
                fontWeight="700"
                letterSpacing="0.08em"
              >
                {node.label}
              </text>

              <circle
                r="3"
                fill={isActive ? '#10B981' : '#155E75'}
                className="transition-colors duration-500"
              />
            </g>
          );
        })}

        {/* CENTRAL LCH SYSTEM HUB */}
        <g transform="translate(220, 190)" className="relative">
          <polygon
            points="0,-55 48,-27 48,27 0,55 -48,27 -48,-27"
            fill="url(#tealGlow)"
            fillOpacity={activePhase >= 2 ? '0.35' : '0.15'}
            stroke="#10B981"
            strokeWidth={activePhase >= 2 ? '1.75' : '1'}
            strokeDasharray={activePhase >= 2 ? 'none' : '3 3'}
            filter={activePhase >= 2 ? 'url(#glow)' : undefined}
            className="transition-all duration-700"
          />

          <g className="transition-transform duration-700">
            <polygon
              points="0,-34 30,-17 0,0 -30,-17"
              fill="#155E75"
              fillOpacity={activePhase >= 2 ? '0.9' : '0.4'}
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            <polygon
              points="-30,-17 0,0 0,34 -30,17"
              fill="#0C0A50"
              fillOpacity="0.95"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <polygon
              points="0,0 30,-17 30,17 0,34"
              fill="#080730"
              fillOpacity="0.95"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </g>

          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
            fontFamily="League Spartan, sans-serif"
            fontWeight="800"
            letterSpacing="0.14em"
          >
            LCH
          </text>
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fill="#10B981"
            fontSize="7.5"
            fontFamily="League Spartan, sans-serif"
            fontWeight="700"
            letterSpacing="0.12em"
            opacity={activePhase >= 2 ? 1 : 0.6}
          >
            SISTEMA
          </text>

          {activePhase >= 2 && (
            <circle
              r="44"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.25"
              strokeOpacity="0.6"
            >
              <animate
                attributeName="r"
                values="40;50;40"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.7;0.15;0.7"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      </svg>

      {/* TELEMETRY BADGES (High Contrast & Clear Spanish Statuses) */}
      <div className="w-full mt-2 grid grid-cols-2 gap-2 relative z-20 px-1">
        {telemetryItems.map((item, idx) => {
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono transition-all duration-300 ${
                item.isVerified
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-white shadow-[0_2px_10px_rgba(16,185,129,0.2)]'
                  : 'bg-[#0A093D] border-white/20 text-neutral-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold ${
                  item.isVerified ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-neutral-400'
                }`}
              >
                {item.isVerified ? <Check size={11} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />}
              </div>
              <span className="truncate tracking-tight font-semibold text-[11px] sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
