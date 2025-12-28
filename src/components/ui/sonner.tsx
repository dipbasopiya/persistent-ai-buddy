import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "w-full flex items-center gap-3 p-4 rounded-xl shadow-lg",
          title: "text-sm font-medium",
          description: "text-xs opacity-80",
          actionButton: "shrink-0",
          cancelButton: "shrink-0",
          closeButton: "shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors",
        },
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-600" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
