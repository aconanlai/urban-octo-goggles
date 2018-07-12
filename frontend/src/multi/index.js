import React, { Component } from 'react';

class Multi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 0,
    }
  }

  handleChange = (e) => {
    this.setState({ number: e.target.value });
  }

  handleSubmit = () => {
    for (let i = 0; i < this.state.number; i += 1) {
      const randomHeightBonus = Math.floor(Math.random() * 100);
      const randomWidthBonus = Math.floor(Math.random() * 100);
      const randomTop = Math.floor(Math.random() * 400);
      const randomLeft = Math.floor(Math.random() * 700);
      console.log('hua');
      window.open(window.location.origin, '_blank', `width=${200 + randomWidthBonus},height=${400 + randomHeightBonus},top=${randomTop},left=${randomLeft}`);
    }
  }

  render() {
    return (
      <div>
        Number of clients to open:
        <input type="number" value={this.state.number} onChange={this.handleChange} />
        <br/>
        <button type="submit" onClick={this.handleSubmit}>Submit</button>
      </div>
    );
  }
}

export default Multi;
