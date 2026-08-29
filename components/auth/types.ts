export type AuthMode = "login" | "register";

export interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onClose: (mode: AuthMode) => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (username: string, mode: AuthMode) => Promise<void>;
  showToast: (msg: string) => void;
}
