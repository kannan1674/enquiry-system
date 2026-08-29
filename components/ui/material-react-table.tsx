import React from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// Example User type for reference (can be replaced by consumer)
export interface User {
  name: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  age: number;
}

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
  },
});

interface MaterialReactTableComponentProps<T extends object> {
  columns: MRT_ColumnDef<T>[];
  data: T[];
}

export function MaterialReactTableComponent<T extends object>({ columns, data }: MaterialReactTableComponentProps<T>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MaterialReactTable columns={columns} data={data} />
    </ThemeProvider>
  );
} 