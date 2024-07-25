import L from 'leaflet';

export const formatCoordinates = (coordinates) => coordinates.map(({ x, y }) => L.latLng(x, y));

export const createDivIcon = (icon, { iconAnchor } = { iconAnchor: undefined }) => L.divIcon({
  html: icon,
  iconAnchor,
});
