import { ENTREPRENDRE_FINANCE } from "./articles-entreprendre-finance";
import { ERREURS } from "./articles-erreurs";
import { SALAIRE_EPARGNE } from "./articles-salaire-epargne";
import type { ArticleSource } from "./types";

export const ARTICLE_SOURCES: ArticleSource[] = [...SALAIRE_EPARGNE, ...ENTREPRENDRE_FINANCE, ...ERREURS];
