// Three combat-layout proposals for Dungeon Debt.
//
// Same scene in every variant:
//   Enemies — front: frugal_guard, greedy_tank
//             back:  frugal_archer, goblin_thief (dead), frugal_healer
//   Heroes  — front: warrior (acting), knight
//             back:  priest, wizard, ranger
//
// The goal is unit-art legibility: in the current build every sprite is
// crammed into a ~150×102 card, so the art reads as a postage stamp. Each
// variant below trades chrome for sprite size in a different way.

// ---------- shared scene data ----------------------------------------------

const ROLE_COLOR = {
  Tank:    'rgb(79, 115, 158)',
  Damage:  'rgb(184, 51, 61)',
  Support: 'rgb(77, 153, 92)',
  Economy: 'rgb(199, 158, 51)',
  Enemy:   'rgb(163, 79, 74)',
};

const SCENE = {
  enemyBack: [
    { id: 'frugal_archer', name: 'Frugal Archer', role: 'Enemy', hp: 3, max: 4 },
    { id: 'goblin_thief',  name: 'Goblin Thief',  role: 'Enemy', hp: 0, max: 4, dead: true },
    { id: 'frugal_healer', name: 'Frugal Healer', role: 'Enemy', hp: 4, max: 4 },
  ],
  enemyFront: [
    { id: 'frugal_guard',  name: 'Frugal Guard',  role: 'Enemy', hp: 5, max: 8 },
    { id: 'greedy_tank',   name: 'Greedy Tank',   role: 'Enemy', hp: 9, max: 12, target: true },
  ],
  heroFront: [
    { id: 'warrior', name: 'Warrior', role: 'Tank',    hp: 6, max: 8,  acting: true },
    { id: 'knight',  name: 'Knight',  role: 'Tank',    hp: 10, max: 10 },
  ],
  heroBack: [
    { id: 'priest',  name: 'Priest',  role: 'Support', hp: 5, max: 5 },
    { id: 'wizard',  name: 'Wizard',  role: 'Damage',  hp: 3, max: 4 },
    { id: 'ranger',  name: 'Ranger',  role: 'Damage',  hp: 5, max: 5 },
  ],
};

const LOG_LINES = [
  'Round 3 — Frugal Patrol',
  'Knight braces. (First backline hit will redirect)',
  'Warrior attacks Greedy Tank for 2.',
  'Wizard hurls fireball at Goblin Thief for 4.',
  'Goblin Thief dies.',
  'Frugal Archer attacks Wizard for 1.',
];

// ---------- shared primitives ----------------------------------------------

function spriteSrc(side, id) {
  return side === 'enemy' ? `art/enemies/${id}.png` : `art/heroes/${id}.png`;
}

