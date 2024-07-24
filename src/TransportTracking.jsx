import React, { memo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const updateFunction = (prevState, nextState) => {
  if (prevState.data?.coordinates?.x !== nextState.data?.coordinates?.x) {
    return false;
  }

  if (prevState.currentZoom !== nextState.currentZoom) return false;

  return prevState.data?.coordinates?.y === nextState.data?.coordinates?.y;
};

function TransportTracking({ data = {}, onClickMarker, currentZoom }) {
  if (!data?.place) return null;

  const { x: lat, y: lng } = data.place;

  return (
    <Marker
      icon={data.icon}
      position={L.latLng(lat, lng)}
      eventHandlers={{
        click: (e) => {
          // eslint-disable-next-line no-underscore-dangle
          setTimeout( // todo timed solution for map focus
            // eslint-disable-next-line no-underscore-dangle
            () => e?.target?._map
              ?.setView([e.latlng.lat, e.latlng.lng]),
            0,
          );
          onClickMarker?.(data);
          return e;
        },
      }}
    >
      {/* eslint-disable-next-line no-underscore-dangle */}
      {currentZoom > 10 && (
        <Tooltip direction="top" offset={[16, 0]} opacity={0.8} permanent>
          {data?.trip_id || data.license_plate || data.egtsid || data?.car_handler}
        </Tooltip>
      )}
    </Marker>
  );
}

export default memo(TransportTracking, updateFunction);
