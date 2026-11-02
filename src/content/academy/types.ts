export type CategorySlug = "salaire" | "epargne" | "entrepreneuriat" | "finance-personnelle" | "erreurs";

export type Level = "Débutant" | "Intermédiaire" | "Avancé";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: "tip" | "warning" | "example"; title: string; text: string }
  | {
      type: "figures";
      title: string;
      rows: Array<{ label: string; value: string; emphasis?: boolean }>;
      note?: string;
    }
  | { type: "quote"; text: string; source?: string };

export interface AcademyCategory {
  slug: CategorySlug;
  label: string;
  short: string;
  description: string;
}

export interface ArticleSource {
  slug: string;
  title: string;
  excerpt: string;
  category: CategorySlug;
  level: Level;
  updatedAt: string;
  featured?: boolean;
  takeaways: string[];
  blocks: Block[];
}

export interface Article extends ArticleSource {
  readingMinutes: number;
  toc: Array<{ id: string; text: string }>;
}
