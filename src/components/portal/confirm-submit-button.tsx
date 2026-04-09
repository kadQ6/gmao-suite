"use client";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  message?: string;
};

export function ConfirmSubmitButton({
  children,
  className,
  title,
  message = "Etes-vous sur ?",
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      title={title}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
