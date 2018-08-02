import React, { Component } from 'react';

const modesList = ['random', 'chase'];

class VideoSelector extends Component {
  renderSingleImageSelector() {
    return (
      <div>
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
        <br/>
        <br/>
        Enter an interval (milliseconds):
        <input type="number" value={this.props.selectedInterval} onChange={this.props.handleIntervalSelect} />
        <br/>
        <br/>
        Enter a duration (milliseconds):
        <input type="number" value={this.props.selectedImageDuration} onChange={this.props.handleImageDurationSelect} />
      </div>
    )
  }

  renderMultipleImageSelector() {
    return (
      <div>
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
        <br/>
        Enter comma separated list of imagesIds from above list:
        <br/>
        <textarea
          value={this.props.selectedImageList}
          onChange={this.props.handleMultipleImageSelect}
          placeholder="bananas,apples,pears"
          style={{ height: '400px', width: '80%' }}
        />
        <br/>
        <br/>
        Enter a duration (milliseconds):
        <input type="number" value={this.props.selectedImageDuration} onChange={this.props.handleImageDurationSelect} />
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
        <br/>
        <br/>
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
        <br/>
        Enter comma separated list of videoIds from above list:
        <br/>
        <textarea
          value={this.props.selectedVideoList}
          onChange={this.props.handleMultipleVideoSelect}
          placeholder="ducks,forest,waterfall"
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
          <br/>
          <select value={this.props.selectedMediaType} onChange={this.props.handleMediaTypeSelect}>
            <option value="video">video</option>
            <option value="image">image</option>
          </select>
        </div>
        <br/>
        <div>
          Select a mode:
          <br/>
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
