import React, { Component } from 'react';

class TimingInfo extends Component {
  render() {
    const { sent, serverReceived, clientReceived, videoPlayed } = this.props;
    const timeToServerReceived = serverReceived - sent;
    const timeToClientReceived = clientReceived - serverReceived;
    const timeToVideoPlayed = videoPlayed - clientReceived;
    const total = videoPlayed - sent;
    return (
      <div>
        Time in milliseconds
        <table border="1">
          <tbody>
            <tr>
              <th>
                message sent -> server received  
              </th>
              <th>
                -> client received
              </th>
              <th>
                -> video played
              </th>
              <th>
                total
              </th>
            </tr>
            <tr>
              <td>
                {timeToServerReceived}
              </td>
              <td>
                {timeToClientReceived}
              </td>
              <td>
                {timeToVideoPlayed}
              </td>
              <td>
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default TimingInfo;
