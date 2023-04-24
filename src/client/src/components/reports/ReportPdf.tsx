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
import { Report } from "../../types/report";
import { parse } from "node-html-parser";
import { Equipment } from "../../types/equipment";
import Html from "react-pdf-html";

type props = {
  data: Report;
  equipments: Equipment[]
};

import source1 from "../../assets/fonts/Open_Sans/static/OpenSans-Bold.ttf";
import source2 from "../../assets/fonts/Open_Sans/static/OpenSans-Italic.ttf";
import source3 from "../../assets/fonts/Open_Sans/static/OpenSans-Regular.ttf";


const ReportPdf = ({ data, equipments }: props) => {
  Font.register({
    family: "OpenSans",
    fonts: [
      { src: source1, fontWeight: 600 }, // font-style: normal, font-weight: normal
      { src: source2, fontStyle: "italic" },
      { src: source3 },
    ],
  });

  const noteHtml = parse(data.note);
  const descriptionHtml = parse(data.description);

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
          <Text style={styles.title}>Reporte tecnico</Text>
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
                    <Text style={styles.tableCell}>{el.serial}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{el.asset_number}</Text>
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
          <Text style={styles.date}>
            Santa Ana de Coro, a {data.register_date.day} día del mes de {months[Number(data.register_date.month) - 1]} del {data.register_date.year}
          </Text>
        </View>
        <View style={styles.footer}>
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
    </Document>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 30,
    fontFamily: "OpenSans",
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
  },

  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#000",
    marginBottom: 10,
  },

  description: {
    fontSize: 11,
    lineHeight: 1.35,
  },

  note: {
    padding: 0,
    marginTop: 10,
    fontSize: 11,
    lineHeight: 1.35,
    color: "black",
    fontFamily: "OpenSans",
  },

  date: {
    marginTop: 55,
    marginLeft: "auto",
    fontSize: 12,
    textAlign: "right",
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
  },
  authorData: {
    textAlign:'center',
    textTransform: "uppercase",
    fontWeight: 600,
  },
  footer: {
    marginTop: "auto",
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
  },

  link: {
    textAlign: "right",
    fontSize: 8,
    color: "#303030",
  },

  table: {
    marginTop: 10,
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
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
});

export default ReportPdf;