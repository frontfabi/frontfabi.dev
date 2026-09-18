import type {
  Content,
  ImageField,
  KeyTextField,
  RichTextField,
  DateField,
  PrismicDocument,
} from "@prismicio/client";

// Additive fields stay optional until the models are synced and content is published.
export type PostDocument = PrismicDocument<
  {
    title: RichTextField;
    excerpt: KeyTextField;
    body: RichTextField;
    published_date: DateField;
    cover: ImageField;
    category: KeyTextField;
    meta_title: KeyTextField;
    meta_description: KeyTextField;
  },
  "post"
>;
export type CommunityDocument = Omit<Content.CommunityDocument, "data"> & {
  data: Content.CommunityDocument["data"] & { description?: RichTextField };
};
export type PageDocument = Omit<Content.PageDocument, "data"> & {
  data: Content.PageDocument["data"] & { home_intro?: RichTextField };
};
export type SiteSettingsDocument = PrismicDocument<
  Record<string, never>,
  "site_settings"
>;
export type SiteDocument =
  | Exclude<
      Content.AllDocumentTypes,
      Content.CommunityDocument | Content.PageDocument
    >
  | CommunityDocument
  | PageDocument
  | PostDocument
  | SiteSettingsDocument;
