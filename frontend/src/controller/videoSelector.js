import React, { Component } from 'react';

const modesList = ['random', 'chase'];

class VideoSelector extends Component {
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
          placeholder="ducks,forest,avatar"
          style={{ height: '400px', width: '80%' }}
        />
      </div>
    )
  }

  render() {
    return (
      <div style={{ width: '50vw' }}>
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
          {this.props.selectedMode === 'chase' && this.renderSingleVideoSelector()}
          {this.props.selectedMode === 'random' && this.renderMultipleVideoSelector()}
        </div>
      </div>
    );
  }
}

export default VideoSelector;
