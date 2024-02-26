import {
  Document,
  Page,
  View,
  Image,
  Text,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import logo from "../../assets/images/mp.png";
import computer from "../../assets/images/computer.png";
import { Evidences, Report } from "../../types/report";
import { parse } from "node-html-parser";
import { Equipment } from "../../types/equipment";
import Html from "react-pdf-html";

type props = {
  data: Report;
  evidences:Evidences[];
  equipments: Equipment[]
};

import source1 from "../../assets/fonts/Arial/Arial_Bold.ttf";
import source2 from "../../assets/fonts/Arial/Arial_Bold_Italic.ttf";
import source3 from "../../assets/fonts/Arial/Arial.ttf";
import source4 from "../../assets/fonts/Arial/Arial_Italic.ttf"


const ReportPdf = ({ data, equipments, evidences }: props) => {
  Font.register({
    family: "Arial",
    fonts: [
      { src: source1, fontWeight: 600 }, // font-style: normal, font-weight: normal
      { src: source4, fontStyle: "italic" },
      { src: source3},
      { src: source2, fontWeight:600, fontStyle:"italic"}
    ],
  });


  const stylesBlock:any = {
    'line20px':'line-height: 1px;',
    'line25px':'line-height: 1.5px;',
    'line30px':'line-height: 1.8px;',
    'line35px':'line-height: 2.3px;',
    'textCenter':'text-align: center;',
    'textLeft':'text-align: left;',
    'textRight':'text-align: right;',
    'textJustify':'text-align: justify;'
  }

  function classToProperty(textoHTML:any) {
    // Create a temporary element to store HTML text
    var itemTemporal = document.createElement('div');
    itemTemporal.innerHTML = textoHTML;
  
    // Get all HTML text elements
    var elementsHtml = itemTemporal.getElementsByTagName('*');
  
    // Each all elements and transfer class properties to the "style" attribute.
    for (var i = 0; i < elementsHtml.length; i++) {
      var element = elementsHtml[i];
      var classStyles = element.classList;
      const stylesAssign = Array.from(classStyles)
      // Obtain individual properties
          var propiedades = '';
          if(stylesAssign.length > 0){
            stylesAssign.forEach((el)=>{
              propiedades += stylesBlock[`${el}`]
            })
          }
          

        // Apply the properties to the element's "style" attribute
        element.setAttribute('style', propiedades);
    }
  
    // Get the modified HTML text
    var htmlMod = itemTemporal.innerHTML;
  
    // // Return HTML text with transferred styles
    return htmlMod;
  }
  

  const descriptionReport = classToProperty(data.description);
  const noteReport = classToProperty(data.note);

  const noteHtml = parse(noteReport);
  const descriptionHtml = parse(descriptionReport);
  const stylesheet = {
    p: {
      margin: 0,
      marginTop: 5,
    },
    i: {
      fontStyle: "italic",
    },
    
  };

  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  return (
    <Document>
      <Page style={styles.body}>
        <View style={styles.header} fixed>
          <Image style={styles.logo} src={logo} />
          <View style={styles.contentHead}>
            <Text style={styles.head}>República Bolivariana de Venezuela</Text>
            <Text style={styles.head}>Ministerio Público</Text>
            <Text style={styles.head}>Informática Estado Falcón</Text>
          </View>
          <Image style={styles.logo} src={computer} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{data.record_type_custom}</Text>
          <Html
            style={styles.description}
            stylesheet={stylesheet}
          >{`${descriptionHtml}`}</Html>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>MARCA</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>MODELO</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>SERIAL</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>N DE BIEN</Text>
              </View>
 
            </View>
            {equipments.map((el: Equipment, i: number) => {
              return (
                <View style={styles.tableRow} key={i}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{el.brand}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{el.model}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{el.serial || 'N/A'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{el.asset_number || 'No especificado'}</Text>
                  </View>

                </View>
              );
            })}
          </View>
          <View style={styles.note}>
            <Html
              style={styles.note}
              stylesheet={stylesheet}
            >{`${noteHtml}`}</Html>
          </View>
          
        </View>
        <View style={styles.footer} fixed>
        <Text style={styles.date}>
            Santa Ana de Coro, a {data.register_date.day} día del mes de {months[Number(data.register_date.month) - 1]} del {data.register_date.year}
          </Text>
          <View style={styles.author}>
            <Text style={styles.authorData}>{data.user?.firstname} {data.user?.lastname}</Text>
            <Text style={styles.authorData}>{data.user?.position}</Text>
            <Text style={styles.authorData}>
              EN LA CIRCUNSCRIPCIÓN JUDICIAL DEL ESTADO FALCÓN.
            </Text>
          </View>
          <Text style={styles.direction}>
            Avenida. Manaure, esquina Ruiz Pineda, Edificio Sede del Ministerio
            Público, Nivel Mezanina. Coro Estado Falcón Teléfono/Fax:
            (0268)-2530009.
          </Text>
          <View style={styles.footerLink}>
            <Text style={styles.link}>http://www.ministeriopublico.gob.ve</Text>
          </View>
        </View>
      </Page>

      
      {evidences ? evidences.map((el,i)=>{
        return(
          <Page style={styles.body}>
          <View style={styles.header} fixed>
            <Image style={styles.logo} src={logo} />
            <View style={styles.contentHead}>
              <Text style={styles.head}>República Bolivariana de Venezuela</Text>
              <Text style={styles.head}>Ministerio Público</Text>
              <Text style={styles.head}>Informática Estado Falcón</Text>
            </View>
            <Image style={styles.logo} src={computer} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{data.record_type_custom}</Text>
            <Text style={styles.subtitle}>Evidencia {i+1}</Text>
            <Image style={styles.evidence} src={"/" + el.url_file} />
            <Text style={styles.description}>{el.description}</Text>
          </View>
          <View style={styles.footer} fixed>
            <View style={styles.footerLink}>
              <Text style={styles.link}>http://www.ministeriopublico.gob.ve</Text>
            </View>
          </View>
        </Page>
        )
      }) : ''}
   


    </Document>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 235,
    paddingHorizontal: 50,
    fontFamily: "Arial",
  },
  head: {
    fontSize: 12,
    width: 250,
    margin: "auto",
    textAlign: "center",
    color: "black",
  },
  contentHead: {
    margin: "auto",
    height: 50,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 80,
  },

  content: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    lineHeight:1.35
  },

  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#000",
    marginBottom: 10,
    lineHeight:1.35,
    fontFamily: "Arial"
  },

  subtitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#000",
    marginBottom: 10,
    fontFamily: "Arial"
  },

  description: {
    fontSize: 11,
    lineHeight: 1.65,
    fontFamily: "Arial",
  },

  note: {
    padding: 0,
    marginTop: 10,
    fontSize: 11,
    lineHeight: 1.35,
    color: "black",
    fontFamily: "Arial",
  },

  evidence:{
    height:230,
    marginBottom:30
  },

  date: {
    marginTop: 55,
    marginBottom:75,
    fontSize: 12,
    textAlign: "right",
    fontFamily: "Arial"
  },
  author: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: 250,
    height: 65,
    margin: "auto",
    marginBottom: 10,
    fontSize: 14,
    textAlign: "center",
    color: "black",
    fontFamily: "Arial",
  },
  authorData: {
    textAlign:'center',
    textTransform: "uppercase",
    fontWeight: 600,
    fontFamily: "Arial",
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    marginTop: "auto",
    fontFamily: "Arial",
  },
  direction: {
    margin: "auto",
    marginBottom: "10px",
    width: "90%",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 1.3,
  },
  footerLink: {
    marginTop: "auto",
    width: "100%",
    backgroundColor: "#70a6d5",
    padding: "2px 0",
    paddingRight:5,
    fontFamily: "Arial",
  },

  link: {
    textAlign: "right",
    fontSize: 8,
    color: "#303030",
  },

  table: {
    marginTop: 10,
    marginLeft:40,
    marginRight:40,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    width:"100%",
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "29.8%",
    backgroundColor: "#d7d7d7",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "2px auto",
    padding:'0px 2px',
    textAlign: "center",
    fontSize: 11,
  },

  tableCellHeader: {
    margin: "5px auto",
    fontSize: 12,
    fontWeight: 600,
  },

  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },

  line20px:{
    lineHeight: 20
  },

  line25px:{
    lineHeight: 25
  },

  line30px:{
    lineHeight: 30
  },

  line35px:{
    lineHeight: 35
}
});

export default ReportPdf;