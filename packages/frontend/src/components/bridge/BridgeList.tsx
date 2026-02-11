import type { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BridgeCard } from "./BridgeCard.tsx";

export interface BridgeListProps {
  bridges: BridgeDataWithMetadata[];
}

export const BridgeList = ({ bridges }: BridgeListProps) => {
  if (bridges.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <AddCircleOutlineIcon
            sx={{ fontSize: 48, color: "text.disabled" }}
          />
          <Typography variant="h6" color="text.secondary">
            No bridges yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Create your first bridge to start exposing Home Assistant devices to
            Matter.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {bridges.map((bridge) => (
        <Grid key={bridge.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <BridgeCard bridge={bridge} />
        </Grid>
      ))}
    </Grid>
  );
};
