import React from 'react';
import { Popup } from 'react-leaflet';
import './popup.css';

export default function StyledPopup({ data, onClick }) {
  return (
    <Popup>
      <button type="button" className='popup_button' onClick={onClick}>
        <span className='popup_strong_text'>
          Id
          {data.id}
        </span>
        <span className='popup_light_text'>
          Наименование обьекта:
          <br />
          <span className='popup_strong_text'>{data.name}</span>
        </span>
      </button>
    </Popup>
  );
}
