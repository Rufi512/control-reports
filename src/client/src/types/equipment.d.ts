export interface Equipment {
    description:string,
    asset_number:string,
    model:string,
    serial:string,
    brand:string,
    register_date?:{day:string,month:string,year:string},
    created_at?:string,
    updated_at?:string,
    id?:string
    _id?:string
}

export interface Evidences {
    file?: object | null
    url_file?:string
    description: string
    preview?: string
  }