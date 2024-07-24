// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import TransportTracking from './TransportTracking';

const webViewSendMessage = (message = {}) => {
  // <-- minimal documentation -->
  // flutter JavascriptChannel name 'LeafletWebview'
  // flutter app will react to this event in Webview, check JavascriptChannel method in flutter app
  // eslint-disable-next-line no-undef
  LeafletWebview.postMessage(JSON.stringify(message));
};

const CENTER_COORDINATES = [59.9342802, 30.3350986];

const WebViewLeafletMap = () => {
  const [polylines, setPolylines] = useState([]);
  const [geoJsons, setGeoJsons] = useState([]);
  const [mapData, setMapData] = useState({
    zoom: 13,
    center: CENTER_COORDINATES,
  });
  const [markers, setMarkers] = useState([]);
  const [trackedVehicles, setTrackedVehicles] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(11);

  const webViewGetMessage = (message = '') => {
    if (!message.data?.includes?.('type')) return;

    const parsedMessage = JSON.parse(message.data);

    if (!parsedMessage?.type) return;

    const { data, type } = parsedMessage;

    switch (type) {
      case 'markers': return setMarkers(data);
      case 'geoJsons': return setGeoJsons(data);
      case 'polylines': return setPolylines(data);
      case 'mapData': return setMapData(data);
      case 'trackedVehicles': return setTrackedVehicles(data);
      default: {
        webViewSendMessage({ type: 'debug', message: 'no event' });
        return;
      }
    }
  };

  const whenMapReady = (mapInstance) => {
    mapInstance.target?.on('zoomend', (e) => {
      // eslint-disable-next-line no-underscore-dangle
      setCurrentZoom(e?.target?._zoom);
    });
  };

  useEffect(() => {
    const leafletListLinks = document.body.querySelectorAll(
      '.leaflet-control-attribution.leaflet-control a',
    );

    if (leafletListLinks) {
      leafletListLinks.forEach((item) => {
        if (item.href === 'https://leafletjs.com/') {
          item.remove();
        }
      });
    }
  }, []);
  
  const onClickTrackedMarker = (tackedVehicle) => {
    webViewSendMessage(`${tackedVehicle.id}`);
  }

  useEffect(() => {
    window.addEventListener('message', webViewGetMessage);
  }, []);

  return (
    <MapContainer
      whenReady={whenMapReady}
      center={mapData.center}
      className="markercluster-map"
      zoom={mapData.zoom}
      id="leaflet-webview-map"
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        setParams
      />
      {polylines.map((items, color = 'orange') => {
        return (
          <Polyline
            positions={items.map(({ x, y }) => [x, y])}
            pathOptions={{ color }}
          />
        )
      })}
      <ZoomControl position="bottomright" />
      {geoJsons.map(geoJsonData => <GeoJSON data={geoJsonData} />)}
      {trackedVehicles?.map?.((vehicle) => (
        <TransportTracking
          currentZoom={currentZoom}
          onClickMarker={onClickTrackedMarker}
          key={vehicle.id}
          data={vehicle}
        />
      ))}
      {markers.map(item => {
        const { coordinates, icon } = item;

        if (!(coordinates?.x && coordinates?.y)) {
          return (
            <React.Fragment
              key={`${coordinates?.x}, ${coordinates?.y}`}
            />
          );
        }

        return (
          <Marker
            key={`${coordinates.x}, ${coordinates.y}`}
            icon={icon}
            position={L.latLng(coordinates.x, coordinates.y)}
          />
        );
      })}
    </MapContainer>
  );
};

export default WebViewLeafletMap;
