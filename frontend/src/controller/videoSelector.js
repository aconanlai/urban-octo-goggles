import React, { Component } from 'react';

const modesList = ['random', 'chase'];

class VideoSelector extends Component {
  renderSingleImageSelector() {
    return (
      <div>
        Enter an interval (milliseconds):
        <input type="number" value={this.props.selectedInterval} onChange={this.props.handleIntervalSelect} />
        <br />
        <br />
        Enter a duration (milliseconds):
        <input type="number" value={this.props.selectedImageDuration} onChange={this.props.handleImageDurationSelect} />
        <br />
        <br />
        Select an image:
        <ul>
          {this.props.imageList.map((image) => {
            return (
              <li
                key={image}
                style={{ color: this.props.selectedImage === image ? 'green' : 'black', cursor: 'pointer' }}
                onClick={() => { this.props.handleImageSelect(image) }}
              >
                {image}
              </li>
            );
          })}
        </ul>
        <br />
        <br />
      </div>
    )
  }

  renderMultipleImageSelector() {
    return (
      <div>
        Enter a duration (milliseconds):
        <input type="number" value={this.props.selectedImageDuration} onChange={this.props.handleImageDurationSelect} />
        <br />
        <br />
        <br />
        Enter comma separated list of imagesIds from above list:
        <br />
        <textarea
          value={this.props.selectedImageList}
          onChange={this.props.handleMultipleImageSelect}
          placeholder="light3,text_byod,face_red"
          style={{ height: '100px', width: '80%' }}
        />
        <br />
        <br />
        Available images:
        <ul>
          {this.props.imageList.map((image) => {
            return (
              <li
                key={image}
              >
                {image}
              </li>
            );
          })}
        </ul>
        
      </div>
    )
  }

  renderSingleVideoSelector() {
    return (
      <div>
        Select a video:
        <ul>
          {this.props.videoList.map((video) => {
            return (
              <li
                key={video}
                style={{ color: this.props.selectedVideo === video ? 'green' : 'black', cursor: 'pointer' }}
                onClick={() => { this.props.handleVideoSelect(video) }}
              >
                {video}
              </li>
            );
          })}
        </ul>
        <br />
        <br />
        Enter an interval (milliseconds):
        <input type="number" value={this.props.selectedInterval} onChange={this.props.handleIntervalSelect} />
      </div>
    )
  }

  renderMultipleVideoSelector() {
    return (
      <div>
        Available videos:
        <ul>
          {this.props.videoList.map((video) => {
            return (
              <li
                key={video}
              >
                {video}
              </li>
            );
          })}
        </ul>
        <br />
        Enter comma separated list of videoIds from above list:
        <br />
        <textarea
          value={this.props.selectedVideoList}
          onChange={this.props.handleMultipleVideoSelect}
          placeholder="lightdownward,headback3app,resting"
          style={{ height: '400px', width: '80%' }}
        />
      </div>
    )
  }

  render() {
    return (
      <div style={{ width: '50vw' }}>
        <div>
          Select a media type:
          <br />
          <select value={this.props.selectedMediaType} onChange={this.props.handleMediaTypeSelect}>
            <option value="video">video</option>
            <option value="image">image</option>
            <option value="kill">kill</option>
          </select>
        </div>
        <br />
        {
          this.props.selectedMediaType !== 'kill' &&
          (
            <div>
              Select a mode:
          <br />
              <ul>
                {modesList.map((mode) => {
                  return (
                    <li
                      key={mode}
                      style={{ color: this.props.selectedMode === mode ? 'green' : 'black', cursor: 'pointer' }}
                      onClick={() => { this.props.handleModeSelect(mode) }}
                    >
                      {mode}
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        }
        <div>
          {this.props.selectedMode === 'chase' && this.props.selectedMediaType === 'video' && this.renderSingleVideoSelector()}
          {this.props.selectedMode === 'random' && this.props.selectedMediaType === 'video' && this.renderMultipleVideoSelector()}
          {this.props.selectedMode === 'chase' && this.props.selectedMediaType === 'image' && this.renderSingleImageSelector()}
          {this.props.selectedMode === 'random' && this.props.selectedMediaType === 'image' && this.renderMultipleImageSelector()}
        </div>
      </div>
    );
  }
}

export default VideoSelector;
