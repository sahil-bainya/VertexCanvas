export default function Button({
  children,
  type = "button",
  loading,
  buttonType = "btn-soft",
  className = "btn px-2!",
  ...props
}) {
  return (
    <button
      disabled={loading}
      type={type}
      {...props}
      className={` ${buttonType} ${className}`}
    >
      {loading ? (
        <span className="loading loading-dots loading-md"></span>
      ) : (
        children
      )}
    </button>
  );
}
