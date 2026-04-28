
import React from 'react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Shield, Lock, FileText, Scale, Globe, AlertCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface LegalViewProps {
  type: 'TERMS' | 'PRIVACY' | 'REGISTRY';
  onNotify: (msg: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onNotify }) => {
  const { t } = useTranslation();

  const content = {
    TERMS: {
      title: t('Terms of Service', 'Conditions Générales d\'Utilisation'),
      subtitle: t('LYA Protocol v4.2 Regulatory Framework', 'Cadre Réglementaire du Protocole LYA v4.2'),
      sections: [
        {
          title: t('1. Institutional Nature', '1. Nature Institutionnelle'),
          text: t(
            'LinkYourArt (LYA) is an institutional exchange platform for indexed creative contracts. By accessing the platform, you acknowledge that LYA Units are financial instruments representing fractional rights in creative assets.',
            'LinkYourArt (LYA) est une plateforme d\'échange institutionnelle pour les contrats créatifs indexés. En accédant à la plateforme, vous reconnaissez que les Unités LYA sont des instruments financiers représentant des droits fractionnés sur des actifs créatifs.'
          )
        },
        {
          title: t('2. Eligibility & Verification', '2. Éligibilité et Vérification'),
          text: t(
            'Access to the LYA Exchange and Legal Registry requires mandatory KYC/AML verification. Professional and Institutional tiers must provide valid regulatory credentials (SEC, MiCA, FCA).',
            'L\'accès à l\'Exchange LYA et au Registre Légal nécessite une vérification KYC/AML obligatoire. Les niveaux Professionnel et Institutionnel doivent fournir des justificatifs réglementaires valides (SEC, MiCA, FCA).'
          )
        },
        {
          title: t('3. Contractual Immutability', '3. Immuabilité Contractuelle'),
          text: t(
            'All contracts issued via the LYA Protocol are registered on an immutable ledger. Once a contract reaches "LIVE" status, its core parameters (Revenue Share, Total Units) cannot be modified without institutional consensus.',
            'Tous les contrats émis via le Protocole LYA sont enregistrés sur un registre immuable. Une fois qu\'un contrat atteint le statut "LIVE", ses paramètres de base (Partage de Revenus, Unités Totales) ne peuvent être modifiés sans consensus institutionnel.'
          )
        },
        {
          title: t('4. Risk Disclosure', '4. Divulgation des Risques'),
          text: t(
            'Investing in creative assets involves significant risks, including liquidity risk and market volatility. LYA Scores are predictive analytics and do not guarantee future performance.',
            'L\'investissement dans les actifs créatifs comporte des risques importants, notamment le risque de liquidité et la volatilité du marché. Les Scores LYA sont des analyses prédictives et ne garantissent pas les performances futures.'
          )
        }
      ]
    },
    PRIVACY: {
      title: t('Privacy Policy', 'Politique de Confidentialité'),
      subtitle: t('Data Protection & Institutional Security', 'Protection des Données et Sécurité Institutionnelle'),
      sections: [
        {
          title: t('1. Data Collection', '1. Collecte des Données'),
          text: t(
            'We collect identity data (KYC), transaction history, and usage statistics to ensure platform security and regulatory compliance. All sensitive data is encrypted using AES-256 standards.',
            'Nous collectons des données d\'identité (KYC), l\'historique des transactions et des statistiques d\'utilisation pour assurer la sécurité de la plateforme et la conformité réglementaire. Toutes les données sensibles sont cryptées selon les normes AES-256.'
          )
        },
        {
          title: t('2. Institutional Sharing', '2. Partage Institutionnel'),
          text: t(
            'Data may be shared with regulatory bodies (SEC, MiCA) and institutional nodes for audit purposes. We never sell user data to third-party marketing entities.',
            'Les données peuvent être partagées avec des organismes de réglementation (SEC, MiCA) et des nœuds institutionnels à des fins d\'audit. Nous ne vendons jamais les données des utilisateurs à des entités marketing tierces.'
          )
        },
        {
          title: t('3. Blockchain Transparency', '3. Transparence Blockchain'),
          text: t(
            'Transaction records and contract ownership are public on the LYA Ledger. While identities are pseudonymized, the flow of LYA Units is transparent for auditability.',
            'Les enregistrements de transactions et la propriété des contrats sont publics sur le Ledger LYA. Bien que les identités soient pseudonymisées, le flux des Unités LYA est transparent pour l\'auditabilité.'
          )
        },
        {
          title: t('4. User Rights', '4. Droits des Utilisateurs'),
          text: t(
            'Users have the right to access, rectify, or request the deletion of their personal data, subject to regulatory retention requirements for financial transactions.',
            'Les utilisateurs ont le droit d\'accéder, de rectifier ou de demander la suppression de leurs données personnelles, sous réserve des exigences réglementaires de conservation pour les transactions financières.'
          )
        }
      ]
    },
    REGISTRY: {
      title: t('Institutional Registries', 'Registres Institutionnels'),
      subtitle: t('Creative Asset Indexing & Verification Protocol', 'Protocole d\'Indexation et de Vérification des Actifs Créatifs'),
      sections: [
        {
          title: t('1. Registry Protocol', '1. Protocole de Registre'),
          text: t(
            'The LYA Registry is a decentralized ledger designed for the institutional-grade indexing of creative assets. All entries are cryptographically secured and verified by authorized nodes.',
            'Le Registre LYA est un registre décentralisé conçu pour l\'indexation de qualité institutionnelle des actifs créatifs. Toutes les entrées sont sécurisées par cryptographie et vérifiées par des nœuds autorisés.'
          )
        },
        {
          title: t('2. Asset Tokenization', '2. Tokenisation des Actifs'),
          text: t(
            'Creative projects are indexed into standardized Contract Units. Each unit represents a fractional interest in the underlying creative equity, backed by the LYA settlement engine.',
            'Les projets créatifs sont indexés dans des unités de contrat standardisées. Chaque unité représente un intérêt fractionnaire dans les fonds propres créatifs sous-jacents, soutenu par le moteur de règlement LYA.'
          )
        },
        {
          title: t('3. Verification & Compliance', '3. Vérification et Conformité'),
          text: t(
            'Assets must undergo a rigorous multi-stage validation process before being admitted to the registry. This includes IP verification, valuation audits, and jurisdictional compliance checks.',
            'Les actifs doivent subir un processus de validation rigoureux en plusieurs étapes avant d\'être admis au registre. Cela comprend la vérification de la propriété intellectuelle, les audits d\'évaluation et les contrôles de conformité juridictionnelle.'
          )
        },
        {
          title: t('4. Settlement & Liquidity', '4. Règlement et Liquidité'),
          text: t(
            'The registry facilitates real-time settlement of creative contracts. Liquidity is provided through institutional pools and peer-to-peer exchange mechanisms.',
            'Le registre facilite le règlement en temps réel des contrats créatifs. La liquidité est fournie par des pools institutionnels et des mécanismes d\'échange de pair à pair.'
          )
        }
      ]
    }
  };

  const activeContent = content[type];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="relative z-10">
        <PageHeader 
          titleWhite={activeContent.title.split(' ')[0]}
          titleAccent={activeContent.title.split(' ').slice(1).join(' ')}
          description={activeContent.subtitle}
          accentColor="text-primary-cyan"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-32 mb-12 relative z-20 px-6 md:px-12">
          <div className="flex flex-wrap gap-4">
            <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-primary-cyan uppercase tracking-widest font-black mb-1 opacity-70">{t('Regulatory Tier', 'Niveau Réglementaire')}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('Tier 4 Verified', 'NIVEAU 4 VÉRIFIÉ')}</div>
            </div>
            <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-widest font-black mb-1 opacity-70">{t('Protocol Version', 'Version du Protocole')}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter uppercase">V4.2.0</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12">
          {activeContent.sections.map((section, i) => (
            <motion.section 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-10 rounded-[2.5rem] border-white/10 relative overflow-hidden group hover:border-primary-cyan/30 transition-all shadow-2xl"
            >
              {/* Dynamic Abstract Background Elements */}
              <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <div className="absolute top-10 right-10 w-64 h-64 border border-white/20 rounded-full rotate-45 transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-cyan/20 blur-3xl" />
              </div>
              
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity group-hover:scale-110 duration-700">
                {type === 'TERMS' ? <Scale size={140} /> : <Lock size={140} />}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
                  <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-widest leading-none">
                  {section.title}
                </h2>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                {section.text}
              </p>
            </motion.section>
          ))}
        </div>

        <footer className="mt-20 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Shield className="text-primary-cyan" size={24} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white">{t('Verified by LYA Legal', 'Vérifié par LYA Legal')}</div>
              <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Hash: 0x82f...a92e</div>
            </div>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => onNotify('PREPARING PDF DOWNLOAD...')}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
            >
              {t('Download PDF', 'Télécharger PDF')}
            </button>
            <button 
              onClick={() => onNotify('ACCESSING HISTORICAL ARCHIVES...')}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
            >
              {t('Archive Access', 'Accès Archives')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
