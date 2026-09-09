import React from 'react';

/**
 * TERMINAL — page de concept publique (claire, éditoriale, esprit "magazine d'art")
 *
 * IMPORTANT : ce composant définit ses propres couleurs via des variables CSS
 * locales (--terminal-*), appliquées uniquement à sa racine. Il n'utilise PAS
 * les tokens globaux (--color-surface-dim, --color-primary-cyan, etc.), donc
 * il ne peut ni être affecté par, ni affecter, le thème sombre du reste de
 * l'application. C'est une zone visuelle totalement isolée.
 *
 * STATUT ACTUEL : visuel uniquement. Le formulaire de pré-inscription n'est
 * PAS encore branché sur Firebase — c'est volontaire, pour valider la
 * direction visuelle avant de câbler la vraie logique (codes de parrainage,
 * file d'attente, clés d'accès) qui existe déjà dans LandingView.tsx.
 */

interface TerminalViewProps {
  onEnterApp?: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ onEnterApp }) => {
  return (
    <div
      style={{
        // Palette locale, isolée — n'affecte rien d'autre dans l'app.
        ['--terminal-paper' as any]: '#F6F2EA',
        ['--terminal-ink' as any]: '#211D17',
        ['--terminal-ink-soft' as any]: '#4A4438',
        ['--terminal-muted' as any]: '#8C8272',
        ['--terminal-rule' as any]: '#D8D0C0',
        ['--terminal-oxblood' as any]: '#6E2A2A',
        ['--terminal-sage' as any]: '#55613F',
        ['--terminal-clay' as any]: '#9C6B3E',
        backgroundColor: 'var(--terminal-paper)',
        color: 'var(--terminal-ink)',
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
      }}
    >
      <style>{`
        .terminal-serif { font-family: 'Fraunces', serif; }
        .terminal-wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        @media (min-width: 640px) { .terminal-wrap { padding: 0 40px; } }
      `}</style>

      {/* Masthead */}
      <header style={{ borderBottom: '1px solid var(--terminal-rule)', padding: '24px 0' }}>
        <div className="terminal-wrap" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className="terminal-serif" style={{ fontWeight: 600, fontSize: 24 }}>LYA</div>
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#artiste" style={navLinkStyle}>Artistes</a>
            <a href="#mecene" style={navLinkStyle}>Mécènes</a>
            <a href="#pro" style={navLinkStyle}>Certificateurs</a>
            <a href="#how" style={navLinkStyle}>Le Score LYA</a>
            <button
              onClick={onEnterApp}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--terminal-paper)',
                backgroundColor: 'var(--terminal-ink)',
                padding: '8px 18px',
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Se connecter
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="terminal-wrap" style={{ padding: '72px 0 64px', borderBottom: '1px solid var(--terminal-rule)' }}>
        <div style={{ marginBottom: 20, fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'var(--terminal-oxblood)', fontSize: 17 }}>
          La certification créative, repensée
        </div>
        <h1 className="terminal-serif" style={{ fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 1.08, fontWeight: 480, maxWidth: '16ch', margin: 0 }}>
          Ce que vous créez mérite d'être reconnu.
        </h1>
        <p style={{ marginTop: 24, fontSize: 17, lineHeight: 1.65, color: 'var(--terminal-ink-soft)', maxWidth: '52ch' }}>
          LYA certifie la maturité de vos projets créatifs à travers cinq dimensions, et relie artistes, mécènes et professionnels autour d'un même standard.
        </p>
      </section>

      {/* Audiences */}
      <section className="terminal-wrap">
        {[
          { id: 'artiste', tag: 'Pour les artistes', color: 'var(--terminal-oxblood)', title: 'Faites certifier votre projet, pas seulement votre profil.', body: "Un score construit sur votre travail réel. De quoi convaincre un mécène, un professionnel, ou vous-même que le projet est prêt.", cta: 'Découvrir le parcours' },
          { id: 'mecene', tag: 'Pour les mécènes', color: 'var(--terminal-sage)', title: 'Soutenez un projet dont la maturité est déjà évaluée.', body: "Le mécénat sur LYA est libre et sans intermédiaire financier — choisissez un projet certifié, en toute confiance.", cta: 'Voir les projets certifiés' },
          { id: 'pro', tag: 'Pour les professionnels', color: 'var(--terminal-clay)', title: 'Devenez certificateur et pesez sur le standard.', body: "Rejoignez les professionnels qui évaluent et valident les projets, et construisez une référence commune au secteur créatif.", cta: 'Devenir certificateur' },
        ].map((a, i) => (
          <div key={a.id} id={a.id} style={{ padding: i === 0 ? '64px 0 44px' : '44px 0', borderBottom: '1px solid var(--terminal-rule)' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 14, color: 'var(--terminal-muted)', marginBottom: 10 }}>{a.tag}</div>
            <div style={{ height: 4, width: 48, backgroundColor: a.color, marginBottom: 16 }} />
            <h2 className="terminal-serif" style={{ fontSize: 26, fontWeight: 480, marginBottom: 10, maxWidth: '28ch' }}>{a.title}</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--terminal-ink-soft)', maxWidth: '56ch', marginBottom: 14 }}>{a.body}</p>
            <a href={`#${a.id}-detail`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--terminal-ink)', textDecoration: 'none', borderBottom: '1px solid var(--terminal-ink)' }}>
              {a.cta}
            </a>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how" className="terminal-wrap" style={{ padding: '64px 0', borderBottom: '1px solid var(--terminal-rule)' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'var(--terminal-oxblood)', fontSize: 16, marginBottom: 12 }}>
          Comment ça marche
        </div>
        <h2 className="terminal-serif" style={{ fontSize: 30, fontWeight: 480, marginBottom: 40, maxWidth: '28ch' }}>
          Cinq piliers, un score, une décision plus claire.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          {[
            ['Intégrité conceptuelle', "La cohérence et la force de l'idée fondatrice."],
            ['Maturité actuelle', "L'état d'avancement réel du projet aujourd'hui."],
            ["Capacité d'évolution", 'Le potentiel de développement dans le temps.'],
            ['Faisabilité réelle', 'Les moyens et le réalisme de mise en œuvre.'],
            ['Incarnation', 'La capacité du porteur de projet à le mener.'],
          ].map(([title, desc], idx) => (
            <div key={title} style={{ borderLeft: idx === 0 ? 'none' : '1px solid var(--terminal-rule)', paddingLeft: idx === 0 ? 0 : 20 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, color: 'var(--terminal-muted)', marginBottom: 12 }}>0{idx + 1}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--terminal-ink-soft)', lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA — visuel uniquement pour l'instant, pas encore branché */}
      <section className="terminal-wrap" style={{ padding: '72px 0 96px' }}>
        <h2 className="terminal-serif" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', fontWeight: 480, maxWidth: '16ch', marginBottom: 20 }}>
          Votre projet a une valeur. Faisons-la reconnaître.
        </h2>
        <button
          onClick={onEnterApp}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--terminal-paper)',
            backgroundColor: 'var(--terminal-ink)',
            padding: '16px 30px',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
          }}
        >
          Rejoindre LYA
        </button>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--terminal-muted)' }}>
          Accès sur pré-inscription, validé par notre équipe.
        </div>
      </section>

      <footer className="terminal-wrap" style={{ borderTop: '1px solid var(--terminal-rule)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--terminal-muted)' }}>
        <span>LYA — LinkYourArt · Rennes / Paris</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
};

const navLinkStyle: React.CSSProperties = {
  color: 'var(--terminal-ink-soft)',
  textDecoration: 'none',
  fontSize: 14.5,
  fontWeight: 500,
};

export default TerminalView;
