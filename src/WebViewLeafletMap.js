// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
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

const testMarkers = [{
  "icon": `<div><svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="14" height="14" rx="4" fill="#E85050"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.35636 9.75211L2.91668 6.41666L10.7729 6.41666V7.58333H5.7957L7.16853 8.91456L6.35636 9.75211Z" fill="white"/>
</svg></div>`, "id": 0.34215181196442107, "position": { "lat": 61.0372, "lng": 30.1202 }, "size": [24, 24]
}, {
  "icon": `<div><svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="14" height="14" rx="4" fill="#8CC63F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.9165 4.83122L11.3562 8.16666H3.5V7H8.47716L7.10433 5.66877L7.9165 4.83122Z" fill="white"/>
</svg>
</div>`, "id": 0.21362068715493168, "position": { "lat": 59.4237, "lng": 30.6809 }, "size": [24, 24]
}]

const WebViewLeafletMap = () => {
  const [polylines, setPolylines] = useState([]);
  const [geoJsons, setGeoJsons] = useState([]);
  const [mapData, setMapData] = useState({
    zoom: 13,
    center: CENTER_COORDINATES,
  });
  const [markers, setMarkers] = useState([]);
  const [trackedTransports, setTrackedTransports] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(11);

  const setterByName = useMemo(() => ({
    setMarkers,
    setPolylines,
    setGeoJsons,
    setTrackedTransports,
    setMapData,
  }), []);

  const addEntity = (name) => {
    webViewSendMessage(name)
    try {
      const webViewEntityData = getWebViewObject()[name];

      if (webViewEntityData?.length) setterByName[`set${name[0].toUpperCase()}${name.slice(1)}`](webViewEntityData);
    } catch (e) {
      alert(e);
      webViewSendMessage(e)
    }
  };

  const whenMapReady = (mapInstance) => {
    mapInstance.target?.on('zoomend', (e) => {
      // eslint-disable-next-line no-underscore-dangle
      setCurrentZoom(e?.target?._zoom);
    });
    window.addEntity = addEntity;
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
        {polylines.map(({ positions, color = 'orange' }) => {
          if (!positions?.length) return null;

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
          const { x, y, icon, id } = item;

          if (!(x && y)) return null;

          return (
            <Marker
              key={id}
              icon={createDivIcon(icon)}
              position={L.latLng(x, y)}
            />
          );
        })}
      </MapContainer>
    </>
  );
};

export default WebViewLeafletMap;
