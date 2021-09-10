import React from "react";
import Spinner from 'react-bootstrap/Spinner';

const SpinnerWidget = () => {
  return (
    <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
};

export default SpinnerWidget;