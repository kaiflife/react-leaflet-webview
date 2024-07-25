import React, { memo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { createDivIcon } from './mapHelper';

const updateFunction = (prevState, nextState) => {
  if (prevState.data?.coordinates?.x !== nextState.data?.coordinates?.x) {
    return false;
  }

  if (prevState.currentZoom !== nextState.currentZoom) return false;

  return prevState.data?.coordinates?.y === nextState.data?.coordinates?.y;
};

// example of transport object
// const transport = { trip_id: '0', licence_plate: '123', egsid: '0', 'car_hanlder': '0' }

function TransportTracking({
  transport = {
    place: { x: 0, y: 0 }, icon: '',
    trip_id: '',
    egtsid: '',
    car_handler: '',
    license_plate: '',
    test: true,
  },
  onClickMarker,
  currentZoom
}) {
  if (transport?.test) return null;

  const { x: lat, y: lng } = transport.place;

  return (
    <Marker
      icon={createDivIcon(transport.icon)}
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
          onClickMarker?.(transport);
          return e;
        },
      }}
    >
      {/* eslint-disable-next-line no-underscore-dangle */}
      {currentZoom > 10 && (
        <Tooltip direction="top" offset={[16, 0]} opacity={0.8} permanent>
          {transport?.trip_id || transport.license_plate || transport.egtsid || transport?.car_handler}
        </Tooltip>
      )}
    </Marker>
  );
}

export default memo(TransportTracking, updateFunction);
