import type { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RemoveIcon from "@mui/icons-material/Remove";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { navigation } from "../../routes.tsx";
import { FabricList } from "../fabric/FabricList.tsx";

export interface BridgeDetailsProps {
  readonly bridge: BridgeDataWithMetadata;
}

export const BridgeDetails = ({ bridge }: BridgeDetailsProps) => {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack spacing={2.5}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Pairing bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <BasicInfo bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <CommissioningInfo bridge={bridge} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {bridge.filter.include.map((filter, idx) => (
            <Chip
              key={idx.toString()}
              size="small"
              icon={<AddIcon />}
              label={
                <span>
                  <strong>{filter.type}</strong>: {filter.value}
                </span>
              }
              color="success"
            />
          ))}
          {bridge.filter.exclude.map((filter, idx) => (
            <Chip
              key={idx.toString()}
              size="small"
              icon={<RemoveIcon />}
              label={
                <span>
                  <strong>{filter.type}</strong>: {filter.value}
                </span>
              }
              color="error"
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

const CopyButton = ({ value }: { value: string }) => {
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);
  return (
    <Tooltip title="Copy">
      <IconButton size="small" onClick={copy} sx={{ ml: 0.5 }}>
        <ContentCopyIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Tooltip>
  );
};

const InfoRow = ({
  label,
  value,
  copiable,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  copiable?: string;
  mono?: boolean;
}) => (
  <TableRow sx={{ "&:last-child td": { borderBottom: 0 } }}>
    <TableCell
      sx={{ py: 0.75, px: 1, color: "text.secondary", whiteSpace: "nowrap" }}
    >
      <Typography variant="caption" fontWeight={600}>
        {label}
      </Typography>
    </TableCell>
    <TableCell sx={{ py: 0.75, px: 1 }}>
      <Box display="flex" alignItems="center">
        <Typography
          variant="body2"
          fontFamily={mono ? "monospace" : "inherit"}
          sx={{ wordBreak: "break-all" }}
        >
          {value}
        </Typography>
        {copiable && <CopyButton value={copiable} />}
      </Box>
    </TableCell>
  </TableRow>
);

const Pairing = (props: { bridge: BridgeDataWithMetadata }) => {
  if (!props.bridge.commissioning) {
    return null;
  }
  return (
    <Box display="flex" justifyContent="center">
      <Box
        position="relative"
        sx={{ width: { xs: 120, sm: 140, md: 160 }, maxWidth: "100%" }}
      >        {props.bridge.commissioning.isCommissioned && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{
              transform: "translate(-50%, -50%) rotate(-45deg)",
              zIndex: 1,
            }}
          >
            <Alert color="success" variant="filled">
              <Typography
                variant="body2"
                component="a"
                sx={{
                  textDecoration: "underline",
                  textDecorationStyle: "dashed",
                  cursor: "help",
                  color: "inherit",
                }}
                href={navigation.faq.multiFabric}
                target="_blank"
              >
                Commissioned
              </Typography>
            </Alert>
          </Box>
        )}
        <Box
          sx={{
            background: "white",
            p: "9px",
            pb: "2.6px",
            borderRadius: 1,
          }}
        >
          <QRCodeSVG
            value={props.bridge.commissioning.qrPairingCode}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const BasicInfo = (props: { bridge: BridgeDataWithMetadata }) => {
  const fabrics = props.bridge.commissioning?.fabrics ?? [];
  return (
    <Table size="small">
      <TableBody>
        <InfoRow label="ID" value={props.bridge.id} copiable={props.bridge.id} mono />
        <InfoRow label="Name" value={props.bridge.name} />
        <InfoRow label="Port" value={props.bridge.port} />
        <TableRow sx={{ "&:last-child td": { borderBottom: 0 } }}>
          <TableCell
            sx={{ py: 0.75, px: 1, color: "text.secondary", whiteSpace: "nowrap" }}
          >
            <Typography variant="caption" fontWeight={600}>
              Fabrics
            </Typography>
          </TableCell>
          <TableCell sx={{ py: 0.75, px: 1 }}>
            {fabrics.length > 0 ? (
              <Box sx={{ fontSize: "1.4em", display: "flex", gap: 0.5 }}>
                <FabricList fabrics={fabrics} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled">
                None
              </Typography>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

const CommissioningInfo = (props: { bridge: BridgeDataWithMetadata }) => {
  if (!props.bridge.commissioning) {
    return null;
  }
  const c = props.bridge.commissioning;
  return (
    <Table size="small">
      <TableBody>
        <InfoRow label="Passcode" value={c.passcode} copiable={String(c.passcode)} mono />
        <InfoRow label="Discriminator" value={c.discriminator} mono />
        <InfoRow
          label="Manual Pairing Code"
          value={c.manualPairingCode}
          copiable={c.manualPairingCode}
          mono
        />
        <InfoRow
          label="QR Pairing Code"
          value={c.qrPairingCode}
          copiable={c.qrPairingCode}
          mono
        />
      </TableBody>
    </Table>
  );
};
