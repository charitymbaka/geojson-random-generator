import React, { Component } from "react";
import ReactMapboxGl, { GeoJSONLayer, ZoomControl } from "react-mapbox-gl";
import DrawControl from "react-mapbox-gl-draw";
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";
import turfRandom from "turf-random";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import geojsonExtent from "geojson-extent";
import fileDownload from "js-file-download";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoiY3dob25nbnljIiwiYSI6ImNpczF1MXdrdjA4MXcycXA4ZGtyN2x5YXIifQ.3HGyME8tBs" +
    "6BnljzUVIt4Q"
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geojson: null,
      bbox: null,
      num: 100,
      drawing: false
    };
  }
  generateGeojson = bbox => {
    const geojson = turfRandom("points", this.state.num, {
      bbox: bbox
    });
    this.setState({ geojson: geojson });
  };
  handleonDrawCreate = ({ features }) => {
    const feature = features[0];
    const bbox = geojsonExtent(feature);
    this.generateGeojson(bbox);
    this.drawControl.draw.deleteAll();
    this.setState({ drawing: !this.state.drawing });
  };
  handleDrawButtonClick = e => {
    if (!this.state.drawing) {
      this.setState({ geojson: null });
      this.drawControl.draw.changeMode("draw_rectangle");
    } else {
      this.drawControl.draw.changeMode("simple_select");
    }
    this.setState({ drawing: !this.state.drawing });
  };

  handleDownloadClick = () => {
    fileDownload(JSON.stringify(this.state.geojson), "data.geojson");
  };
  handleonStyleLoad = () => {
    this.setState({ drawButton: true });
  };
  render() {
    return (
      <div>
        {this.state.drawButton && (
          <div style={{ position: "fixed", zIndex: "9999", padding: "20px" }}>
            <button onClick={this.handleDrawButtonClick}>
              {this.state.drawing ? "Cancel" : "Draw Extent"}
            </button>
            <p>
              {this.state.drawing &&
                "Click on map and Move mouse to draw a rectangular extent"}
            </p>
          </div>
        )}
        <div
          style={{
            position: "fixed",
            zIndex: "9999",
            padding: "20px",
            right: "20px",
            bottom: "20px"
          }}
        >
          {this.state.geojson && (
            <button onClick={this.handleDownloadClick}>Download</button>
          )}
        </div>
        <Map
          style="mapbox://styles/mapbox/streets-v9"
          attributionControl={false}
          containerStyle={{
            height: "100vh",
            width: "100vw"
          }}
          center={[37.87978, -0.24197]}
          zoom={[6]}
          onStyleLoad={this.handleonStyleLoad}
        >
          {this.state.geojson && (
            <GeoJSONLayer
              data={this.state.geojson}
              circlePaint={{
                "circle-color": "red",
                "circle-radius": 5
              }}
            />
          )}
          <ZoomControl />
          <DrawControl
            ref={drawControl => {
              this.drawControl = drawControl;
            }}
            displayControlsDefault={false}
            modes={{ draw_rectangle: DrawRectangle }}
            onDrawCreate={this.handleonDrawCreate}
          />
        </Map>
      </div>
    );
  }
}

export default App;