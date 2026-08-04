function buildLocationLinks(point) {
  const links = [];
  const seenUrls = new Set();
  const latitude = Number(point.latitude);
  const longitude = Number(point.longitude);
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude)
    && !(latitude === 0 && longitude === 0);

  const pushLink = (label, rawUrl) => {
    const url = String(rawUrl || '').trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return;
    if (seenUrls.has(url)) return;
    seenUrls.add(url);
    links.push({ label, url });
  };

  if (/^\d+$/.test(String(point.code || '').trim())) {
    pushLink('Familymart', `https://fmvending.web.app/refill-service/M${String(point.code).padStart(4, '0')}`);
  }

  if (hasCoords) {
    pushLink('Google Maps', `https://maps.google.com/?q=${latitude},${longitude}`);
    pushLink('waze', `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`);
  }

  if (point.qrCodeDestinationUrl && String(point.qrCodeDestinationUrl).trim()) {
    pushLink('QR', point.qrCodeDestinationUrl);
  }

  if (point.pdfUrl || point.pdf_url) {
    pushLink('PDF', point.pdfUrl || point.pdf_url);
  }

  const documents = Array.isArray(point.documents) ? point.documents : [];
  for (const document of documents) {
    const docUrl = String(document?.url || '').trim();
    if (!docUrl) continue;

    const kind = String(document?.kind || '').trim().toLowerCase();
    const mimeType = String(document?.mimeType || '').trim().toLowerCase();
    const name = String(document?.name || '').trim();
    const isPdf = kind === 'pdf' || mimeType === 'application/pdf' || /\.pdf(\?.*)?$/i.test(docUrl);

    if (!isPdf) continue;

    const label = name
      ? `PDF: ${name}`
      : 'PDF';
    pushLink(label, docUrl);
  }

  return links;
}

function chunkLinksForButtons(links, maxButtonsPerMessage = 3) {
  if (!Number.isFinite(maxButtonsPerMessage) || maxButtonsPerMessage <= 0) {
    return [links.slice()];
  }

  const chunks = [];
  for (let i = 0; i < links.length; i += maxButtonsPerMessage) {
    chunks.push(links.slice(i, i + maxButtonsPerMessage));
  }
  return chunks;
}

export { buildLocationLinks, chunkLinksForButtons };
