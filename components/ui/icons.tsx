interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

function Icon({
  className,
  size = 24,
  strokeWidth = 2,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.8}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  );
}

export function CodeIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Icon>
  );
}

export function Grid2x2Icon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.8}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </Icon>
  );
}

export function ChevronDownIcon({ className, size = 14 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function SearchIcon({ className, size = 24 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </Icon>
  );
}

export function UserRoundIcon({ className, size = 22 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </Icon>
  );
}

export function ClapperboardIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 3.9" />
      <path d="m12.4 3.4 3.1 4" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Icon>
  );
}

export function TvIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </Icon>
  );
}

export function FanIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z" />
      <path d="M12 12v.01" />
    </Icon>
  );
}

export function AntennaIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M2 12 7 2" />
      <path d="m7 12 5-10" />
      <path d="m12 12 5-10" />
      <path d="m17 12 5-10" />
      <path d="M4.5 7h15" />
      <path d="M12 16v6" />
    </Icon>
  );
}

export function ProjectorIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M5 7 3 5" />
      <path d="M9 6V3" />
      <path d="m13 7 2-2" />
      <circle cx="9" cy="13" r="3" />
      <path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17" />
      <path d="M16 16h2" />
    </Icon>
  );
}

export function PartyPopperIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
    </Icon>
  );
}

export function GalleryVerticalEndIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M7 2h10" />
      <path d="M5 6h14" />
      <rect width="18" height="12" x="3" y="10" rx="2" />
    </Icon>
  );
}

export function HeartIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Icon>
  );
}

export function CalendarIcon({ className, size = 14 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </Icon>
  );
}

export function SettingsIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function UploadIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </Icon>
  );
}

export function LockIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

export function LogOutIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </Icon>
  );
}

export function StarIcon({ className, size = 10 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-star ${className ?? ""}`}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function XIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function DownloadIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </Icon>
  );
}

export function ListOrderedIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.8}>
      <line x1="10" x2="21" y1="6" y2="6" />
      <line x1="10" x2="21" y1="12" y2="12" />
      <line x1="10" x2="21" y1="18" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6.5 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      <path d="M4 14.5h1v4" />
      <path d="M4 18.5h2" />
    </Icon>
  );
}

export function SparklesIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.8}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </Icon>
  );
}

export function ChevronLeftIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

export function CheckIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  );
}

export function PlusIcon({ className, size = 18 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  );
}

export function TrashIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </Icon>
  );
}

export function BookmarkIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </Icon>
  );
}

export function LogInIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.6}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </Icon>
  );
}

export function MegaphoneIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </Icon>
  );
}

export function UsersIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function ImageIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </Icon>
  );
}

export function ArrowLeftIcon({ className, size = 20 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icon>
  );
}

export function EyeIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </Icon>
  );
}

export function MailIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
  );
}

export function FlameIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Icon>
  );
}

export function DramaIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M10 11h.01" />
      <path d="M14 6h.01" />
      <path d="M18 6h.01" />
      <path d="M6.5 13.1h.01" />
      <path d="M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3" />
      <path d="M17.4 9.9c-.8.8-2 .8-2.8 0" />
      <path d="M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7" />
    </Icon>
  );
}

export function CompassIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </Icon>
  );
}

export function GhostIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
    </Icon>
  );
}

export function LaughIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <circle cx="12" cy="12" r="10" />
      <path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </Icon>
  );
}

export function RocketIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={1.75}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </Icon>
  );
}

export function PencilIcon({ className, size = 16 }: IconProps) {
  return (
    <Icon className={className} size={size} strokeWidth={2}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </Icon>
  );
}