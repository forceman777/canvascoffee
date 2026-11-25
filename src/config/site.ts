/**
 * Business configuration. EDIT THIS FILE when the owner supplies verified details.
 *
 * Rule: unknown values stay `null`. The interface hides or clearly marks anything that is
 * `null`. Nothing here may be guessed.
 */

const env = import.meta.env ?? ({} as Record<string, string | undefined>);
const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export interface OpeningHours {
  /** e.g. "Monday – Saturday" */
  days: string;
  /** e.g. "10:00 am – 10:00 pm" */
  hours: string;
}

export const site = {
  name: 'Canvas O Coffee',
  /** Recovered from the project brief. */
  locality: 'Belda, West Bengal, India',

  contact: {
    /** Full street address, e.g. "12 Station Road, Belda, Paschim Medinipur 721424". */
    address: 'College Road, Belda, Deuli, West Bengal 721424' as string | null,
    /** Display phone, e.g. "+91 98XXX XXXXX". */
    phone: '+91 93327 40085' as string | null,
    email: null as string | null,
    /** Google Maps share link for the café. */
    mapUrl: 'https://www.google.com/maps/place/Canvas+O+Coffee/@22.0754402,87.3344918,17z/data=!4m6!3m5!1s0x3a1d3b0041f3aa2d:0x37aa33c9807cef3!8m2!3d22.0754402!4d87.3344918' as string | null,
    /** Map pin (from the Google Maps listing), used for the embedded map and search engines. */
    geo: { lat: 22.0754402, lng: 87.3344918 } as { lat: number; lng: number } | null,
    instagramUrl: null as string | null,
    facebookUrl: null as string | null,
  },

  /**
   * Leave empty until the owner confirms. Google Maps shows "closes 10 PM" for one day only;
   * add each day's opening and closing time here, e.g. { days: 'Monday – Sunday', hours: '11:00 am – 10:00 pm' }.
   */
  openingHours: [] as OpeningHours[],

  /** Official WhatsApp number, digits only with country code (e.g. 91XXXXXXXXXX). */
  whatsappNumber: clean(env.VITE_WHATSAPP_NUMBER),

  ordering: {
    /** Supplied: free delivery on orders ABOVE ₹500. */
    freeDeliveryAbove: 500,
    /** Supplied: otherwise ₹25. */
    deliveryFee: 25,
    /** Largest quantity of a single line (a form guard, not a business rule). */
    maxQuantityPerLine: 20,
    /** Delivery area text once confirmed, e.g. "Within 5 km of Belda". */
    deliveryArea: null as string | null,
  },

  reservations: {
    /** How far ahead a request can be made (form guard; adjustable). */
    maxDaysAhead: 60,
    /** Largest party for the table form; larger groups use the occasion enquiry. Adjustable. */
    maxPartySize: 10,
  },

  /**
   * Preview mode: shows asset IDs/filenames on image placeholders and setup hints for the
   * site owner on unconnected features. Set to false for the public launch.
   */
  previewMode: true,
  /** Adds "Images are illustrative" beneath generated menu category images. */
  menuImagesAreIllustrative: true,
} as const;

export const hasContactDetails = () =>
  Boolean(site.contact.address || site.contact.phone || site.contact.email);
