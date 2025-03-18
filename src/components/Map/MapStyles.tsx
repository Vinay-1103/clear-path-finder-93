
import styled from '@emotion/styled';

export const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .leaflet-container {
    width: 100%;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .leaflet-popup-content {
    margin: 10px 14px;
    font-size: 14px;
    line-height: 1.4;
  }

  .leaflet-control-zoom {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .leaflet-control-zoom a {
    width: 32px;
    height: 32px;
    line-height: 32px;
    background-color: white;
    color: #666;
  }

  .leaflet-control-zoom a:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;
