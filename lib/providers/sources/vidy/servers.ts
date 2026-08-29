export interface VidyServerConfig {
  id: string;
  name: string;
  endpoint: string;
  audioLanguage: string;
  audioLabel: string;
  flagUrl?: string;
  description: string;
  languageParam?: string;
  useGermanAltTitle?: boolean;
}

export const VIDY_SERVERS: VidyServerConfig[] = [
  {
    id: "miami",
    name: "Vidy - Miami",
    endpoint: "miami/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · Fast HLS / 4K",
  },
  {
    id: "seattle",
    name: "Vidy - Seattle",
    endpoint: "seattle/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · Fast HLS",
  },
  {
    id: "denver",
    name: "Vidy - Denver",
    endpoint: "denver/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · DASH / HLS",
  },
  {
    id: "atlanta",
    name: "Vidy - Atlanta",
    endpoint: "atlanta/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · Alternate HLS",
  },
  {
    id: "phoenix",
    name: "Vidy - Phoenix",
    endpoint: "phoenix/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · Alternate HLS",
  },
  {
    id: "portland",
    name: "Vidy - Portland",
    endpoint: "portland/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · Alternate HLS",
  },
  {
    id: "austin",
    name: "Vidy - Austin",
    endpoint: "austin/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · English stream",
  },
  {
    id: "dallas",
    name: "Vidy - Dallas",
    endpoint: "dallas/sources",
    audioLanguage: "en",
    audioLabel: "English (Original)",
    flagUrl: "/flags/us.svg",
    description: "Original audio · Alternate HLS",
  },
  {
    id: "munich",
    name: "Vidy - Munich",
    endpoint: "munich/sources",
    audioLanguage: "de",
    audioLabel: "German (Deutsch)",
    flagUrl: "/flags/de.svg",
    description: "German dubbed audio",
    languageParam: "german",
  },
  {
    id: "berlin",
    name: "Vidy - Berlin",
    endpoint: "berlin/sources",
    audioLanguage: "de",
    audioLabel: "German (Deutsch)",
    flagUrl: "/flags/de.svg",
    description: "German dubbed audio",
    useGermanAltTitle: true,
  },
  {
    id: "paris",
    name: "Vidy - Paris",
    endpoint: "paris/sources",
    audioLanguage: "fr",
    audioLabel: "French (Français)",
    flagUrl: "/flags/fr.svg",
    description: "French dubbed audio",
  },
  {
    id: "delhi",
    name: "Vidy - Delhi",
    endpoint: "delhi/sources",
    audioLanguage: "hi",
    audioLabel: "Hindi (हिंदी)",
    flagUrl: "/flags/in.svg",
    description: "Hindi dubbed audio",
  },
  {
    id: "cancun",
    name: "Vidy - Cancun",
    endpoint: "cancun/sources",
    audioLanguage: "es",
    audioLabel: "Spanish (Español)",
    flagUrl: "/flags/mx.svg",
    description: "Spanish dubbed audio",
  },
];
