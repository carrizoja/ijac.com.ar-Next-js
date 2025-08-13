
interface PrimaryButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'large' | 'small';
  colorVariant?: 'blue' | 'cyan' | 'purple' | 'pink' | 'green';
};

export const PrimaryButton = ({ 
  text = "Contactanos", 
  onClick,
  className = "",
  variant = "default",
  colorVariant = "blue"
}: PrimaryButtonProps) => {
  
  const sizeClasses = {
    small: "px-4 py-1.5 text-sm",
    default: "px-8 py-2",
    large: "px-10 py-3 text-lg"
  };

  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    cyan: "from-cyan-500 to-teal-500",
    purple: "from-indigo-500 to-purple-500",
    pink: "from-pink-500 to-rose-500",
    green: "from-green-500 to-emerald-500"
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: scroll to contact section
      const element = document.getElementById('contacto');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <button className="p-[3px] relative cursor-pointer" onClick={handleClick}>
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[colorVariant]} rounded-lg`} />
        <div className={`${sizeClasses[variant]} bg-black rounded-[6px] relative group transition duration-400 text-white hover:bg-transparent cursor-pointer`}>
          {text}
        </div>
      </button>
    </div>
  );
}
  