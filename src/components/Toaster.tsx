import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useStore } from "../lib/store";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};
const accent = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-gold-soft",
};

export default function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-[92%] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-5 sm:translate-x-0">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <Icon className={`h-5 w-5 shrink-0 ${accent[t.type]}`} />
              <p className="flex-1 text-sm text-zinc-100">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
