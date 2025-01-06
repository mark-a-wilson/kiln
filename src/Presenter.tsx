import React from "react";
import Renderer from "./Renderer";

interface PresenterProps {
  data: any;
  mode: string;
  goBack?: () => void; // Add a goBack prop
}

const Presenter: React.FC<PresenterProps> = ({ data, mode , goBack }) => {

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return <div>Retrieving ICM Data...</div>;
  }

  return <Renderer data={data} mode={mode} goBack={goBack}/>;
};

export default Presenter;
