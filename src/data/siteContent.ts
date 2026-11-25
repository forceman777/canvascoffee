/**
 * Editorial copy. DRAFT, written without factual claims: no founding dates, founders,
 * sourcing partners, awards or quotations. Replace with the owner's verified story when
 * supplied. Keep sentences short and in the café's voice.
 */

export const homeContent = {
  heroTitle: 'Every cup, a small canvas.',
  heroLead: 'Coffee, tea, mocktails and comfort food in Belda, West Bengal. Order to your door, or ask for a table and stay a while.',
  menuTitle: 'From the first chai to the last mojito',
  menuLead: 'Twelve sections, one page. Browse it all, then order for delivery.',
  reserveTitle: 'Keep a table for us',
  reserveBody: 'Send a table request for the day and time you would like. The café will get back to you to confirm.',
  visitTitle: 'Find us in Belda',
  /** Describes what is visible in the owner's own video of the café. */
  visitLead: 'Painted masks, a village mural, lantern light and walls full of art. Come in, take a seat and look around.',
};

export const signatureContent = {
  title: 'Five moments in a glass',
  lead: 'A glass of ice, then coffee. Watch an iced coffee come together as you scroll.',
  steps: [
    { title: 'The glass', body: 'A clear glass, filled to the brim with ice.' },
    { title: 'The first pour', body: 'Coffee meets the ice in one slow, steady line.' },
    { title: 'Through the ice', body: 'It runs down between the cubes, turning amber as it goes.' },
    { title: 'Filling up', body: 'The glass darkens from the bottom while the ice rises and shifts.' },
    { title: 'Iced coffee', body: 'Dark, cold and crowned with a light foam. Ready.' },
  ],
}

export const storyContent = {
  title: 'Our Story',
  lead: 'A coffee house built around a simple idea: good cups, good food and time to enjoy them.',
  chapters: [
    {
      heading: 'The idea',
      body: [
        'A canvas is a place where something is about to happen. We like to think of a table the same way: two cups, a plate between them, and a conversation that has not started yet.',
        'Canvas O Coffee brings that feeling to Belda: a warm room, a considered menu, and nobody hurrying you out of your chair.',
      ],
    },
    {
      heading: 'Coffee and comfort food',
      body: [
        'The menu moves from tea and coffee to momos, pizzas, burgers and fried plates, then finishes with desserts and mocktails. It is made for every kind of visit, from a quick cup to a long evening with friends.',
      ],
    },
    {
      heading: 'The room',
      body: ['Wood, warm light and space to sit. Come in for a cup, stay for a second one.'],
    },
  ],
};

/** General coffee botany. It makes no claim about the café's own beans or sourcing. */
export const cherryToCup = {
  title: 'Before the cup',
  lead: 'Every coffee bean starts as the seed of a small red fruit.',
  stages: [
    { title: 'The cherry', body: 'Coffee grows as cherries on a glossy-leaved shrub. They ripen from green to deep red.' },
    { title: 'Two seeds', body: 'Inside each cherry, usually, are two seeds pressed flat against each other.' },
    { title: 'Green beans', body: 'Once the fruit is removed and the seeds are dried, they are pale green and hard.' },
    { title: 'Roasted', body: 'Roasting turns them brown and develops the aroma we know as coffee.' },
  ],
};

export const readingCorner = {
  title: 'Reading Corner',
  lead: 'A quiet page in a busy day.',
  journal: [
    'Some afternoons ask for nothing more than a chair by the window, a cup going slowly cold and a book you have been meaning to finish.',
    'The Reading Corner is our small shelf on this website: notes from the café, and books worth a second cup. We will add to it from time to time.',
  ],
  /**
   * Owner-curated recommendations. Add entries as { title, author, note }.
   * Only add quotations with a verified source.
   */
  recommendations: [] as Array<{ title: string; author: string; note?: string }>,
};

export const whisperContent = {
  title: 'The Whisper Box',
  lead: 'A thought, a suggestion, a kind word or a complaint. Leave it here and it goes straight to the café.',
  privacy:
    'Your name and contact are optional. Add them only if you would like a reply. Messages are read by the café team and are not published.',
  privacyWhatsApp:
    'Your note opens in WhatsApp, addressed to the café, and is sent from your own number. Name and contact are optional. Messages are read by the café team and are not published.',
};
