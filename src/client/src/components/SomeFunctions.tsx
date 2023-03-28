export const fieldTest = (field:string,value:any) =>{
    if(field === "string"){
      if(!value) return true
      if(!/^[A-Za-záéíóúñ'´ ]+$/.test(value)){
        return false
      }
      return true
    }
  
    if(field === "number"){
      if(!value) return true
      if (!Number(value) || !Number.isInteger(Number(value)) || Number(value) < 0 || !/^\d+$/.test(value)){
        return false
      }
      return true
    }
  }