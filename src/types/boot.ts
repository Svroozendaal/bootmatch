export type BootDTO = {
  id: string;
  brand: string;
  modelLine: string;
  variant?: string | null;
  year?: number | null;
  canonicalName: string;
  lastMm?: number | null;
  volumeClass?: string | null;
  flexIndex?: number | null;
  heelHold?: string | null;
  instepHeight?: string | null;
  forefootShape?: string | null;
  imageUrl?: string | null;
};

export type OfferDTO = {
  retailer: string;
  price: number;
  currency: string;
  url: string;
  lastCheckedAt?: string | null;
};
