import React from "react";
import Renderer from "./Renderer";

interface PresenterProps {
  data: any;
}

const Presenter: React.FC<PresenterProps> = ({ data }) => {

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return <div>Retrieving ICM Data...</div>;
  }

  return <Renderer data={data} />;
};

export default Presenter;
