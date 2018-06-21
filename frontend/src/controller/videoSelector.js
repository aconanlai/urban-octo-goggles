import React, { Component } from 'react';

class VideoSelector extends Component {
  render() {
    return (
      <div style={{ width: '50vw' }}>
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
    );
  }
}

export default VideoSelector;
