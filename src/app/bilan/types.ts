export type BilanCategory = {
  slug: string;
  name: string;
  items: { ref: string; name: string }[];
};

export type BilanLineInput = {
  ref: string;
  quantity: number;
  trips?: number;
};

export type BilanInput = { categorySlug: string; lines: BilanLineInput[] }[];

export type BilanResult =
  | { error: string }
  | {
      total: number;
      categories: {
        name: string;
        subtotal: number;
        lines: {
          name: string;
          quantity: number;
          unit: string;
          factor: number;
          emissions: number;
        }[];
      }[];
    };
