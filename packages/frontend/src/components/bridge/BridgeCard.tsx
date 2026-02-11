import {
  BridgeStatus,
  type BridgeDataWithMetadata,
} from "@home-assistant-matter-hub/common";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import PortableWifiOffIcon from "@mui/icons-material/PortableWifiOff";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import { navigation } from "../../routes.tsx";
import { FabricList } from "../fabric/FabricList.tsx";
import { BridgeStatusIcon } from "./BridgeStatusIcon.tsx";

export interface BridgeCardProps {
  bridge: BridgeDataWithMetadata;
}

const statusColor: Record<BridgeStatus, string> = {
  [BridgeStatus.Running]: "#4caf50",
  [BridgeStatus.Starting]: "#2196f3",
  [BridgeStatus.Stopped]: "#ff9800",
  [BridgeStatus.Failed]: "#f44336",
};

export const BridgeCard = ({ bridge }: BridgeCardProps) => {
  const fabrics = bridge.commissioning?.fabrics ?? [];

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) =>
            `0 4px 20px ${theme.palette.mode === "dark" ? "rgba(76,175,80,0.15)" : "rgba(27,107,58,0.1)"}`,
        },
      }}
    >
      {/* Status strip */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: statusColor[bridge.status],
        }}
      />

      <CardActionArea component={RouterLink} to={navigation.bridge(bridge.id)}>
        <CardContent sx={{ pt: 2.5 }}>
          <Stack spacing={1.5}>
            {/* Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {bridge.name}
              </Typography>
              <BridgeStatusIcon status={bridge.status} />
            </Box>

            {/* Stats row */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<DeviceHubIcon />}
                label={`${bridge.deviceCount} devices`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<PortableWifiOffIcon />}
                label={`Port ${bridge.port}`}
                size="small"
                variant="outlined"
              />
            </Stack>

            {/* Fabrics */}
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ minHeight: 24 }}
            >
              <Typography variant="caption" color="text.secondary">
                Fabrics:
              </Typography>
              {fabrics.length > 0 ? (
                <Box sx={{ fontSize: "1.3em", display: "flex", gap: 0.5 }}>
                  <FabricList fabrics={fabrics} />
                </Box>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  Not connected
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
