import { detectCardType } from '@/utils/cardValidation';

interface CardTypeIconProps {
  cardNumber: string;
  className?: string;
}

// ── VISA SVG ──────────────────────────────────────────────────────────────────

function VisaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      aria-label="Visa"
      role="img"
    >
      <rect width="48" height="32" rx="5" fill="#1A1F71" />
      <text
        x="24"
        y="23"
        textAnchor="middle"
        fill="white"
        fontSize="15"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        fontStyle="italic"
        letterSpacing="1"
      >
        VISA
      </text>
    </svg>
  );
}

// ── Mastercard SVG ────────────────────────────────────────────────────────────

function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      aria-label="Mastercard"
      role="img"
    >
      <rect width="48" height="32" rx="5" fill="#252525" />
      {/* Red circle */}
      <circle cx="18" cy="16" r="9" fill="#EB001B" />
      {/* Yellow/orange circle */}
      <circle cx="30" cy="16" r="9" fill="#F79E1B" />
      {/* Overlap — creates the orange blend in the middle */}
      <path
        d="M24 8.54a9 9 0 0 1 0 14.92A9 9 0 0 1 24 8.54z"
        fill="#FF5F00"
      />
    </svg>
  );
}

// ── CardTypeIcon ──────────────────────────────────────────────────────────────

/**
 * Renders a VISA or Mastercard logo based on the card number prefix.
 * Returns null if the card type cannot be determined.
 */
export function CardTypeIcon({
  cardNumber,
  className = 'h-7 w-11',
}: CardTypeIconProps) {
  const type = detectCardType(cardNumber);

  if (type === 'visa') return <VisaIcon className={className} />;
  if (type === 'mastercard') return <MastercardIcon className={className} />;
  return null;
}
