import React from 'react'
import dateFormat,{ i18n } from "dateformat";

const useDateFormat = (date:string) => {

i18n.dayNames = [
  "Dom",
  "Lu",
  "Mar",
  "Mier",
  "Jue",
  "Vie",
  "Sab",
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Saabado",
];

i18n.monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];


	return date ? dateFormat(date,"dddd, d De mmmm, yyyy, h:MM:ss TT") : ''
}


export default useDateFormat