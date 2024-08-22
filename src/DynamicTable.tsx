import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
  Button,
} from "carbon-components-react";

interface DynamicTableProps {
  tableTitle: string;
  initialRows: number;
  initialColumns: number;
  initialHeaderNames: string;
}

interface RowData {
  [key: string]: string;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  tableTitle,
  initialRows,
  initialHeaderNames,
}) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);

  useEffect(() => {
    const headerArray = initialHeaderNames
      .split(",")
      .map((header) => header.trim());
    setHeaders(headerArray);

    const initialRowsData = Array.from({ length: initialRows }, () =>
      headerArray.reduce<RowData>((acc, header) => {
        acc[header] = "";
        return acc;
      }, {})
    );
    setRows(initialRowsData);
  }, [initialRows, initialHeaderNames]);

  const handleAddRow = () => {
    const newRow = headers.reduce<RowData>((acc, header) => {
      acc[header] = "";
      return acc;
    }, {});
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };

  const handleRowChange = (value: string, rowIndex: number, header: string) => {
    const updatedRows = rows.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [header]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };

  return (
    <div>
      <TableContainer title={tableTitle}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableHeader key={index}>{header}</TableHeader>
              ))}
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <TextInput
                      id={`row-${rowIndex}-cell-${cellIndex}`}
                      value={row[header]}
                      onChange={(e) =>
                        handleRowChange(e.target.value, rowIndex, header)
                      }
                      labelText={header}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    onClick={() => handleDeleteRow(rowIndex)}
                    kind="danger"
                  >
                    Delete row
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ marginTop: "20px" }}>
        <Button onClick={handleAddRow}>Add Row</Button>
      </div>
    </div>
  );
};

export default DynamicTable;
