import React, { useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { webViewSendMessage } from './helpers'
import { LatLng } from 'leaflet'

const buttonStyle = {
  width: '44px',
  height: '44px',
  minWidth: '44px',
  background: 'white',
  borderRadius: '8px'
  // color: BUTTON_BLUE,
  // svg: {
  //   fill: BUTTON_BLUE
  // }
}

export default function MapControls ({ myLocation }) {
  const [position, setPosition] = useState(null)
  // @ts-ignore
  const map = useMap();

  const getMyLocation = () => {
    if (myLocation) map.flyTo(LatLng(myLocation))
    if (!myLocation) webViewSendMessage({ type: 'permissions', data: ['location'], myLocation })
  }

  return (
    <>
      {position !== null && (
        <Marker position={position}>
          <Popup>Ваше местоположение</Popup>
        </Marker>
      )}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          width: '100%',
          height: '100%',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 401,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            paddingRight: '4px'
          }}
        >
          <button onClick={getMyLocation} style={buttonStyle}>
            ->
          </button>
        </div>
      </div>
    </>
  )
}
