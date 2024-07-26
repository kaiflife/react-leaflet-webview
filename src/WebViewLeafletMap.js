import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMapEvent
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import TransportTracking from './TransportTracking'
import { createDivIcon } from './mapHelper'
import MapControls from './MapControls'
import { webViewSendMessage } from './helpers'

const CENTER_COORDINATES = [59.9342802, 30.3350986]

// @ts-ignore
const getWebViewObject = () =>
  JSON.parse(window.ReactNativeWebView.injectedObjectJson())

const testMarkers = [
  {
    icon: `<div><svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="14" height="14" rx="4" fill="#E85050"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.35636 9.75211L2.91668 6.41666L10.7729 6.41666V7.58333H5.7957L7.16853 8.91456L6.35636 9.75211Z" fill="white"/>
</svg></div>`,
    id: 0.34215181196442107,
    x: 61.0372,
    y: 30.1202,
    size: [24, 24],
    tooltipText:
      'LOOOOONG TEXTLOOOOONG TEXTLOOOOONG TEXTLOOOOONG TEXTLOOOOONG TEXTLOOOOONG TEXTLOOOOONG TEXT'
  },
  {
    icon: `<div><svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="14" height="14" rx="4" fill="#8CC63F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.9165 4.83122L11.3562 8.16666H3.5V7H8.47716L7.10433 5.66877L7.9165 4.83122Z" fill="white"/>
</svg>
</div>`,
    id: 0.21362068715493168,
    x: 59.4237,
    y: 30.6809,
    size: [24, 24],
    tooltipText: '123'
  }
]

function DisableMarkerTooltip ({ setSelectedMarker }) {
  useMapEvent({
    click () {
      setSelectedMarker(null)
    },
    tap (item) {
      webViewSendMessage(item)
    }
  })
}

const WebViewLeafletMap = () => {
  const mapRef = useRef()
  const [polylines, setPolylines] = useState([])
  const [clickedMarkerId, setClickedMarkerId] = useState(null)
  const [geoJsons, setGeoJsons] = useState([])
  const [hasLocation, setHasLocation] = useState(false)
  const [mapData, setMapData] = useState({
    zoom: 13,
    center: CENTER_COORDINATES
  })
  const [markers, setMarkers] = useState(testMarkers)
  const [trackedTransports, setTrackedTransports] = useState([])
  const [currentZoom, setCurrentZoom] = useState(11)

  const setterByName = {
    setMarkers,
    setPolylines,
    setGeoJsons,
    setTrackedTransports,
    setMapData,
    setHasLocation
  }

  const addEntity = name => {
    webViewSendMessage({ addEntityname: name })
    try {
      const webViewEntityData = getWebViewObject()[name]

      // DEBUG
      // webViewSendMessage({ webViewEntityData })
      // webViewSendMessage({ name })
      webViewSendMessage({
        setterByName:
          setterByName[`set${name[0].toUpperCase()}${name.slice(1)}`]
      })

      if (webViewEntityData) {
        webViewSendMessage({ webViewEntityData })
        setterByName[`set${name[0].toUpperCase()}${name.slice(1)}`](
          webViewEntityData
        )
      }
    } catch (e) {
      alert(e)
      webViewSendMessage(e)
    }
  }

  const whenMapReady = mapInstance => {
    mapInstance.target?.on('zoomend', e => {
      // eslint-disable-next-line no-underscore-dangle
      setCurrentZoom(e?.target?._zoom)
    })
    window.addEntity = addEntity
    window.boundsToCoordinates = boundsToCoordinates
    webViewSendMessage('init')
  }

  const boundsToCoordinates = () => {
    const bounds = getWebViewObject().bounds

    if (bounds?.length) {
      mapRef.current.fitBounds(bounds)
      setTimeout(() => {
        mapRef?.current?.zoomOut()
      }, 50)
    }
  }

  useEffect(() => {
    const leafletControl = document.body.querySelector(
      '.leaflet-control-attribution'
    )

    if (leafletControl) {
      leafletControl.remove()
    }
  }, [])

  return (
    <>
      <MapContainer
        whenReady={whenMapReady}
        ref={mapRef}
        center={mapData.center}
        className='markercluster-map'
        zoom={mapData.zoom}
        id='leaflet-webview-map'
        zoomControl={false}
        attributionControl={false}
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <TileLayer
          attribution='&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          setParams
        />
        {polylines.map(({ positions, color = 'orange' }) => {
          if (!positions?.length) return null

          return (
            <Polyline
              positions={positions.map(({ x, y }) => [x, y])}
              pathOptions={{
                color
              }}
            />
          )
        })}
        {geoJsons.map(geoJsonData => (
          <GeoJSON data={geoJsonData} />
        ))}
        <MapControls hasLocation={hasLocation} />
        <DisableMarkerTooltip setSelectedMarker={setClickedMarkerId} />
        {trackedTransports?.map?.(transport => (
          <TransportTracking
            currentZoom={currentZoom}
            key={transport.id}
            transport={transport}
          />
        ))}
        {markers.map(item => {
          const { x, y, icon, id, tooltipText = '' } = item

          if (!(x && y)) return null

          return (
            <Marker
              key={id}
              eventHandlers={{
                click: e => {
                  if (tooltipText) setClickedMarkerId(id)

                  // eslint-disable-next-line no-underscore-dangle
                  setTimeout(
                    // todo timed solution for map focus
                    // eslint-disable-next-line no-underscore-dangle
                    () => {
                      e?.target?._map?.setView([e.latlng.lat, e.latlng.lng])
                    },
                    0
                  )

                  webViewSendMessage({
                    ...item,
                    type: 'marker'
                  })
                }
              }}
              icon={createDivIcon(icon)}
              position={L.latLng(x, y)}
            >
              {tooltipText && clickedMarkerId === id && (
                <Tooltip
                  direction='top'
                  offset={[2, 0]}
                  opacity={0.8}
                  permanent
                >
                  <p>{tooltipText}</p>
                </Tooltip>
              )}
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}

export default WebViewLeafletMap
