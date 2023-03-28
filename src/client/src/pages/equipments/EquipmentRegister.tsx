import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Equipment } from "../../types/equipment";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../assets/styles/pages/equipment.css'
import { fieldTest } from "../../components/SomeFunctions";
const EquipmentRegister = () => {
    interface Evidences{
        file: object, 
        description: string
    }
    const [equipment,setEquipment] = useState<Equipment>({description:'',asset_number:'',model:'',serial:'',brand:'',register_date:''})
    const [evidences, setEvidences] = useState<Evidences[]>([])
    const handleAddEvidences = () => {
        //Add new object in evidences array
        setEvidences([...evidences, { file: {}, description: '' }])
    }

    const handleChanges = (event:ChangeEvent<HTMLInputElement>) =>{
        const {name,value} = event.target
        if(name === 'asset_number' && !fieldTest('number',value)) return
        setEquipment({...equipment,[name]:value})
    }

    const handleChangesEvidences = (event:ChangeEvent<HTMLInputElement>, position:number) =>{
        //Set value in specific position array
        const {name,value,files} = event.target
        const evidencesList = evidences
        if(name === 'description') evidences[position].description = value
        if(name === 'file' && files) evidences[position].file = files[0]
        console.log(evidences[position])
        console.log(evidences)
        setEvidences([...evidencesList])

    }

    const deleteEvidence = (position:number) =>{
        if(evidences.length - 1 !== position) return
        const evidencesFilter = evidences.filter((_el,i)=> position !== i)
        console.log(evidences)
        setEvidences(evidencesFilter)
    }

    const handleForm = (e:FormEvent) =>{
        e.preventDefault()
        console.log(evidences)
        console.log(equipment)
    }

    useEffect(() => {
        console.log(evidences)
    }, [evidences])
    return (
        <div className="container-fluid d-flex flex-row p-0">
            <Sidebar />
            <div className="container-fluid d-flex flex-column container-page">
                <div>
                    <h3 className="text-right">Registro de equipo</h3>
                    <hr />
                </div>
                <form className="container-fluid form-equipment" onSubmit={handleForm}>
                    <div className="form-row row fields-container">
                        <div className="form-group col-md-12">
                            <label htmlFor="model">Modelo del equipo</label>
                            <input type="text" className="form-control" id="model" name="model" placeholder="Logitech SR40" onChange={handleChanges} value={equipment.model || ''}/>
                        </div>
                    </div>
                    <div className="form-row row fields-container">
                        <div className="form-group col-md-6">
                            <label htmlFor="serial">Serial del equipo</label>
                            <input type="text" className="form-control" id="serial" name="serial" placeholder="1234 Main St" onChange={handleChanges} value={equipment.serial || ''} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="brand">Marca del equipo</label>
                            <input type="text" className="form-control" id="brand" name="brand" placeholder="Apartment, studio, or floor" onChange={handleChanges} value={equipment.brand || ''}/>
                        </div>
                    </div>
                    <div className="form-row row fields-container">
                        <div className="form-group col-md-6">
                            <label htmlFor="asset_number">Numero del bien</label>
                            <input type="text" className="form-control" id="asset_number" name="asset_number" placeholder="123434324"  onInput={handleChanges} value={equipment.asset_number || ''}/>
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="register_date">Fecha de registro</label>
                            <input type="date" className="form-control" id="register_date" name="register_date" onChange={handleChanges}/>
                        </div>
                    </div>

                    <div className="form-group fields-container">
                        <label style={{ marginBottom: '10px' }}>Descripcion del registro</label>
                        <CKEditor
                            editor={ClassicEditor}
                            config={{
                                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'numberedList', 'bulletedList','|', 'undo', 'redo']
                            }}
                            data={equipment.description}
                            onReady={editor => {
                                // You can store the "editor" and use when it is needed.
                                console.log('Editor is ready to use!', editor);
                            }}
                            onChange={(_event, editor) => {
                                const data = editor.getData();
                                setEquipment({...equipment,description:data})
                            }}
                        />
                    </div>

                    <div className="form-group mt-3">
                        <h5>Evidencias del registro</h5>
                        {
                            evidences.length > 0 ? evidences.map((_el,i)=>{
                                    return(
                                        <div className="form-row column " style={{ padding: '10px 12px' }} key={i}>
                                        <div className="form-row row " >
                                            <div className="form-group col-md-6">
                                            <label htmlFor="name">Evidencia {i+1}</label>
                                            <input name="file" type="file" className="form-control" onChange={(e)=>handleChangesEvidences(e,i)} />
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="model">Descripcion</label>
                                            <input type="text" name="description" className="form-control" placeholder="descripcion" onChange={(e)=>handleChangesEvidences(e,i)} value={evidences[i].description || ''}/>
                                        </div>
                                    </div>
                                    {evidences.length -1 === i ? <div className="form-row row " style={{marginTop:'10px'}}>
                                    <button type="button" className="btn btn-danger col-md-4 m-lg-1" onClick={()=>deleteEvidence(i)}>Borrar</button>
                                    </div> : ''}
                                       
                                    </div>
                                    )
                                }) :  (<div className="form-row column ">
                                    <h2>Ninguna evidencia a registar</h2>
                                </div>)
                            }
                      
                        <div className="row p-2 justify-content-end" style={{ marginTop: '15px' }}>
                            <button type="button" className="btn btn-success col-md-4 m-lg-1" onClick={handleAddEvidences}>Añadir evidencia </button>
                        </div>
                    </div>

                    <hr />
                    <div className="row p-2 justify-content-end" style={{ marginTop: '15px' }}>
                        <button type="submit" className="btn btn-primary col-md-4 m-lg-1">Registrar Equipo</button>
                        <button type="submit" className="btn btn-primary col-md-4 m-lg-1">Registrar y Continuar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentRegister;
