import {
  ClusterId,
  type EndpointData,
} from "@home-assistant-matter-hub/common";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

export interface EndpointStateProps {
  endpoint: EndpointData;
}

const ignoredBehaviors = [ClusterId.homeAssistantEntity];

/** Extract key highlights from known behaviors for quick-glance display */
function extractHighlights(
  state: Record<string, unknown>,
): { label: string; value: string; color: "success" | "error" | "info" | "default" }[] {
  const highlights: { label: string; value: string; color: "success" | "error" | "info" | "default" }[] = [];
  const s = state as Record<string, Record<string, unknown>>;

  // On/Off
  if (s.onOff && typeof s.onOff.onOff === "boolean") {
    highlights.push({
      label: s.onOff.onOff ? "On" : "Off",
      value: "",
      color: s.onOff.onOff ? "success" : "default",
    });
  }

  // Reachable
  if (s.bridgedDeviceBasicInformation && typeof s.bridgedDeviceBasicInformation.reachable === "boolean") {
    highlights.push({
      label: s.bridgedDeviceBasicInformation.reachable ? "Reachable" : "Unreachable",
      value: "",
      color: s.bridgedDeviceBasicInformation.reachable ? "success" : "error",
    });
  }

  // Level / brightness
  if (s.levelControl && typeof s.levelControl.currentLevel === "number") {
    const pct = Math.round((s.levelControl.currentLevel as number / 254) * 100);
    highlights.push({ label: `Brightness ${pct}%`, value: "", color: "info" });
  }

  // Temperature
  if (s.temperatureMeasurement && typeof s.temperatureMeasurement.measuredValue === "number") {
    const temp = ((s.temperatureMeasurement.measuredValue as number) / 100).toFixed(1);
    highlights.push({ label: `${temp} °C`, value: "", color: "info" });
  }

  // Thermostat
  if (s.thermostat) {
    if (typeof s.thermostat.localTemperature === "number") {
      const temp = ((s.thermostat.localTemperature as number) / 100).toFixed(1);
      highlights.push({ label: `Current ${temp} °C`, value: "", color: "info" });
    }
    if (typeof s.thermostat.systemMode === "number") {
      const modes: Record<number, string> = {
        0: "Off", 1: "Auto", 3: "Cool", 4: "Heat", 5: "Emergency Heat", 7: "Fan Only", 8: "Dry", 9: "Sleep",
      };
      highlights.push({
        label: `Mode: ${modes[s.thermostat.systemMode as number] ?? "Unknown"}`,
        value: "",
        color: "default",
      });
    }
  }

  // Humidity
  if (s.relativeHumidityMeasurement && typeof s.relativeHumidityMeasurement.measuredValue === "number") {
    const hum = ((s.relativeHumidityMeasurement.measuredValue as number) / 100).toFixed(0);
    highlights.push({ label: `${hum}% RH`, value: "", color: "info" });
  }

  return highlights;
}

export const EndpointState = (props: EndpointStateProps) => {
  const allBehaviors = useMemo(
    () =>
      Object.keys(
        props.endpoint.state,
      ) as (keyof typeof props.endpoint.state)[],
    [props.endpoint],
  );
  const behaviors = useMemo(
    () => allBehaviors.filter((it) => !ignoredBehaviors.includes(it)).sort(),
    [allBehaviors],
  );
  const metadata = useMemo(
    () => ({
      "Endpoint ID": props.endpoint.id.local,
      "Endpoint Type": `${props.endpoint.type.name} (${props.endpoint.type.id})`,
      "Endpoint Number": props.endpoint.endpoint,
      "# of Child Endpoints": props.endpoint.parts.length,
    }),
    [props.endpoint],
  );
  const highlights = useMemo(
    () => extractHighlights(props.endpoint.state as Record<string, unknown>),
    [props.endpoint.state],
  );

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" fontWeight={600}>
              About this endpoint
            </Typography>
          </Box>
          <ObjectTable value={metadata} hideHead />
          {highlights.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {highlights.map((h, i) => (
                <Chip
                  key={i}
                  label={h.label}
                  size="small"
                  color={h.color}
                  variant={h.color === "default" ? "outlined" : "filled"}
                  icon={
                    h.color === "success" ? (
                      <CheckCircleIcon />
                    ) : h.color === "error" ? (
                      <HighlightOffIcon />
                    ) : undefined
                  }
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      {behaviors.map((behavior) => (
        <Accordion key={behavior} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={500}>
              {behavior}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <ObjectTable value={props.endpoint.state[behavior]} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

const ObjectTable = <T extends object>(props: {
  value: T;
  hideHead?: boolean;
}) => {
  const properties = useMemo(
    () => Object.keys(props.value) as (keyof T & string)[],
    [props.value],
  );
  return (
    <TableContainer>
      <Table size="small">
        {!props.hideHead && (
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {properties.map((property) => (
            <TableRow
              key={property}
              sx={{
                "&:nth-of-type(odd)": {
                  bgcolor: "action.hover",
                },
                "&:last-child td": { borderBottom: 0 },
              }}
            >
              <TableCell sx={{ color: "text.secondary", py: 0.75 }}>
                {property}
              </TableCell>
              <TableCell sx={{ py: 0.75 }}>
                <RenderProperty property={props.value[property]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const RenderProperty = (props: { property: unknown }) => {
  const value = useMemo(() => {
    if (typeof props.property === "string") {
      return props.property.toString();
    } else if (typeof props.property === "number") {
      return props.property.toString();
    } else if (typeof props.property === "boolean") {
      return String(props.property);
    } else {
      return JSON.stringify(props.property);
    }
  }, [props.property]);
  return (
    <Typography fontFamily="monospace" fontSize="0.85em">
      {value}
    </Typography>
  );
};
