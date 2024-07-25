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
import { createDivIcon } from './mapHelper';

const webViewSendMessage = (message = {}) => {
  // <-- minimal documentation -->
  // flutter JavascriptChannel name 'LeafletWebview'
  // flutter app will react to this event in Webview, check JavascriptChannel method in flutter app
  // eslint-disable-next-line no-undef
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
};

const CENTER_COORDINATES = [59.9342802, 30.3350986];

const getWebViewObject = () => JSON.parse(window.ReactNativeWebView.injectedObjectJson());

const testMarkers = [{"icon": `<div><svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="14" height="14" rx="4" fill="#E85050"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.35636 9.75211L2.91668 6.41666L10.7729 6.41666V7.58333H5.7957L7.16853 8.91456L6.35636 9.75211Z" fill="white"/>
</svg></div>`, "id": 0.34215181196442107, "position": {"lat": 61.0372, "lng": 30.1202}, "size": [24, 24]}, {"icon": `<div><svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="14" height="14" rx="4" fill="#8CC63F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.9165 4.83122L11.3562 8.16666H3.5V7H8.47716L7.10433 5.66877L7.9165 4.83122Z" fill="white"/>
</svg>
</div>`, "id": 0.21362068715493168, "position": {"lat": 59.4237, "lng": 30.6809}, "size": [24, 24]}]

const WebViewLeafletMap = () => {
  const [polylines, setPolylines] = useState([]);
  const [geoJsons, setGeoJsons] = useState([]);
  const [mapData, setMapData] = useState({
    zoom: 13,
    center: CENTER_COORDINATES,
  });
  const [markers, setMarkers] = useState(testMarkers);
  const [trackedTransports, setTrackedTransports] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(11);

  const addMarkers = () => {
    const webViewMarkers = getWebViewObject().markers;

    if (webViewMarkers?.length) setMarkers(webViewMarkers);
  }

  const webViewGetMessage = (message = '') => {
    try {
      if (!message.data?.includes?.('isWebView')) return;

      const parsedMessage = JSON.parse(message.data);

      const { data, type } = parsedMessage;

      switch (type) {

        // EXAMPLE markers = [{ coordinates: { x: 0, y: 0 }, icon: <span>123</span> }]
        case 'markers': return setMarkers(data);

        // OSM JSONs [JSON, JSON, JSON]
        case 'geoJsons': return setGeoJsons(parsedMessage);

        // polylines = [{ positions: [{x: 0, y: 0}], color: 'blue' }]
        case 'polylines': return setPolylines(data);

        // mapData = { zoom: 13, center: CENTER_COORDINATES }
        case 'mapData': return setMapData(data);

        // trackedTransports = [{ trip_id: '0', licence_plate: '123', egsid: '0', 'car_hanlder': '0' }]
        case 'trackedTransports': return setTrackedTransports(data);
        default: {
          webViewSendMessage({ type: 'debug', message: 'no event' });
          return;
        }
      }
    } catch (e) {
      webViewSendMessage({ type: 'debug', message: e });
    }
  };

  const whenMapReady = (mapInstance) => {
    mapInstance.target?.on('zoomend', (e) => {
      // eslint-disable-next-line no-underscore-dangle
      setCurrentZoom(e?.target?._zoom);
    });
    window.addMarkers = addMarkers;
    webViewSendMessage('init');
  };

  useEffect(() => {
    const leafletControl = document.body.querySelector(
      '.leaflet-control-attribution',
    );

    if (leafletControl) {
      leafletControl.remove();
    }
  }, []);

  const onClickTrackedMarker = (trackedTransport) => {
    webViewSendMessage(`${trackedTransport.id}`);
  }

  useEffect(() => {
    window.addEventListener('message', webViewGetMessage, false);
  }, []);

  return (
    <>
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
        {polylines.map((positions, color = 'orange') => {
          return (
            <Polyline
              positions={positions.map(({ x, y }) => [x, y])}
              pathOptions={{ color }}
            />
          )
        })}
        <ZoomControl position="bottomright" />
        {geoJsons.map(geoJsonData => <GeoJSON data={geoJsonData} />)}
        {trackedTransports?.map?.((transport) => (
          <TransportTracking
            currentZoom={currentZoom}
            onClickMarker={onClickTrackedMarker}
            key={transport.id}
            transport={transport}
          />
        ))}
        {markers.map(item => {
          const { position, icon, id } = item;

          if (!(position?.lat && position?.lng)) return null;

          return (
            <Marker
              key={id}
              icon={createDivIcon(icon)}
              position={L.latLng(position?.lat, position?.lng)}
            />
          );
        })}
      </MapContainer>
    </>
  );
};

export default WebViewLeafletMap;
