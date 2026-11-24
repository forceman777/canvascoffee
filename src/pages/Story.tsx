import { ImageSlot, Picture } from '../components/common/ImageSlot';
import { Botanical } from '../components/common/Botanical';
import { ButtonLink } from '../components/common/Button';
import { Ornament } from '../components/common/bits';
import { Reveal } from '../components/motion/Reveal';
import { IcedLatteSequence } from '../components/motion/IcedLatteSequence';
import { cherryToCup, readingCorner, storyContent } from '../data/siteContent';
import { hasImage, imageFiles, publicPath } from '../data/images';
import { useDocumentTitle } from '../hooks';

/** Simple drawn stand-ins for the four botanical stages (until BOT-04 is supplied). */
function StageGlyph({ stage }: { stage: number }) {
  const line = 'var(--walnut)';
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      {stage === 0 && (
        <g>
          <path d="M60 18 C 58 30, 58 38, 60 46" stroke={line} strokeWidth="1.4" fill="none" />
          <path d="M60 30 C 72 18, 92 16, 104 24 C 90 34, 74 36, 60 30 Z" fill="var(--forest)" fillOpacity=".8" stroke={line} strokeWidth=".8" />
          <circle cx="60" cy="72" r="26" fill="#7a2533" stroke={line} strokeWidth="1" />
          <circle cx="50" cy="62" r="7" fill="#fff" opacity=".3" />
        </g>
      )}
      {stage === 1 && (
        <g>
          <circle cx="60" cy="62" r="34" fill="#7a2533" stroke={line} strokeWidth="1" />
          <circle cx="60" cy="62" r="27" fill="#e9dcae" stroke={line} strokeWidth=".8" />
          <path d="M60 38 V 86" stroke={line} strokeWidth="1.2" />
          <ellipse cx="48" cy="62" rx="10" ry="20" fill="#cdbf86" stroke={line} strokeWidth=".8" />
          <ellipse cx="72" cy="62" rx="10" ry="20" fill="#cdbf86" stroke={line} strokeWidth=".8" />
        </g>
      )}
      {(stage === 2 || stage === 3) && (
        <g>
          {[
            [44, 58, -18],
            [76, 66, 22],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <ellipse rx="17" ry="24" fill={stage === 2 ? '#b9b98a' : '#5a3a24'} stroke={line} strokeWidth="1" />
              <path d="M0 -20 C -6 -6, 6 6, 0 20" stroke={stage === 2 ? '#7d7a52' : '#2c1a10'} strokeWidth="1.6" fill="none" />
              <ellipse cx="-6" cy="-9" rx="4" ry="7" fill="#fff" opacity={stage === 2 ? 0.25 : 0.18} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

function Stage({ index }: { index: number }) {
  const sheet = hasImage('BOT-04') ? imageFiles('BOT-04') : null;
  return (
    <div className="stage__art">
      {sheet ? (
        // The 4:1 sheet is cropped to one square cell per stage, so no slicing is needed.
        <img src={publicPath(sheet.fallback)} alt="" style={{ width: '400%', maxWidth: 'none', transform: `translateX(-${index * 25}%)` }} loading="lazy" />
      ) : (
        <StageGlyph stage={index} />
      )}
    </div>
  );
}

/** Real media for this page, when supplied. The illustrated plate (BOT-04) still wins for the stages. */
const originPhoto = hasImage('STORY-02') && !hasImage('BOT-04');
const foodDuo = (() => {
  const tray = imageFiles('PLATE-01');
  const glass = imageFiles('SLIDE-02');
  return tray && glass ? { tray, glass } : null;
})();

/** "The room" adapts to a portrait photo (the pendant-lamp photo stands in until a wide one arrives). */
const roomRatio = imageFiles('ATM-01')?.ratio;
const roomPortrait = Boolean(roomRatio && roomRatio[0] < roomRatio[1]);

export default function Story() {
  useDocumentTitle('Our Story');
  const [idea, food, room] = storyContent.chapters;
  return (
    <div className="story-page">
      <header className="story-hero textured surface-parchment">
        <Botanical variant="vertical" className="story-hero__sprig" />
        <div className="container story-hero__grid">
          <div className="story-hero__text">
            <h1 className="page-title">{storyContent.title}</h1>
            <p className="page-lead">{storyContent.lead}</p>
          </div>
          <Reveal kind="unveil" className="story-hero__media">
            <ImageSlot id="STORY-01" priority sizes="(min-width: 64rem) 38vw, 90vw" />
          </Reveal>
        </div>
      </header>

      <section className="story-chapter surface-ivory" aria-labelledby="ch-idea">
        <div className="container story-chapter__grid">
          <h2 id="ch-idea" className="section-title story-chapter__heading">
            {idea.heading}
          </h2>
          <div className="story-chapter__body">
            {idea.body.map((p, i) => (
              <p key={i} className={`prose-serif ${i === 0 ? 'prose-serif--lede' : ''}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <IcedLatteSequence nextId="cherry" />

      <section id="cherry" className="cherry surface-parchment textured" aria-labelledby="cherry-title">
        <div className="container">
          <Reveal className="cherry__header">
            <Ornament />
            <h2 id="cherry-title" className="section-title">
              {cherryToCup.title}
            </h2>
            <p className="section-lead">{cherryToCup.lead}</p>
          </Reveal>
          {originPhoto ? (
            // Real photo of beans and cherries beside the four stages as a timeline.
            <div className="cherry__photo-layout">
              <Reveal kind="unveil" className="cherry__photo">
                <ImageSlot id="STORY-02" sizes="(min-width: 52rem) 50vw, 92vw" />
              </Reveal>
              <Reveal kind="fade" className="timeline-reveal">
              <ol className="cherry__timeline" role="list">
                {cherryToCup.stages.map((s, i) => (
                  <li key={s.title} className="timeline-step" style={{ '--i': i } as React.CSSProperties}>
                    <span className="timeline-step__num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="stage__title">{s.title}</h3>
                      <p className="stage__body">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              </Reveal>
            </div>
          ) : (
            <>
              <ol className="cherry__stages" role="list">
                {cherryToCup.stages.map((s, i) => (
                  <li key={s.title} className="stage">
                    <Stage index={i} />
                    <h3 className="stage__title">{s.title}</h3>
                    <p className="stage__body">{s.body}</p>
                  </li>
                ))}
              </ol>
              {!hasImage('BOT-04') && <p className="cherry__pending">Drawings shown are interim. The illustrated plate (BOT-04) will replace them.</p>}
            </>
          )}
        </div>
      </section>

      <section className="story-split surface-walnut grain on-dark" aria-labelledby="ch-food">
        <div className="container story-split__grid">
          {foodDuo ? (
            // Real product shots: a momo tray with an iced mocha alongside.
            <Reveal kind="rise" className="story-duo">
              <div className="story-duo__glow" aria-hidden="true" />
              <div className="story-duo__tray">
                <Picture image={foodDuo.tray} sizes="(min-width: 64rem) 34vw, 72vw" alt={foodDuo.tray.alt} />
              </div>
              <div className="story-duo__glass">
                <Picture image={foodDuo.glass} sizes="(min-width: 64rem) 14vw, 30vw" alt={foodDuo.glass.alt} />
              </div>
            </Reveal>
          ) : (
            <Reveal kind="unveil" className="story-split__media">
              <ImageSlot id="STORY-02" sizes="(min-width: 64rem) 50vw, 90vw" />
            </Reveal>
          )}
          <div className="story-split__text">
            <h2 id="ch-food" className="section-title">
              {food.heading}
            </h2>
            {food.body.map((p, i) => (
              <p key={i} className="prose-serif">
                {p}
              </p>
            ))}
            <ButtonLink to="/menu" variant="secondary" onDark>
              Read the menu
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="story-room surface-ivory" aria-labelledby="ch-room">
        <div className={`container story-room__grid ${roomPortrait ? 'story-room__grid--portrait' : ''}`}>
          <div className="story-room__text">
            <h2 id="ch-room" className="section-title">
              {room.heading}
            </h2>
            {room.body.map((p, i) => (
              <p key={i} className="prose-serif">
                {p}
              </p>
            ))}
            <ButtonLink to="/reservations" variant="quiet">
              Request a table
            </ButtonLink>
          </div>
          <Reveal kind="unveil" className="story-room__media">
            <ImageSlot id="ATM-01" sizes={roomPortrait ? '(min-width: 52rem) 26rem, 90vw' : '(min-width: 64rem) 55vw, 90vw'} />
          </Reveal>
        </div>
      </section>

      {/* ---------- Reading Corner ---------- */}
      <section id="reading-corner" className="reading surface-ink grain on-dark" aria-labelledby="reading-title">
        <div className="container reading__grid">
          <div className="reading__media">
            <ImageSlot id="READ-01" sizes="(min-width: 64rem) 45vw, 90vw" />
          </div>
          <div className="reading__text">
            <h2 id="reading-title" className="section-title">
              {readingCorner.title}
            </h2>
            <p className="reading__lead">{readingCorner.lead}</p>
            {readingCorner.journal.map((p, i) => (
              <p key={i} className="prose-serif">
                {p}
              </p>
            ))}
            {readingCorner.recommendations.length > 0 && (
              <ul role="list" className="reading__list">
                {readingCorner.recommendations.map((r) => (
                  <li key={r.title}>
                    <cite>{r.title}</cite> <span>by {r.author}</span>
                    {r.note && <p>{r.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
