type ThemeInputProps = {
  labelName: string;
  inputFor: string;
  placeholder?: string;
  isRequired?: boolean;
};

const ThemeInput = ({
  labelName,
  inputFor,
  placeholder = "",
  isRequired = false,
}: ThemeInputProps) => {
  // States

  // Lifecycle

  // Functions

  return (
    <>
      <div>
        <label
          className="block text-gray-400 text-xs font-mono uppercase mb-2"
          htmlFor={`${inputFor}`}
        >
          {labelName}
        </label>
        <input
          type="text"
          placeholder={placeholder}
          id={`${inputFor}`}
          name={`${inputFor}`}
          className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-red-900 text-orange-300 font-mono focus:outline-none focus:border-orange-500 placeholder-gray-600"
          required={isRequired}
        />
      </div>
    </>
  );
};

export default ThemeInput;
