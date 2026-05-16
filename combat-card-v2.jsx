// Combat-card v2 — three close-cousin riffs on Variant B (Tall Portrait
// Cards). All three keep the existing CombatUnitCardView vocabulary
// (role band on left, name + HP track, acting/dead/tier states); they
// differ only in where the name lives and how much chrome surrounds the
// sprite. Use the Tweaks panel to size the card before porting back to
// CombatUnitCardView.cs.

const V2_ROLE_COLOR = {
  Tank:    'rgb(79, 115, 158)',
  Damage:  'rgb(184, 51, 61)',
  Support: 'rgb(77, 153, 92)',
  Economy: 'rgb(199, 158, 51)',
  Enemy:   'rgb(163, 79, 74)',
};

// Mid-combat showcase: hits low/mid/full HP, an acting unit, a dead unit,
// a marked target.
const V2_SCENE = {
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
    { id: 'warrior', name: 'Warrior', role: 'Tank',    hp: 6, max: 8,  acting: true, tier: 'silver' },
    { id: 'knight',  name: 'Knight',  role: 'Tank',    hp: 10, max: 10, tier: 'bronze' },
  ],
  heroBack: [
    { id: 'priest',  name: 'Priest',  role: 'Support', hp: 5, max: 5,  tier: 'bronze' },
    { id: 'wizard',  name: 'Wizard',  role: 'Damage',  hp: 3, max: 4,  tier: 'silver' },
    { id: 'ranger',  name: 'Ranger',  role: 'Damage',  hp: 5, max: 5,  tier: 'bronze' },
  ],
};

const V2_TIER_COLOR = {
  bronze: 'rgb(183, 115, 51)',
  silver: 'rgb(209, 214, 224)',
};

function v2SpriteSrc(side, id) {
  return side === 'enemy' ? `art/enemies/${id}.png` : `art/heroes/${id}.png`;
}

// ── tiny shared primitives ─────────────────────────────────────────────────

function V2HpBar({ hp, max, dead, height = 20, fontSize = 12 }) {
  const ratio = max > 0 ? Math.max(0, hp / max) : 0;
  let fill = '#54b86a';
  if (ratio <= 0.5)  fill = '#e0b246';
  if (ratio <= 0.25) fill = '#d35046';
  if (dead)          fill = '#5a2424';
  return (
    <div style={{
      width: '100%', height,
      background: '#0a0c10',
      border: '1.5px solid #000',
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${ratio * 100}%`,
        background: `linear-gradient(180deg, ${fill}, ${v2Shade(fill, -0.18)})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inconsolata, ui-monospace, monospace',
        fontWeight: 700, fontSize, color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.9)',
        letterSpacing: '0.04em',
      }}>
        {dead ? 'DOWN' : `${hp} / ${max}`}
      </div>
    </div>
  );
}

function v2Shade(c, amt) {
  if (c.startsWith('#')) {
    const n = parseInt(c.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (amt < 0 ? r * amt : (255 - r) * amt));
    g = Math.round(g + (amt < 0 ? g * amt : (255 - g) * amt));
    b = Math.round(b + (amt < 0 ? b * amt : (255 - b) * amt));
    return `rgb(${r},${g},${b})`;
  }
  return c;
}

// ── three card styles ──────────────────────────────────────────────────────
// Shared shell (background, role band, tier border, acting outline, dead
// tint); the `style` prop swaps the inner content layout only.

function CardShell({ unit, side, w, h, roleBand, children }) {
  const accent = V2_ROLE_COLOR[unit.role] || V2_ROLE_COLOR.Enemy;
  const tierColor = unit.tier ? V2_TIER_COLOR[unit.tier] : null;
  return (
    <div style={{
      width: w, height: h,
      background: unit.dead ? '#2a1414' : '#1d2028',
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: unit.acting
        ? '0 0 0 3px rgb(255,210,90), 0 0 24px rgba(255,210,90,0.35)'
        : tierColor
        ? `inset 0 0 0 2px ${tierColor}, 0 4px 0 rgba(0,0,0,0.4)`
        : '0 4px 0 rgba(0,0,0,0.4)',
    }}>
      {/* role band */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: roleBand, background: accent,
        zIndex: 2,
      }} />
      {children}
    </div>
  );
}

