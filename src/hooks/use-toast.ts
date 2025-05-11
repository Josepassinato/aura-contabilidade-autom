
import { toast as shadcnToast, useToast as useShadcnToast } from "@/components/ui/toast";

export const useToast = useShadcnToast;
export const toast = shadcnToast;

export type { ToastActionElement } from "@/components/ui/toast";
