// Met à jour les méta-tags Open Graph dynamiquement
export const updatePageMeta = (params: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) => {
  const { title, description, image, url } = params;
  const siteName = 'LinkYourArt';

  if (title) {
    document.title = `${title} — ${siteName}`;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} — ${siteName}`);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${title} — ${siteName}`);
  }
  if (description) {
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  }
  if (image) {
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', image);
  }
  if (url) {
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  }
};

// Reset vers les méta-tags par défaut
export const resetPageMeta = () => {
  updatePageMeta({
    title: 'L\'art est un échange',
    description: 'La première plateforme d\'équité créative. Co-possédez des projets artistiques via le Protocole LYA.',
    url: 'https://linkyourart.com',
  });
};