// HP pill — short, bold, with text overlay. Always 24px tall so number reads.
function HpBar({ hp, max, width = 120, height = 22, dead = false }) {
  const ratio = max > 0 ? Math.max(0, hp / max) : 0;
  let fill = '#54b86a';            // healthy
  if (ratio <= 0.5)  fill = '#e0b246';  // wounded
  if (ratio <= 0.25) fill = '#d35046';  // critical
  if (dead)           fill = '#5a2424';
  return (
    <div style={{
      width, height,
      background: '#0a0c10',
      border: '1.5px solid #000',
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 0 rgba(0,0,0,0.5)',
    }}>
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: `${ratio * 100}%`,
        background: `linear-gradient(180deg, ${fill}, ${shade(fill, -0.15)})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inconsolata, ui-monospace, monospace',
        fontSize: height >= 22 ? 13 : 11,
        fontWeight: 700,
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.9)',
        letterSpacing: '0.04em',
      }}>
        {dead ? 'DOWN' : `${hp} / ${max}`}
      </div>
    </div>
  );
}

function shade(hex, amt) {
  // amt < 0 darkens; cheap approximation
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (amt < 0 ? r * amt : (255 - r) * amt));
    g = Math.round(g + (amt < 0 ? g * amt : (255 - g) * amt));
    b = Math.round(b + (amt < 0 ? b * amt : (255 - b) * amt));
    return `rgb(${r},${g},${b})`;
  }
  return hex;
}

// The top-of-screen run header — kept identical across variants.
function RunHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 36px',
      background: '#11131a',
      borderBottom: '1px solid #262936',
      height: 56,
      flex: '0 0 auto',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Stat label="ROUND" value="3 / 10" />
        <Stat label="GOLD" value="73" tone="#e7c560" />
        <Stat label="DEBT" value="0" tone="#9aa3b2" />
        <Stat label="MORALE" value="24 / 30" tone="#7ab877" />
      </div>
      <div style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontWeight: 600, fontSize: 26, color: '#e9d59a',
        letterSpacing: '0.06em',
      }}>DUNGEON DEBT</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, color: '#9aa3b2', textTransform: 'uppercase',
        letterSpacing: '0.18em',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d35046' }} />
        Auto-combat
      </div>
    </div>
  );
}

function Stat({ label, value, tone = '#e8e6df' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.22em', color: '#7a8294', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: tone, fontFamily: 'Inconsolata, ui-monospace, monospace' }}>{value}</span>
    </div>
  );
}

// Compact bottom combat log — shared across variants.
function CombatLogStrip() {
  return (
    <div style={{
      flex: '0 0 auto',
      background: '#11131a',
      borderTop: '1px solid #262936',
      padding: '12px 36px',
      fontFamily: 'Inconsolata, ui-monospace, monospace',
      fontSize: 14, color: '#cfd3dc',
      display: 'flex', gap: 18, alignItems: 'center',
      height: 48,
    }}>
      <span style={{
        fontSize: 10, letterSpacing: '0.22em', color: '#7a8294',
        textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
      }}>Combat Log</span>
      <span style={{ color: '#7a8294' }}>›</span>
      <span style={{ color: '#cfd3dc' }}>{LOG_LINES[LOG_LINES.length - 2]}</span>
      <span style={{ color: '#7a8294' }}>›</span>
      <span style={{ color: '#fff', fontWeight: 600 }}>{LOG_LINES[LOG_LINES.length - 1]}</span>
    </div>
  );
}

// ---------- VARIANT A — Battle Stage ---------------------------------------
//
// Two horizontal stages (enemy on top, hero on bottom). Sprites stand on a
// ground line; back row is offset upward and slightly smaller so depth reads
// at a glance. HP pill sits just below the feet. No card chrome.

function VariantBattleStage() {
  return (
    <div style={{
      width: 1920, height: 1080, background: '#0e1015',
      display: 'flex', flexDirection: 'column',
      color: '#e8e6df', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <RunHeader />

      {/* the stage */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* dungeon backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 50% 30%, rgba(120,30,30,0.18), transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 90%, rgba(20,30,55,0.6), transparent 70%),
            linear-gradient(180deg, #15171e 0%, #1b1d27 45%, #131419 100%)
          `,
        }} />
        {/* center separator — dungeon corridor depth */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 2, transform: 'translateY(-1px)',
          background: 'linear-gradient(90deg, transparent, rgba(193,154,62,0.35) 30%, rgba(193,154,62,0.35) 70%, transparent)',
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          letterSpacing: '0.4em', fontSize: 13, color: '#5a6276',
          padding: '4px 16px', background: '#0e1015',
        }}>VS</div>

        <Stage side="enemy" front={SCENE.enemyFront} back={SCENE.enemyBack} flip />
        <Stage side="hero"  front={SCENE.heroFront}  back={SCENE.heroBack} />
      </div>

      <CombatLogStrip />
    </div>
  );
}

// One half of the battle stage. Back row is shown smaller (0.78× scale) and
// pushed toward the centerline to create depth; front row stands at the
// outer edge, larger, where the fighting happens.
function Stage({ side, front, back, flip }) {
  const isEnemy = side === 'enemy';
  // For the top (enemy) half the front row sits LOWER (closer to center).
  // For the bottom (hero) half the front row sits HIGHER (closer to center).
  // Back row always further from the center → reads as "behind".
  const topHalf = isEnemy;

  // Ground-line y as percent within the half-stage. Two ground lines per
  // half: one for back row (farther from center) and one for front row
  // (closer to center). Sprites stand on these.
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: topHalf ? 0 : '50%',
      height: '50%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: topHalf ? '34px 0 28px' : '28px 0 34px',
    }}>
      {/* side label */}
      <div style={{
        position: 'absolute',
        top: topHalf ? 18 : 'auto',
        bottom: topHalf ? 'auto' : 18,
        left: 36,
        fontSize: 11, letterSpacing: '0.28em', color: isEnemy ? '#c97c79' : '#7ab8a1',
        textTransform: 'uppercase', fontWeight: 600,
      }}>
        {isEnemy ? 'Enemies — Frugal Patrol' : 'Your Party'}
      </div>

      {/* back row, smaller */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 60,
        order: topHalf ? 0 : 1,
      }}>
        {back.map((u, i) => (
          <BattleFigure key={i} unit={u} side={side} flip={flip} scale={0.78} />
        ))}
      </div>

      {/* front row, larger, closer to the centerline */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 96,
        order: topHalf ? 1 : 0,
      }}>
        {front.map((u, i) => (
          <BattleFigure key={i} unit={u} side={side} flip={flip} scale={1.0} />
        ))}
      </div>
    </div>
  );
}

