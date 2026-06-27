import Link from "next/link";

interface SecondaryButtonProps {
  text?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "large" | "small";
}

export const SecondaryButton = ({
  text = "Ver mas",
  href,
  onClick,
  className = "",
  variant = "default",
}: SecondaryButtonProps) => {
  const sizeClasses = {
    small: "px-4 py-1.5 text-sm",
    default: "px-6 py-3 text-sm",
    large: "px-8 py-3 text-base",
  };

  const buttonClasses = `inline-flex items-center justify-center rounded-[6px] border border-white/15 text-white transition hover:bg-white/5 ${sizeClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {text}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={buttonClasses}>
      {text}
    </button>
  );
};
