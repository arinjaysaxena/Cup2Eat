/**
 * Cup2Eat brand content.
 *
 * SOURCE OF TRUTH: everything here comes from the supplied brand key visual
 * (Ramen Bistro range, three variants, four benefit claims, headline copy).
 * Anything the reference does not specify is a clearly marked PLACEHOLDER so the
 * real copy can be dropped in without touching any component or 3D code.
 */

export type VariantId = "spicy-korean" | "japanese-miso" | "thai-tom-yum";

export interface Palette {
  /** Main printed cup body colour */
  base: string;
  /** Darker/lighter tone used for pattern work on the body */
  baseDeep: string;
  /** Flavour ribbon + lid colour */
  accent: string;
  /** Text colour on top of the accent ribbon */
  onAccent: string;
  /** Secondary highlight (stripes, the "2" in the logo) */
  highlight: string;
  /** Cream / paper ink */
  ink: string;
  /** Broth colour seen when the lid comes off */
  broth: string;
}

export interface Variant {
  id: VariantId;
  range: string;
  flavour: string;
  /** Replace PLACEHOLDER copy with the approved product description. */
  description: string;
  descriptionIsPlaceholder: boolean;
  /** Ingredient callouts as depicted on the supplied pack art – to be confirmed by the brand. */
  packArtIngredients: string[];
  palette: Palette;
  /**
   * Optional final dieline artwork (wrap image, front panel centred, ~2.67:1).
   * When set, it replaces the generated print on the 3D model — no model rebuild needed.
   */
  labelArtworkUrl?: string;
  /** Optional final lid artwork (square, centred). */
  lidArtworkUrl?: string;
}

export const brand = {
  name: "Cup2Eat",
  range: "Ramen Bistro",
  packLine: "Instant gourmet goodness",
  hero: {
    eyebrow: "Ramen Bistro · Instant gourmet goodness",
    headline: ["Good things", "come in", "cups."],
    alternate: "Your next favourite moment. In a cup.",
    support: "Meet Cup2Eat. A little cup packed with a whole lot of goodness.",
    cta: "Explore the experience",
  },
  takeover: { headline: ["Small cup.", "Big personality."] },
  reveal: { headline: ["And now,", "the good part."] },
  inside: { headline: ["It's what's", "inside that", "counts."] },
  collection: { headline: ["A flavour", "for every", "mood."] },
  finale: { headline: ["Make room for", "Cup2Eat."], cta: "Discover Cup2Eat" },
  /** Benefit claims exactly as they appear on the supplied brand visual. */
  benefits: [
    { id: "minutes", title: ["Ready", "in minutes"], kicker: "Preparation" },
    { id: "taste", title: ["Delicious", "taste"], kicker: "Taste" },
    { id: "ingredients", title: ["Premium", "ingredients"], kicker: "Ingredients" },
    { id: "on-the-go", title: ["On-the-go", "goodness"], kicker: "Portability" },
  ],
  contact: {
    // PLACEHOLDER – replace with the real Cup2Eat contact details.
    email: "hello@example.com",
    emailIsPlaceholder: true,
    company: "Registered company name & address — to be supplied",
  },
  socials: [
    // PLACEHOLDER – point these at the official Cup2Eat profiles.
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ],
} as const;

const PACK_ART = ["Wavy noodles", "Tofu", "Sweet corn", "Spring onion", "Bok choy", "Chilli"];

export const variants: Variant[] = [
  {
    id: "spicy-korean",
    range: "Ramen Bistro",
    flavour: "Spicy Korean",
    description: "Flavour description to be supplied by Cup2Eat.",
    descriptionIsPlaceholder: true,
    packArtIngredients: PACK_ART,
    palette: {
      base: "#161012",
      baseDeep: "#3a1518",
      accent: "#E3262B",
      onAccent: "#FFF1DC",
      highlight: "#FF8A1F",
      ink: "#FFF1DC",
      broth: "#A8261A",
    },
  },
  {
    id: "japanese-miso",
    range: "Ramen Bistro",
    flavour: "Japanese Miso",
    description: "Flavour description to be supplied by Cup2Eat.",
    descriptionIsPlaceholder: true,
    packArtIngredients: PACK_ART,
    palette: {
      base: "#141111",
      baseDeep: "#2b2117",
      accent: "#FFC21A",
      onAccent: "#141111",
      highlight: "#FF7A00",
      ink: "#FFF3D6",
      broth: "#B86A1C",
    },
  },
  {
    id: "thai-tom-yum",
    range: "Ramen Bistro",
    flavour: "Thai Tom Yum",
    description: "Flavour description to be supplied by Cup2Eat.",
    descriptionIsPlaceholder: true,
    packArtIngredients: PACK_ART,
    palette: {
      base: "#3A1A57",
      baseDeep: "#5a2c80",
      accent: "#B9E34B",
      onAccent: "#2A1240",
      highlight: "#FF8A1F",
      ink: "#FFF3E6",
      broth: "#C9581A",
    },
  },
];

export const HERO_VARIANT: VariantId = "japanese-miso";
export const getVariant = (id: VariantId) => variants.find((v) => v.id === id)!;
