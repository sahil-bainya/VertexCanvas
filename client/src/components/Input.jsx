import { useId, forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    type = "text",
    error,
    classname = "",
    placeholder = "Type here",
    ...props
  },
  ref,
) {
  const id = useId();
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        {...props}
        type={type}
        placeholder={placeholder}
        className={`${classname} input w-full px-2!`}
        ref={ref}
        id={id}
      />
      {error && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

export default Input;
