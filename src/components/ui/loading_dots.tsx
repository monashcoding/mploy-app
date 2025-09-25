export default function ThreeDotLoader({
  className,
  mode = "dark",
}: {
  className?: string;
  mode?: "light" | "dark";
}) {
  return (
    <div
      className={
        "flex items-center justify-center space-x-2 " +
        (className ? ` ${className}` : "")
      }
    >
      <style>{`
        @keyframes flow {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        .dot {
          animation: flow 1.4s infinite ease-in-out;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
      `}</style>
      <div
        className={`w-3 h-3 rounded-full dot ${mode == "dark" ? "bg-white" : "bg-black/70"}`}
      />
      <div
        className={`w-3 h-3 rounded-full dot ${mode == "dark" ? "bg-white" : "bg-black/70"}`}
      />
      <div
        className={`w-3 h-3 rounded-full dot ${mode == "dark" ? "bg-white" : "bg-black/70"}`}
      />
    </div>
  );
}
