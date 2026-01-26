import {
  HomeAssistantDomain,
  type HomeAssistantFilter,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbOnOutlined from "@mui/icons-material/DoNotDisturbOnOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface BridgeFilterEditorProps {
  value: HomeAssistantFilter | undefined;
  onChange: (next: HomeAssistantFilter) => void;
}

const DOMAIN_OPTIONS = Object.values(
  HomeAssistantDomain,
) as HomeAssistantDomain[];
const ENTITY_CATEGORY_OPTIONS = ["config", "diagnostic"] as const;

function normalizeFilter(filter: HomeAssistantFilter | undefined) {
  return {
    include: filter?.include ?? [],
    exclude: filter?.exclude ?? [],
  } satisfies HomeAssistantFilter;
}

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

function getMatcherValues(
  list: HomeAssistantFilter["include"],
  type: HomeAssistantMatcherType,
): Set<string> {
  return new Set(list.filter((m) => m.type === type).map((m) => m.value));
}

function updateMatcherList(
  list: HomeAssistantFilter["include"],
  type: HomeAssistantMatcherType,
  values: string[],
): HomeAssistantFilter["include"] {
  const remaining = list.filter((m) => m.type !== type);
  const next = values.map((value) => ({ type, value }));
  return [...remaining, ...next];
}

export const BridgeFilterEditor = (props: BridgeFilterEditorProps) => {
  const filter = normalizeFilter(props.value);

  const includeDomains = getMatcherValues(
    filter.include,
    HomeAssistantMatcherType.Domain,
  );
  const excludeDomains = getMatcherValues(
    filter.exclude,
    HomeAssistantMatcherType.Domain,
  );

  const includeCategories = getMatcherValues(
    filter.include,
    HomeAssistantMatcherType.EntityCategory,
  );
  const excludeCategories = getMatcherValues(
    filter.exclude,
    HomeAssistantMatcherType.EntityCategory,
  );

  const toggleDomain = (domain: string, mode: "include" | "exclude") => {
    const includeValues = new Set(includeDomains);
    const excludeValues = new Set(excludeDomains);
    const current = mode === "include" ? includeValues : excludeValues;
    if (current.has(domain)) {
      current.delete(domain);
    } else {
      current.add(domain);
      if (mode === "include") excludeValues.delete(domain);
      if (mode === "exclude") includeValues.delete(domain);
    }

    props.onChange({
      include: updateMatcherList(
        filter.include,
        HomeAssistantMatcherType.Domain,
        [...includeValues],
      ),
      exclude: updateMatcherList(
        filter.exclude,
        HomeAssistantMatcherType.Domain,
        [...excludeValues],
      ),
    });
  };

  const toggleCategory = (
    category: (typeof ENTITY_CATEGORY_OPTIONS)[number],
    mode: "include" | "exclude",
  ) => {
    const includeValues = new Set(includeCategories);
    const excludeValues = new Set(excludeCategories);
    const current = mode === "include" ? includeValues : excludeValues;
    if (current.has(category)) {
      current.delete(category);
    } else {
      current.add(category);
      if (mode === "include") excludeValues.delete(category);
      if (mode === "exclude") includeValues.delete(category);
    }

    props.onChange({
      include: updateMatcherList(
        filter.include,
        HomeAssistantMatcherType.EntityCategory,
        [...includeValues],
      ),
      exclude: updateMatcherList(
        filter.exclude,
        HomeAssistantMatcherType.EntityCategory,
        [...excludeValues],
      ),
    });
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Quick filters"
        subheader="Select domains or entity categories with a single click."
      />
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1">Domains</Typography>
              <Chip size="small" label="Type: domain" />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutline fontSize="small" color="success" />
                  <Typography variant="body2">Include</Typography>
                </Stack>
                <FormGroup>
                  {DOMAIN_OPTIONS.map((domain) => (
                    <FormControlLabel
                      key={`include-${domain}`}
                      control={
                        <Checkbox
                          checked={includeDomains.has(domain)}
                          onChange={() => toggleDomain(domain, "include")}
                        />
                      }
                      label={titleCase(domain)}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DoNotDisturbOnOutlined fontSize="small" color="error" />
                  <Typography variant="body2">Exclude</Typography>
                </Stack>
                <FormGroup>
                  {DOMAIN_OPTIONS.map((domain) => (
                    <FormControlLabel
                      key={`exclude-${domain}`}
                      control={
                        <Checkbox
                          checked={excludeDomains.has(domain)}
                          onChange={() => toggleDomain(domain, "exclude")}
                        />
                      }
                      label={titleCase(domain)}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1">Entity Categories</Typography>
              <Chip size="small" label="Type: entity_category" />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutline fontSize="small" color="success" />
                  <Typography variant="body2">Include</Typography>
                </Stack>
                <FormGroup>
                  {ENTITY_CATEGORY_OPTIONS.map((category) => (
                    <FormControlLabel
                      key={`include-cat-${category}`}
                      control={
                        <Checkbox
                          checked={includeCategories.has(category)}
                          onChange={() => toggleCategory(category, "include")}
                        />
                      }
                      label={titleCase(category)}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DoNotDisturbOnOutlined fontSize="small" color="error" />
                  <Typography variant="body2">Exclude</Typography>
                </Stack>
                <FormGroup>
                  {ENTITY_CATEGORY_OPTIONS.map((category) => (
                    <FormControlLabel
                      key={`exclude-cat-${category}`}
                      control={
                        <Checkbox
                          checked={excludeCategories.has(category)}
                          onChange={() => toggleCategory(category, "exclude")}
                        />
                      }
                      label={titleCase(category)}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};