function SpriteArea({ unit, side, padLeft, isEnemy, showTargetTag }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingLeft: padLeft,
      boxSizing: 'border-box',
    }}>
      {/* atmospheric vignette so the sprite reads against the panel bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isEnemy
          ? 'radial-gradient(ellipse 80% 65% at 50% 80%, rgba(70,22,22,0.6), transparent 70%)'
          : 'radial-gradient(ellipse 80% 65% at 50% 80%, rgba(20,32,55,0.55), transparent 70%)',
      }} />
      <img
        src={v2SpriteSrc(side, unit.id)}
        alt={unit.name}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain',
          padding: '6px 4px 0',
          boxSizing: 'border-box',
          transform: isEnemy ? 'scaleX(-1)' : 'none',
          imageRendering: 'pixelated',
          opacity: unit.dead ? 0.32 : 1,
          filter: unit.dead
            ? 'grayscale(0.9) brightness(0.5)'
            : unit.acting
            ? 'drop-shadow(0 0 12px rgba(255,210,90,0.55))'
            : 'drop-shadow(0 4px 6px rgba(0,0,0,0.55))',
        }}
      />
      {unit.dead && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72, color: '#d35046', fontWeight: 900,
          textShadow: '0 2px 6px rgba(0,0,0,0.9)',
        }}>✕</div>
      )}
      {showTargetTag && unit.target && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
          color: '#0e1015', background: '#e0b246',
          padding: '2px 5px', borderRadius: 2,
          fontFamily: 'Inter, sans-serif',
        }}>TARGET</div>
      )}
    </div>
  );
}

// B1 — name + HP in a footer strip at the bottom.
function CardFooter({ unit, side, w, h, roleBand, footerH }) {
  const accent = V2_ROLE_COLOR[unit.role] || V2_ROLE_COLOR.Enemy;
  return (
    <CardShell unit={unit} side={side} w={w} h={h} roleBand={roleBand}>
      <div style={{
        position: 'absolute', inset: `0 0 ${footerH}px 0`,
      }}>
        <SpriteArea unit={unit} side={side} padLeft={roleBand} isEnemy={side === 'enemy'} showTargetTag />
      </div>

      <div style={{
        position: 'absolute', left: roleBand, right: 0, bottom: 0,
        height: footerH,
        background: 'rgba(0,0,0,0.45)',
        borderTop: `1px solid ${accent}`,
        padding: '6px 8px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 700, color: '#e8e6df',
          fontFamily: 'Inter, sans-serif',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{unit.name}</div>
        <V2HpBar hp={unit.hp} max={unit.max} dead={unit.dead} height={18} fontSize={11} />
      </div>
    </CardShell>
  );
}

// B2 — Name in a thin tinted header at the top; HP pill at the bottom.
function CardHeader({ unit, side, w, h, roleBand, footerH }) {
  const accent = V2_ROLE_COLOR[unit.role] || V2_ROLE_COLOR.Enemy;
  const headerH = 26;
  return (
    <CardShell unit={unit} side={side} w={w} h={h} roleBand={roleBand}>
      {/* header */}
      <div style={{
        position: 'absolute', left: roleBand, right: 0, top: 0, height: headerH,
        background: `linear-gradient(180deg, ${v2Shade(accent, -0.4)}, rgba(0,0,0,0.0))`,
        display: 'flex', alignItems: 'center', padding: '0 8px',
        zIndex: 3,
      }}>
        <span style={{
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          fontWeight: 700, color: '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{unit.name}</span>
      </div>

      <div style={{ position: 'absolute', inset: 0 }}>
        <SpriteArea unit={unit} side={side} padLeft={roleBand} isEnemy={side === 'enemy'} showTargetTag />
      </div>

      {/* hp strip */}
      <div style={{
        position: 'absolute', left: roleBand + 6, right: 6, bottom: 6,
        height: footerH - 8,
      }}>
        <V2HpBar hp={unit.hp} max={unit.max} dead={unit.dead} height={footerH - 8} fontSize={12} />
      </div>
    </CardShell>
  );
}

// B3 — minimum chrome. Tiny corner nameplate, HP overlaid on the sprite's
// bottom edge. Maximum sprite area.
function CardMinimal({ unit, side, w, h, roleBand }) {
  const accent = V2_ROLE_COLOR[unit.role] || V2_ROLE_COLOR.Enemy;
  return (
    <CardShell unit={unit} side={side} w={w} h={h} roleBand={roleBand}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <SpriteArea unit={unit} side={side} padLeft={roleBand} isEnemy={side === 'enemy'} showTargetTag />
      </div>

      {/* corner nameplate */}
      <div style={{
        position: 'absolute', left: roleBand, top: 0,
        background: '#0e1015',
        borderRight: `2px solid ${accent}`,
        borderBottom: `2px solid ${accent}`,
        padding: '3px 8px',
        fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
        fontWeight: 700, color: '#e8e6df',
        zIndex: 3,
      }}>{unit.name}</div>

      {/* hp at bottom */}
      <div style={{
        position: 'absolute', left: roleBand + 4, right: 4, bottom: 4,
        zIndex: 3,
      }}>
        <V2HpBar hp={unit.hp} max={unit.max} dead={unit.dead} height={18} fontSize={11} />
      </div>
    </CardShell>
  );
}

// ── full combat panel laid out 4-row grid ─────────────────────────────────