function BattleFigure({ unit, side, flip, scale }) {
  // Sprite sized off a generous 320px base; back-row gets 0.78× → ~250px.
  const SIZE = 320 * scale;
  const accent = ROLE_COLOR[unit.role] || ROLE_COLOR.Enemy;
  return (
    <div style={{
      width: SIZE, height: SIZE + 60,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative',
    }}>
      {/* ground shadow / acting glow */}
      <div style={{
        position: 'absolute',
        bottom: 52,
        width: SIZE * 0.65, height: SIZE * 0.14,
        borderRadius: '50%',
        background: unit.acting
          ? 'radial-gradient(ellipse, rgba(255,210,90,0.55), rgba(255,210,90,0) 70%)'
          : unit.target
          ? 'radial-gradient(ellipse, rgba(220,80,80,0.45), rgba(220,80,80,0) 70%)'
          : 'radial-gradient(ellipse, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)',
        filter: unit.acting ? 'blur(2px)' : 'none',
      }} />

      {/* sprite */}
      <div style={{
        width: SIZE, height: SIZE,
        position: 'relative',
        opacity: unit.dead ? 0.35 : 1,
        filter: unit.dead ? 'grayscale(0.9) brightness(0.5)' : 'none',
      }}>
        <img
          src={spriteSrc(side, unit.id)}
          alt={unit.name}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
            transform: flip ? 'scaleX(-1) translateY(8px)' : 'translateY(8px)',
            imageRendering: 'pixelated',
            filter: unit.acting
              ? 'drop-shadow(0 0 18px rgba(255,210,90,0.75))'
              : unit.target
              ? 'drop-shadow(0 0 14px rgba(220,80,80,0.55))'
              : 'drop-shadow(0 6px 8px rgba(0,0,0,0.55))',
          }}
        />
        {unit.dead && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64, color: '#d35046', fontWeight: 900,
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
          }}>✕</div>
        )}
      </div>

      {/* nameplate + hp */}
      <div style={{
        position: 'absolute', bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#dfe2ea', fontWeight: 700,
          padding: '2px 10px',
          background: '#15171e',
          borderLeft: `3px solid ${accent}`,
        }}>
          {unit.name}
        </div>
        <HpBar hp={unit.hp} max={unit.max} dead={unit.dead}
               width={Math.round(SIZE * 0.55)} height={20} />
      </div>
    </div>
  );
}

// ---------- VARIANT B — Tall Portrait Cards --------------------------------
//
// Keeps the four-row grid the team already wired up, but flips each card to
// portrait (220 × 320). Art now claims ~80% of the card; name and HP shrink
// to a slim footer. Same UI vocabulary as the current build — minimum code
// change to ship.

function VariantPortraitCards() {
  return (
    <div style={{
      width: 1920, height: 1080, background: '#0e1015',
      display: 'flex', flexDirection: 'column',
      color: '#e8e6df', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <RunHeader />

      <div style={{
        flex: 1, padding: '28px 60px', display: 'flex',
        flexDirection: 'column', gap: 18, position: 'relative',
        background: '#15171e',
      }}>
        <PortraitRow label="ENEMY BACK"  side="enemy" units={SCENE.enemyBack}  slots={3} />
        <PortraitRow label="ENEMY FRONT" side="enemy" units={SCENE.enemyFront} slots={2} bordered />
        <div style={{
          height: 1, background: 'linear-gradient(90deg, transparent, rgba(193,154,62,0.5), transparent)',
          margin: '4px 0',
        }} />
        <PortraitRow label="HERO FRONT"  side="hero"  units={SCENE.heroFront}  slots={2} bordered />
        <PortraitRow label="HERO BACK"   side="hero"  units={SCENE.heroBack}   slots={3} />
      </div>

      <CombatLogStrip />
    </div>
  );
}

function PortraitRow({ label, side, units, slots, bordered }) {
  // Build a fixed-slot layout (centred), like the existing CombatPanelView
  // RefreshFixedRow. Empty slots render as faint outlines.
  const cells = Array.from({ length: slots }).map((_, i) => units[i] || null);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24, flex: 1, minHeight: 0,
    }}>
      <div style={{
        width: 110,
        fontSize: 11, letterSpacing: '0.22em', color: '#7a8294',
        textTransform: 'uppercase', fontWeight: 700,
      }}>{label}</div>

      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center', gap: 24,
      }}>
        {cells.map((u, i) => u
          ? <PortraitCard key={i} unit={u} side={side} bordered={bordered} />
          : <EmptySlot key={i} />)}
      </div>
    </div>
  );
}

