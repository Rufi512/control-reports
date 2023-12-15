import React, { useEffect, useState } from "react";
import '../assets/styles/components/modal.css'
type Props = {
  active:boolean
  title: string;
  description: string;
  action:(cancel:boolean)=>void;
};

type State = {
  active:boolean
  title: string;
  description: string;
};

const ModalConfirmation = (props: Props) => {
  const [modal, setModal] = useState<State>({
    active:false,
    title: '',
    description: '',
  });
  useEffect(() => {
    setModal({
      active:props.active,
      title: props.title,
      description: props.description,
    });
  }, [props]);
  return (
    <div className="modal" role="dialog" style={{display: modal.active ? 'flex' : 'none'}}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{modal?.title}</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              style={{background:'none',border:'none',display:'flex',alignItems:'center'}}
              onClick={()=>{props.action(true)}}
            >
              <span aria-hidden="true" style={{fontSize:'24px'}}>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>{modal?.description}</p>
          </div>
          <div className="modal-footer">
          <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={()=>{props.action(true)}}
            >
              Cerrar
            </button>
            <button type="button" onClick={()=>props.action(false)} className="btn btn-primary">
              Continuar
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmation;
