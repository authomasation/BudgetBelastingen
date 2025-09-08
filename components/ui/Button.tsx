import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

export default function Button({ children, variant = "primary", onClick }: ButtonProps) {
  const baseButton =
    "h-12 rounded-full px-5 py-2 font-medium text-sm sm:text-base transition-colors flex items-center gap-2 cursor-pointer";

  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-green-600"
      : "border border-gray-300 hover:bg-gray-100 hover:text-[#333]";

  return (
    <button onClick={onClick} className={`${baseButton} ${variantClass}`}>
      {children}
    </button>
  );
}
