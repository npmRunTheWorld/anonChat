import type React from "react";

type ThemeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
};

const ThemeButton = ({ text, ...props }: ThemeButtonProps) => {
  // States

  // Lifecycle

  // Functions

  return (
    <>
      <button
        role="button"
        type="submit"
        className="py-3 !bg-orange-600 text-black font-mono uppercase text-sm font-bold !hover:bg-orange-500 transition-all"
        {...props}
      >
        {text ?? "Enter"}
      </button>
    </>
  );
};

export default ThemeButton;
