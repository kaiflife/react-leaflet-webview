import React, { memo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { createDivIcon } from './mapHelper';
import { webViewSendMessage } from './helpers';

const updateFunction = (prevState, nextState) => {
  if (prevState.data?.coordinates?.x !== nextState.data?.coordinates?.x) {
    return false;
  }

  if (prevState.currentZoom !== nextState.currentZoom) return false;

  return prevState.data?.coordinates?.y === nextState.data?.coordinates?.y;
};

// example of transport object
// const transport = { id: '0', licence_plate: '123', egsid: '0', 'car_hanlder': '0' }


const onClickTrackedMarker = trackedTransport => {
  webViewSendMessage(trackedTransport)
}

function TransportTracking({
  transport = {
    x: 0,
    y: 0,
    icon: '',
    id: '',
    egtsid: '',
    car_handler: '',
    license_plate: '',
  },
  currentZoom
}) {
  if (!(transport?.x && transport.y)) return null;

  const { x, y } = transport;

  return (
    <Marker
      icon={createDivIcon(transport.icon)}
      position={L.latLng(x, y)}
      eventHandlers={{
        click: (e) => {
          // eslint-disable-next-line no-underscore-dangle
          setTimeout( // todo timed solution for map focus
            // eslint-disable-next-line no-underscore-dangle
            () => e?.target?._map
              ?.setView([e.latlng.lat, e.latlng.lng]),
            0,
          );
          onClickTrackedMarker?.({
            ...transport,
            type: 'transport',
          });
          return e;
        },
      }}
    >
      {/* eslint-disable-next-line no-underscore-dangle */}
      {currentZoom > 10 && (
        <Tooltip direction="top" offset={[10, 0]} opacity={0.8} permanent>
          {transport.license_plate || transport.egtsid || transport?.car_handler}
        </Tooltip>
      )}
    </Marker>
  );
}

export default memo(TransportTracking, updateFunction);
