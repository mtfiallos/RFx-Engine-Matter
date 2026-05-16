import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';
import { RfxSubmission } from './rfxService';

export async function generateDocxExport(submission: RfxSubmission): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Executive Pursuit Dashboard Report",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Submission: ${submission.title}`,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          spacing: { after: 400 }
        }),
        
        new Paragraph({
          text: "Requirements Traceability Matrix",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        
        createTable(submission.data.requirements, ['ID', 'Source', 'Requirement', 'Status', 'Response / Notes']),

        new Paragraph({
          text: "Risk Register",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        
        createTable(submission.data.risks, ['ID', 'Title', 'Risk Level', 'Mitigation', 'Status']),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}

function createTable(items: any[], headers: string[]) {
  if (!items || items.length === 0) {
    return new Paragraph({ text: "No items found." });
  }

  const tableRows = items.map(item => {
    // Depending on the array type, we map differently
    let cells: string[] = [];
    if (item.category === 'risk' || item.level) { // crude type check for risk
       cells = [item.id, item.title || item.text || '', item.level || '-', item.mitigation || '-', item.status || 'open'];
    } else {
       cells = [item.id, item.sourceFile || '-', item.text || '', item.status || 'draft', item.response || ''];
    }

    return new TableRow({
      children: cells.map(text => new TableCell({
        children: [new Paragraph({ text: String(text) })],
        margins: { top: 100, bottom: 100, left: 100, right: 100 }
      }))
    });
  });

  const headerRow = new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
      shading: { fill: "D9D9D9" },
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    }))
  });

  return new Table({
    rows: [headerRow, ...tableRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
