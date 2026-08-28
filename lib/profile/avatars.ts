export interface AvatarItem {
  id: string;
  name: string;
  url: string;
  category: "classics";
}

export const CLASSIC_AVATARS: AvatarItem[] = [
  // Default 2 rows (12 items)
  { id: "classic-1", name: "Classic 1", url: "/avatar/classic-1.png", category: "classics" },
  { id: "classic-2", name: "Classic 2", url: "/avatar/classic-2.png", category: "classics" },
  { id: "classic-3", name: "Classic 3", url: "/avatar/classic-3.png", category: "classics" },
  { id: "classic-4", name: "Classic 4", url: "/avatar/classic-4.png", category: "classics" },
  { id: "classic-5", name: "Classic 5", url: "/avatar/classic-5.png", category: "classics" },
  { id: "classic-6", name: "Classic 6", url: "/avatar/classic-6.png", category: "classics" },
  { id: "classic-7", name: "Classic 7", url: "/avatar/classic-7.png", category: "classics" },
  { id: "classic-8", name: "Classic 8", url: "/avatar/classic-8.png", category: "classics" },
  { id: "classic-9", name: "Classic 9", url: "/avatar/classic-9.png", category: "classics" },
  { id: "classic-10", name: "Classic 10", url: "/avatar/classic-10.png", category: "classics" },
  { id: "classic-11", name: "Classic 11", url: "/avatar/classic-11.png", category: "classics" },
  { id: "classic-12", name: "Classic 12", url: "/avatar/classic-12.png", category: "classics" },

  // Expanded 3 rows (18 more items on "Show more")
  { id: "classic-13", name: "Classic 13", url: "/avatar/classic-13.png", category: "classics" },
  { id: "classic-14", name: "Classic 14", url: "/avatar/classic-14.png", category: "classics" },
  { id: "classic-15", name: "Classic 15", url: "/avatar/classic-15.png", category: "classics" },
  { id: "classic-16", name: "Classic 16", url: "/avatar/classic-16.png", category: "classics" },
  { id: "classic-17", name: "Classic 17", url: "/avatar/classic-17.png", category: "classics" },
  { id: "classic-18", name: "Classic 18", url: "/avatar/classic-18.png", category: "classics" },
  { id: "classic-19", name: "Classic 19", url: "/avatar/classic-19.png", category: "classics" },
  { id: "classic-20", name: "Classic 20", url: "/avatar/classic-20.png", category: "classics" },
  { id: "classic-21", name: "Classic 21", url: "/avatar/classic-21.png", category: "classics" },
  { id: "classic-22", name: "Classic 22", url: "/avatar/classic-22.png", category: "classics" },
  { id: "classic-23", name: "Classic 23", url: "/avatar/classic-23.png", category: "classics" },
  { id: "classic-24", name: "Classic 24", url: "/avatar/classic-24.png", category: "classics" },
  { id: "classic-25", name: "Classic 25", url: "/avatar/classic-25.png", category: "classics" },
  { id: "classic-26", name: "Classic 26", url: "/avatar/classic-26.png", category: "classics" },
  { id: "classic-27", name: "Classic 27", url: "/avatar/classic-27.png", category: "classics" },
  { id: "classic-28", name: "Classic 28", url: "/avatar/classic-28.png", category: "classics" },
  { id: "classic-29", name: "Classic 29", url: "/avatar/classic-29.png", category: "classics" },
  { id: "classic-30", name: "Classic 30", url: "/avatar/classic-30.png", category: "classics" },
];

export const DEFAULT_AVATARS_COUNT = 12; // 2 rows (6 per row on desktop)
