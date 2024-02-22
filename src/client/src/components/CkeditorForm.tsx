import { Alignment } from "@ckeditor/ckeditor5-alignment";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Bold, Italic } from "@ckeditor/ckeditor5-basic-styles";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { Link } from "@ckeditor/ckeditor5-link";
import { Indent } from "@ckeditor/ckeditor5-indent";
import { List } from "@ckeditor/ckeditor5-list";
import { SelectAll } from "@ckeditor/ckeditor5-select-all";
import { Style } from "@ckeditor/ckeditor5-style";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { GeneralHtmlSupport } from "@ckeditor/ckeditor5-html-support";

type Props = {
  previousData?: string;
  action: (content: any) => void;
  disabledCk: boolean;
};

const CkeditorForm = ({ previousData, action, disabledCk }: Props) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        plugins: [
          Heading,
          BlockQuote,
          Essentials,
          Bold,
          Italic,
          Paragraph,
          Link,
          Indent,
          List,
          SelectAll,
          GeneralHtmlSupport,
          Style,
        ],

        toolbar: {
          items: [
            "heading",
            "blockQuote",
            "bold",
            "italic",
            "link",
            "selectAll",
            "|",
            "indent",
            "outdent",
            "style",
            "|",
            "numberedList",
            "bulletedList",
            "|",
            "undo",
            "redo",
          ],
        },
        style: {
          definitions: [
            {
              name: "altura 1px",
              element: "p",
              classes: ["line20px"],
            },
            {
              name: "altura 1.2px",
              element: "p",
              classes: ["line25px"],
            },
            {
              name: "altura 1.5px",
              element: "p",
              classes: ["line30px"],
            },
            {
              name: "altura 2px",
              element: "p",
              classes: ["line35px"],
            },
            {
              name: "texto izquierda",
              element: "p",
              classes: ["textLeft"],
            },
            {
              name: "texto derecha",
              element: "p",
              classes: ["textRight"],
            },

            {
              name: "texto centrado",
              element: "p",
              classes: ["textCenter"],
            },
            {
              name: "texto justificado",
              element: "p",
              classes: ["textJustify"],
            },
          ],
        },
      }}
      disabled={disabledCk}
      data={previousData || ""}
      onReady={(editor) => {
        // You can store the "editor" and use when it is needed.
        console.log("Editor is ready to use!", editor);
      }}
      onChange={(event, editor) => {
        const data = editor.getData();
        action(data);
      }}
    />
  );
};

export default CkeditorForm;
