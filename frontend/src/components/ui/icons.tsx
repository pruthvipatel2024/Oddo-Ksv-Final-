import { SVGProps } from "react";

export const icon = "stroke-current fill-none";
const base = { width: 18, height: 18, viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Icons = {
  dashboard: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
  ),
  trips: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M3 12h4l2-6h6l2 6h4" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
  ),
  history: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
  ),
  vehicle: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M4 16V9l2-4h12l2 4v7" /><circle cx="7.5" cy="16.5" r="1.5" /><circle cx="16.5" cy="16.5" r="1.5" /></svg>
  ),
  wallet: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1" /></svg>
  ),
  settings: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
  ),
  reports: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
  ),
  search: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
  ),
  mail: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
  ),
  lock: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
  ),
  swap: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M17 3v12M17 15l-4-4M17 15l4-4M7 21V9M7 9l4 4M7 9 3 13" /></svg>
  ),
  pin: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.2" /></svg>
  ),
  car: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M3 13h18l-2-5H5l-2 5Zm0 0v5h2m14-5v5h2M7 18h10" /><circle cx="7.5" cy="18" r="1.3" /><circle cx="16.5" cy="18" r="1.3" /></svg>
  ),
  chevronLeft: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="m15 18-6-6 6-6" /></svg>
  ),
  logout: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
  ),
  plus: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><path d="M12 5v14M5 12h14" /></svg>
  ),
  qr: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v7M14 20h3" /></svg>
  ),
  users: (p: SVGProps<SVGSVGElement> = {}) => (
    <svg {...base} className={icon} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 8.5a3 3 0 1 1 3.5 3M21 20a5.5 5.5 0 0 0-4-5.3" /></svg>
  ),
};
