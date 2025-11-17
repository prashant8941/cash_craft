import { Paper } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import MainAppShell from "./components/MainAppShell";
import { AvailableCategoriesContextProvider } from "./store/AvailableCategoriesContext";
import { CategoriesContextProvider } from "./store/CategoriesContext";
import { HistoryContextProvider } from "./store/HistoryContext";



export default function App() {
  return (
    // Global styles
    <MantineProvider
      theme={{
        fontFamily: "Open Sans, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        colorScheme: "dark",
      }}
    >
      <Paper>
        {/* Contexts */}
        <AvailableCategoriesContextProvider>
          <HistoryContextProvider>
            <CategoriesContextProvider>
              <MainAppShell />
            </CategoriesContextProvider>
          </HistoryContextProvider>
        </AvailableCategoriesContextProvider>
      </Paper>
    </MantineProvider>
  );
}
