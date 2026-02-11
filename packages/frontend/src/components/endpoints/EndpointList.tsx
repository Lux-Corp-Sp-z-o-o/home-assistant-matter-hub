import type { EndpointData } from "@home-assistant-matter-hub/common";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { EndpointState } from "./EndpointState.tsx";
import { EndpointTreeView } from "./EndpointTreeView.tsx";

export interface EndpointListProps {
  endpoint: EndpointData;
}

export const EndpointList = (props: EndpointListProps) => {
  const [selectedItem, setSelectedItem] = useState<EndpointData | undefined>(
    undefined,
  );
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Endpoints
          </Typography>
        </Box>
        <EndpointTreeView
          endpoint={props.endpoint}
          onSelected={setSelectedItem}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {selectedItem ? (
          <EndpointState endpoint={selectedItem} />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <DeviceHubIcon sx={{ fontSize: 40, color: "text.disabled" }} />
              <Typography variant="body2" color="text.secondary">
                Select an endpoint to view its details
              </Typography>
            </Stack>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};