function V2RunHeader() {
  const Stat = ({ label, value, tone = '#e8e6df' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flex: '0 0 auto' }}>
      <span style={{ fontSize: 10, letterSpacing: '0.22em', color: '#7a8294', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: tone, fontFamily: 'Inconsolata, ui-monospace, monospace', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 36px',
      background: '#11131a',
      borderBottom: '1px solid #262936',
      height: 56,
      flex: '0 0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Stat label="ROUND" value="3 / 10" />
        <Stat label="GOLD"  value="73" tone="#e7c560" />
        <Stat label="DEBT"  value="0" tone="#9aa3b2" />
        <Stat label="MORALE" value="24 / 30" tone="#7ab877" />
      </div>
      <div style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontWeight: 600, fontSize: 26, color: '#e9d59a',
        letterSpacing: '0.06em', whiteSpace: 'nowrap',
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

function V2CombatLog() {
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
      <span style={{ color: '#cfd3dc' }}>Warrior attacks Greedy Tank for 2.</span>
      <span style={{ color: '#7a8294' }}>›</span>
      <span style={{ color: '#fff', fontWeight: 600 }}>Goblin Thief dies.</span>
    </div>
  );
}

function V2PanelRow({ label, side, units, slots, CardComp, props }) {
  const cells = Array.from({ length: slots }).map((_, i) => units[i] || null);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      <div style={{
        width: 110, flex: '0 0 110px',
        fontSize: 11, letterSpacing: '0.22em', color: '#7a8294',
        textTransform: 'uppercase', fontWeight: 700,
      }}>{label}</div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {cells.map((u, i) => u
          ? <CardComp key={i} unit={u} side={side} {...props} />
          : <div key={i} style={{
              width: props.w, height: props.h,
              border: '2px dashed #2a2f3b', borderRadius: 4, opacity: 0.4,
            }} />
        )}
      </div>
    </div>
  );
}

function V2CombatPanel({ style, w, h, roleBand, footerH }) {
  const CardComp =
    style === 'header' ? CardHeader :
    style === 'minimal' ? CardMinimal :
    CardFooter;
  const props = { w, h, roleBand, footerH };

  return (
    <div style={{
      width: 1920, height: 1080, background: '#0e1015',
      display: 'flex', flexDirection: 'column',
      color: '#e8e6df', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <V2RunHeader />

      <div style={{
        flex: 1, padding: '24px 60px 24px', background: '#15171e',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <V2PanelRow label="ENEMY BACK"  side="enemy" units={V2_SCENE.enemyBack}  slots={3} CardComp={CardComp} props={props} />
        <V2PanelRow label="ENEMY FRONT" side="enemy" units={V2_SCENE.enemyFront} slots={2} CardComp={CardComp} props={props} />
        <div style={{
          height: 1, background: 'linear-gradient(90deg, transparent, rgba(193,154,62,0.5), transparent)',
          margin: '4px 0',
        }} />
        <V2PanelRow label="HERO FRONT"  side="hero"  units={V2_SCENE.heroFront}  slots={2} CardComp={CardComp} props={props} />
        <V2PanelRow label="HERO BACK"   side="hero"  units={V2_SCENE.heroBack}   slots={3} CardComp={CardComp} props={props} />
      </div>

      <V2CombatLog />
    </div>
  );
}

// ── tweakable host (single big artboard, Tweaks panel on top) ─────────────

const V2_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardStyle": "footer",
  "cardWidth": 200,
  "cardHeight": 208,
  "roleBandWidth": 6,
  "footerHeight": 56
}/*EDITMODE-END*/;

function V2Host() {
  const [t, setTweak] = useTweaks(V2_DEFAULTS);
  // Recompute scale on resize so the 1920×1080 panel fills the viewport
  // without overflowing. transform: scale() doesn't shrink the layout box,
  // so we host the panel in a fixed-size wrapper sized to viewport × scale
  // and let overflow: hidden on the outer container catch any rounding.
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const recompute = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#262624', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 1920 * scale, height: 1080 * scale,
        position: 'relative', flex: '0 0 auto',
      }}>
        <div style={{
          width: 1920, height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute', top: 0, left: 0,
        }}>
          <V2CombatPanel
            style={t.cardStyle}
            w={t.cardWidth}
            h={t.cardHeight}
            roleBand={t.roleBandWidth}
            footerH={t.footerHeight}
          />
        </div>
      </div>

      <TweaksPanel title="Tweaks" noDeckControls>
        <TweakSection label="Card style">
          <TweakRadio
            label="Layout"
            value={t.cardStyle}
            options={[
              { value: 'footer',  label: 'Footer'  },
              { value: 'header',  label: 'Header'  },
              { value: 'minimal', label: 'Minimal' },
            ]}
            onChange={(v) => setTweak('cardStyle', v)}
          />
        </TweakSection>

        <TweakSection label="Dimensions">
          <TweakSlider
            label="Card width" value={t.cardWidth} min={140} max={280} step={4} unit="px"
            onChange={(v) => setTweak('cardWidth', v)} />
          <TweakSlider
            label="Card height" value={t.cardHeight} min={180} max={360} step={4} unit="px"
            onChange={(v) => setTweak('cardHeight', v)} />
          <TweakSlider
            label="Role band" value={t.roleBandWidth} min={0} max={16} step={1} unit="px"
            onChange={(v) => setTweak('roleBandWidth', v)} />
          <TweakSlider
            label="Footer height" value={t.footerHeight} min={32} max={80} step={2} unit="px"
            onChange={(v) => setTweak('footerHeight', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}


Object.assign(window, { V2Host });