function PortraitCard({ unit, side, bordered }) {
  const accent = ROLE_COLOR[unit.role] || ROLE_COLOR.Enemy;
  const isEnemy = side === 'enemy';
  return (
    <div style={{
      width: 200, height: 280,
      background: unit.dead ? '#2a1414' : '#1d2028',
      border: unit.acting
        ? '3px solid rgb(255,210,90)'
        : `2px solid ${isEnemy ? '#3a2424' : '#2a2f3b'}`,
      borderRadius: 6,
      boxShadow: unit.acting
        ? '0 0 24px rgba(255,210,90,0.4), inset 0 0 0 1px rgba(255,210,90,0.3)'
        : '0 4px 0 rgba(0,0,0,0.4)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* role band */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
        background: accent,
      }} />

      {/* sprite area — claims the top 78% */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: isEnemy
          ? 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(60,20,20,0.6), transparent)'
          : 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(20,30,55,0.5), transparent)',
      }}>
        <img
          src={spriteSrc(side, unit.id)}
          alt={unit.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            padding: '8px 6px 0',
            boxSizing: 'border-box',
            transform: isEnemy ? 'scaleX(-1)' : 'none',
            imageRendering: 'pixelated',
            opacity: unit.dead ? 0.3 : 1,
            filter: unit.dead ? 'grayscale(0.9) brightness(0.5)' :
                   unit.acting ? 'drop-shadow(0 0 10px rgba(255,210,90,0.55))' : 'none',
          }}
        />
        {unit.dead && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64, color: '#d35046', fontWeight: 900,
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
          }}>✕</div>
        )}
        {unit.target && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
            color: '#0e1015', background: '#e0b246',
            padding: '2px 6px', borderRadius: 2,
          }}>TARGET</div>
        )}
      </div>

      {/* footer: name + hp */}
      <div style={{
        padding: '8px 10px 10px', background: 'rgba(0,0,0,0.35)',
        borderTop: `1px solid ${accent}`,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#e8e6df', fontWeight: 700,
        }}>{unit.name}</div>
        <HpBar hp={unit.hp} max={unit.max} dead={unit.dead} width="100%" height={18} />
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div style={{
      width: 200, height: 280,
      border: '2px dashed #2a2f3b',
      borderRadius: 6,
      opacity: 0.4,
    }} />
  );
}

// ---------- VARIANT C — Arena (left vs right) ------------------------------
//
// Enemies on the left, heroes on the right, facing each other. Each side
// has back column (3 deep) plus a front column (2 deep) that pushes toward
// the centerline. Mid-screen is reserved for the active attack — log moves
// into a sidebar for breathing room.

