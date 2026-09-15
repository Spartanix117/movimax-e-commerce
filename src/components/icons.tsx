type IconProps = { className?: string };

export function BoltIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <path
        d="M12.5 1 3 14h6.5L8 25l10.5-14H12L14 1Z"
        fill="var(--gold)"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 3h1.6l1 9.2A1.5 1.5 0 0 0 6.1 13.6h7.2a1.5 1.5 0 0 0 1.5-1.28L16 5.5H4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="16" r="1.1" fill="currentColor" />
      <circle cx="13" cy="16" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.3A6.7 6.7 0 0 0 2.3 11.6L1.3 14.7l3.2-1a6.7 6.7 0 1 0 3.5-12.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1.5" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13.5 9l4.5-2.3v7L13.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.3 16.5 5v5c0 4-2.8 6.6-6.5 8-3.7-1.4-6.5-4-6.5-8V5L10 2.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1.5" y="5" width="17" height="10.5" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 8.3h17" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ScooterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="14.5" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="14" cy="14.5" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.5 14.5 8 6h4.5l1.5 3M8 6l2.5 5h3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.3 3h2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function BikeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="4.3" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13.7" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.3 13 8 5.5h4L9.5 10h4.2l1.6 3M8 5.5H6.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelmetIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2.5 12.5A6.5 6.5 0 0 1 15.5 12.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M2 12.5h14v1.3a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 13.8Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 5.5v3.2M6.3 7h5.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function WrenchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M11.8 2.6a3.6 3.6 0 0 0-4.7 4.4L2.5 11.6a1.7 1.7 0 0 0 2.4 2.4l4.6-4.6a3.6 3.6 0 0 0 4.4-4.7L11.6 7 10 5.4l2.2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="4.5" y="1.5" width="9" height="15" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 14h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function DropletIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 1.8s5 6 5 9.8a5 5 0 0 1-10 0c0-3.8 5-9.8 5-9.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
