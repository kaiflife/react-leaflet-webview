import React, { useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { webViewSendMessage } from './helpers'
import L from 'leaflet'
import { createDivIcon } from './mapHelper'

const buttonStyle = {
  width: '44px',
  height: '44px',
  minWidth: '44px',
  background: '#00A8E2',
  borderRadius: '24px',
  border: 'none'
  // color: BUTTON_BLUE,
  // svg: {
  //   fill: BUTTON_BLUE
  // }
}

function MyLocationIcon ({ color = 'white' }) {
  return (
    <svg width={24} height={24} viewBox='0 0 24 24' data-testid='NearMeIcon'>
      <path fill={color} d='M21 3 3 10.53v.98l6.84 2.65L12.48 21h.98z'></path>
    </svg>
  )
}

const getIcon = `<svg
              focusable='false'
              aria-hidden='true'
              width="24px"
              height="24px"
              viewBox='0 0 24 24'
              data-testid='LocationOnIcon'
            >
              <path
                fill='red'
                d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5'
              ></path>
            </svg>`

export default function MapControls ({ myLocation }) {
  const [position, setPosition] = useState(L.latLng(0, 0))
  // @ts-ignore
  const map = useMap()

  const getMyLocation = () => {
    if (myLocation.x !== 0) {
      const newPosition = L.latLng(myLocation.x, myLocation.y)
      setPosition(newPosition)
      map.flyTo(newPosition)
    } else {
      webViewSendMessage({
        type: 'permissions',
        data: ['location'],
        myLocation
      })
    }
  }

  return (
    <>
      {position.lat !== 0 && (
        <Marker icon={createDivIcon(getIcon, { iconAnchor: [11, 0]})} position={position}>
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
          <button style={buttonStyle} onClick={getMyLocation}>
            <MyLocationIcon />
          </button>
        </div>
      </div>
    </>
  )
}