function VariantArena() {
  return (
    <div style={{
      width: 1920, height: 1080, background: '#0e1015',
      display: 'flex', flexDirection: 'column',
      color: '#e8e6df', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <RunHeader />

      <div style={{
        flex: 1, display: 'flex', position: 'relative',
        background: `
          radial-gradient(ellipse 80% 80% at 50% 50%, rgba(193,154,62,0.05), transparent 60%),
          linear-gradient(180deg, #15171e, #0f1116)
        `,
      }}>
        <ArenaSide side="enemy" back={SCENE.enemyBack} front={SCENE.enemyFront} label="Frugal Patrol" align="left" />

        {/* centerline */}
        <div style={{
          width: 2, background: 'linear-gradient(180deg, transparent, rgba(193,154,62,0.4) 20%, rgba(193,154,62,0.4) 80%, transparent)',
        }} />

        <ArenaSide side="hero" back={SCENE.heroBack} front={SCENE.heroFront} label="Your Party" align="right" />
      </div>

      <CombatLogStrip />
    </div>
  );
}

function ArenaSide({ side, back, front, label, align }) {
  // Layout: a back COLUMN (3 stacked) and a front COLUMN (2 stacked).
  // Back column sits at the outer edge, front pushes toward the centerline.
  const isEnemy = side === 'enemy';
  const flip = align === 'right'; // heroes flip to face enemies on the left

  return (
    <div style={{
      flex: 1, position: 'relative',
      display: 'flex',
      flexDirection: align === 'left' ? 'row' : 'row-reverse',
      padding: '40px 60px',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      gap: 40,
    }}>
      {/* side label */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: align === 'left' ? 60 : 'auto',
        right: align === 'right' ? 60 : 'auto',
        fontSize: 12, letterSpacing: '0.28em',
        color: isEnemy ? '#c97c79' : '#7ab8a1',
        textTransform: 'uppercase', fontWeight: 700,
      }}>{label}</div>

      {/* back column — outer */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: align === 'left' ? 'flex-start' : 'flex-end',
        gap: 14,
        paddingTop: 40,
      }}>
        {back.map((u, i) => (
          <ArenaFigure key={i} unit={u} side={side} flip={flip} scale={0.85} align={align} />
        ))}
      </div>

      {/* front column — inner, slightly larger */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: align === 'left' ? 'flex-end' : 'flex-start',
        gap: 30,
        paddingTop: 60,
      }}>
        {front.map((u, i) => (
          <ArenaFigure key={i} unit={u} side={side} flip={flip} scale={1.05} align={align} />
        ))}
      </div>
    </div>
  );
}

function ArenaFigure({ unit, side, flip, scale, align }) {
  const SIZE = 220 * scale;
  const accent = ROLE_COLOR[unit.role] || ROLE_COLOR.Enemy;
  return (
    <div style={{
      width: SIZE + 180, height: SIZE,
      display: 'flex',
      flexDirection: align === 'left' ? 'row' : 'row-reverse',
      alignItems: 'center', gap: 14,
    }}>
      {/* sprite + plate */}
      <div style={{ width: SIZE, height: SIZE, position: 'relative' }}>
        {/* ground oval */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: SIZE * 0.7, height: SIZE * 0.12,
          borderRadius: '50%',
          background: unit.acting
            ? 'radial-gradient(ellipse, rgba(255,210,90,0.5), rgba(255,210,90,0) 70%)'
            : 'radial-gradient(ellipse, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)',
        }} />
        <img
          src={spriteSrc(side, unit.id)}
          alt={unit.name}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
            transform: flip ? 'scaleX(-1)' : 'none',
            imageRendering: 'pixelated',
            opacity: unit.dead ? 0.32 : 1,
            filter: unit.dead ? 'grayscale(0.9) brightness(0.5)' :
                   unit.acting ? 'drop-shadow(0 0 16px rgba(255,210,90,0.7))' :
                   'drop-shadow(0 6px 8px rgba(0,0,0,0.55))',
          }}
        />
        {unit.dead && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52, color: '#d35046', fontWeight: 900,
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
          }}>✕</div>
        )}
      </div>

      {/* side info plate */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        minWidth: 160,
        textAlign: align === 'left' ? 'left' : 'right',
        alignItems: align === 'left' ? 'flex-start' : 'flex-end',
      }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#dfe2ea', fontWeight: 700,
          paddingLeft:  align === 'left'  ? 8 : 0,
          paddingRight: align === 'right' ? 8 : 0,
          borderLeft:  align === 'left'  ? `3px solid ${accent}` : 'none',
          borderRight: align === 'right' ? `3px solid ${accent}` : 'none',
        }}>{unit.name}</div>
        <div style={{
          fontSize: 10, letterSpacing: '0.18em', color: accent, fontWeight: 600,
        }}>{unit.role.toUpperCase()}</div>
        <HpBar hp={unit.hp} max={unit.max} dead={unit.dead} width={150} height={22} />
      </div>
    </div>
  );
}

// ---------- export ---------------------------------------------------------

Object.assign(window, {
  VariantBattleStage,
  VariantPortraitCards,
  VariantArena,
});
