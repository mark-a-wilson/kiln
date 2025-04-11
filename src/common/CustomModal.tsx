import React from "react";
import { Modal } from "carbon-components-react";

interface CustomModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ title, message, isOpen, onClose }) => {
  return (
    <Modal
      open={isOpen}
      modalHeading={title}
      //primaryButtonText="OK"
      onRequestClose={onClose}
      onRequestSubmit={onClose}
      passiveModal // Removes default buttons     
    >
      <div >  
      <p>{message}</p>
      </div>
      
    </Modal>
  );
};

export default CustomModal;