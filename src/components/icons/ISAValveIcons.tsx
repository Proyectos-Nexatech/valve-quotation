import React from 'react';

/**
 * ISA S5.1 Valve Symbols
 * Based on industry standard instrumentation drawings.
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const SVGWrapper = ({ children, size = 32, color = 'currentColor', className }: IconProps & { children: React.ReactNode }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {children}
  </svg>
);

// Manual Valve (Bowtie with stem and crossbar)
export const ISAManualValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 12 L16 18 L4 24 Z M28 12 L16 18 L28 24 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 18 V6" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M10 6 H22" stroke={props.color || 'currentColor'} strokeWidth="2" />
  </SVGWrapper>
);

// General Valve (Bowtie)
export const ISAGeneralValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 10 L16 16 L4 22 Z M28 10 L16 16 L28 22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
  </SVGWrapper>
);

// On/Off Valve (Bowtie with solenoid/piston actuator)
export const ISAOnOffValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 18 L16 24 L4 30 Z M28 18 L16 24 L28 30 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 24 V14" stroke={props.color || 'currentColor'} strokeWidth="2" />
    {/* Rectangular Actuator */}
    <rect x="10" y="4" width="12" height="10" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M10 9 H22" stroke={props.color || 'currentColor'} strokeWidth="1.5" />
    <path d="M16 4 V9" stroke={props.color || 'currentColor'} strokeWidth="1.5" />
  </SVGWrapper>
);

// Globe Valve (Bowtie with dot)
export const ISAGlobeValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 10 L16 16 L4 22 Z M28 10 L16 16 L28 22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="3" fill={props.color || 'currentColor'} />
  </SVGWrapper>
);

// Ball Valve (Bowtie with circle)
export const ISABallValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 10 L16 16 L4 22 Z M28 10 L16 16 L28 22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="4" stroke={props.color || 'currentColor'} strokeWidth="2" />
  </SVGWrapper>
);

// Check Valve (Flow arrow)
export const ISACheckValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 16 H28" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M12 10 L20 16 L12 22" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 16 L10 16" stroke={props.color || 'currentColor'} strokeWidth="2" />
  </SVGWrapper>
);

// Needle Valve (Bowtie with X/Cross-like precision control)
export const ISANeedleValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 10 L16 16 L4 22 Z M28 10 L16 16 L28 22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 8 V24" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M13 8 H19" stroke={props.color || 'currentColor'} strokeWidth="2" />
  </SVGWrapper>
);

// Pressure/Vacuum Valve (Breather/Vent with spring and tank connection)
export const ISAPressureVacuumValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    {/* Body Bowtie */}
    <path d="M10 18 L16 14 L22 18 V10 L16 14 L10 10 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    {/* Upper Stem with Spring/Weight */}
    <path d="M16 14 V4" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M13 11 L19 7 M13 8 L19 4 M13 14 L19 10" stroke={props.color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
    {/* Lower Connection to Tank */}
    <path d="M16 14 V24" stroke={props.color || 'currentColor'} strokeWidth="3" strokeLinecap="round" />
    <path d="M8 24 H24" stroke={props.color || 'currentColor'} strokeWidth="3" strokeLinecap="round" />
    {/* Flow Arrows */}
    <path d="M2 14 H8" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M10 14 L6 11 V17 Z" fill={props.color || 'currentColor'} />
    <path d="M22 14 H28" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M30 14 L26 11 V17 Z" fill={props.color || 'currentColor'} />
  </SVGWrapper>
);

// Diaphragm Valve (Bowtie with arch)
export const ISADiaphragmValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 10 L16 16 L4 22 Z M28 10 L16 16 L28 22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 10 Q16 4 22 10" stroke={props.color || 'currentColor'} strokeWidth="2" fill="none" />
  </SVGWrapper>
);

// Safety/Relief Valve (Standard ISA) - Not explicitly in the provided image but essential for the list
export const ISASafetyValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    {/* Body Inlet Triangle */}
    <path d="M16 20 L10 26 H22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    {/* Body Outlet Triangle */}
    <path d="M16 20 L22 14 V26 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    {/* Stem with Spring */}
    <path d="M16 20 V6" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <path d="M13 14 L19 10 M13 11 L19 7 M13 17 L19 13" stroke={props.color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
    {/* Inlet Line */}
    <path d="M16 26 V30" stroke={props.color || 'currentColor'} strokeWidth="2" />
    {/* Outlet Line */}
    <path d="M22 20 H28" stroke={props.color || 'currentColor'} strokeWidth="2" />
  </SVGWrapper>
);

// Control Valve (Bowtie with diaphragm actuator)
export const ISAControlValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    {/* Body */}
    <path d="M4 24 L16 20 L28 24 V16 L16 20 L4 16 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    {/* Stem */}
    <path d="M16 20 V8" stroke={props.color || 'currentColor'} strokeWidth="2" />
    {/* Actuator (Diaphragm) */}
    <path d="M8 8 H24 Q16 -2 8 8 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
  </SVGWrapper>
);

// Butterfly Valve (Bowtie with diagonal and dot)
export const ISAButterflyValve = (props: IconProps) => (
  <SVGWrapper {...props}>
    <path d="M4 10 L16 16 L4 22 Z M28 10 L16 16 L28 22 Z" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 20 L20 12" stroke={props.color || 'currentColor'} strokeWidth="2" />
    <circle cx="16" cy="16" r="2" fill={props.color || 'currentColor'} />
  </SVGWrapper>
);
