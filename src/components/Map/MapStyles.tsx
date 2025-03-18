
import styled from '@emotion/styled';

export const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;

  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px;
    overflow: hidden;
  }

  .leaflet-container {
    width: 100%;
    height: 100%;
  }
`;
