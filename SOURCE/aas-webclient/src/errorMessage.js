import React from 'react';

export class Error extends React.Component {
  render() {
    const { message } = this.props;
    return (
      <div className="alert alert-danger" role="alert">
        {message}
      </div>
    );
  }
}

export default Error;