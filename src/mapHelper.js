import L from 'leaflet';

export const formatCoordinates = (coordinates) => coordinates.map(({ x, y }) => L.latLng(x, y));

export const createLIcon = (icon, { iconAnchor } = { iconAnchor: undefined }) => L.icon({
  iconUrl: icon,
  iconShadow: icon,
  iconAnchor,
});
