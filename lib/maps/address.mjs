export function mapAddress(address) {
  const clean = address.replace(/^소재지\s*[:：]\s*/, '').trim().replace(/\s+/g, ' ');
  return clean.match(/^(.+?(?:동|리|가|로|길)\s*(?:산\s*)?\d+(?:-\d+)?)(?=번지|\s|,|\(|$)/)?.[1].replace(/(동|리|가)(?=\d)/, '$1 ') ?? clean;
}

export function matchCoordinates(query, addresses) {
  const normalize = s => mapAddress(s).replace(/\s+/g, '').replace(/^경기(?=군포)/, '경기도');
  const matched = addresses.filter(a => [a.roadAddress, a.jibunAddress].some(s => typeof s === 'string' && normalize(s) === normalize(query)));
  const positions = matched.map(a => ({latitude: Number(a.y), longitude: Number(a.x)}))
    .filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && p.latitude >= 33 && p.latitude <= 39 && p.longitude >= 124 && p.longitude <= 132);
  if (!positions.length || positions.some(p => Math.abs(p.latitude - positions[0].latitude) > 0.0001 || Math.abs(p.longitude - positions[0].longitude) > 0.0001)) return null;
  return {...positions[0], matchedAddress: matched[0].jibunAddress};
}
