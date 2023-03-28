export interface Equipment{
    description:string,
    asset_number:string,
    model:string,
    serial:string,
    brand:string,
    register_date:{day:string,month:string,year:string},
    id?:string
}
