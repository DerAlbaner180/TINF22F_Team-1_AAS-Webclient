import React from 'react';

export class NoServerPage extends React.Component {
    render() {
      const { message } = this.props;
      return (
        <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: "25vh", backgroundColor: "#f8f9fa" }}>
          <div className="text-center" role="alert">
            <h1 className="mb-3">Server not available :/</h1>
            <p>{message}</p>
          </div>
        </div>
      );
    }
  }
  
  
export default NoServerPage;