import {
  HomeAssistantDomain,
  type HomeAssistantEntityListItem,
  type HomeAssistantFilter,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbOnOutlined from "@mui/icons-material/DoNotDisturbOnOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

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
  return new Set(
    list
      .filter((m: HomeAssistantFilter["include"][number]) => m.type === type)
      .map((m: HomeAssistantFilter["include"][number]) => m.value),
  );
}

function getEntityAlias(
  list: HomeAssistantFilter["include"],
  entityId: string,
): string {
  const matcher = list.find(
    (item) => item.type === HomeAssistantMatcherType.Entity && item.value === entityId,
  );
  return typeof matcher?.alias === "string" ? matcher.alias : "";
}

function updateMatcherList(
  list: HomeAssistantFilter["include"],
  type: HomeAssistantMatcherType,
  values: string[],
): HomeAssistantFilter["include"] {
  const remaining = list.filter(
    (m: HomeAssistantFilter["include"][number]) => m.type !== type,
  );
  const next = values.map((value) => ({ type, value }));
  return [...remaining, ...next];
}

function updateEntityMatchers(
  list: HomeAssistantFilter["include"],
  values: string[],
): HomeAssistantFilter["include"] {
  const aliasMap = new Map(
    list
      .filter((item) => item.type === HomeAssistantMatcherType.Entity)
      .map((item) => [item.value, item.alias]),
  );
  const remaining = list.filter(
    (item) => item.type !== HomeAssistantMatcherType.Entity,
  );
  const next = values.map((value) => ({
    type: HomeAssistantMatcherType.Entity,
    value,
    alias: aliasMap.get(value),
  }));
  return [...remaining, ...next];
}

export const BridgeFilterEditor = (props: BridgeFilterEditorProps) => {
  const filter = normalizeFilter(props.value);
  const [entities, setEntities] = useState<HomeAssistantEntityListItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false);

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

  const includeEntities = getMatcherValues(
    filter.include,
    HomeAssistantMatcherType.Entity,
  );
  const excludeEntities = getMatcherValues(
    filter.exclude,
    HomeAssistantMatcherType.Entity,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("api/matter/registry/entities")
      .then((res) => res.json())
      .then((list: HomeAssistantEntityListItem[]) => {
        if (!cancelled) {
          setEntities(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntities([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEntities = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = entities;
    if (domainFilter !== "all") {
      list = list.filter((entity) => entity.domain === domainFilter);
    }
    if (showSelectedOnly) {
      list = list.filter(
        (entity) =>
          includeEntities.has(entity.entity_id) ||
          excludeEntities.has(entity.entity_id),
      );
    }
    if (!query) return list;
    return list.filter((entity: HomeAssistantEntityListItem) => {
      const haystack = `${entity.name} ${entity.entity_id} ${entity.device_name ?? ""} ${entity.domain}`
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [
    entities,
    search,
    domainFilter,
    showSelectedOnly,
    includeEntities,
    excludeEntities,
  ]);

  const domainOptions = useMemo(() => {
    const values = new Set(entities.map((entity) => entity.domain));
    return ["all", ...[...values].sort()];
  }, [entities]);

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

  const toggleEntity = (entityId: string, mode: "include" | "exclude") => {
    const includeValues = new Set(includeEntities);
    const excludeValues = new Set(excludeEntities);
    const current = mode === "include" ? includeValues : excludeValues;
    if (current.has(entityId)) {
      current.delete(entityId);
    } else {
      current.add(entityId);
      if (mode === "include") excludeValues.delete(entityId);
      if (mode === "exclude") includeValues.delete(entityId);
    }

    props.onChange({
      include: updateEntityMatchers(filter.include, [...includeValues]),
      exclude: updateMatcherList(
        filter.exclude,
        HomeAssistantMatcherType.Entity,
        [...excludeValues],
      ),
    });
  };

  const setEntityAlias = (entityId: string, alias: string) => {
    const trimmed = alias.trim();
    const nextInclude = filter.include
      .filter((item) => item.type !== HomeAssistantMatcherType.Entity)
      .concat(
        [...includeEntities].map((value) => {
          const existingAlias = getEntityAlias(filter.include, value);
          return {
            type: HomeAssistantMatcherType.Entity,
            value,
            alias: value === entityId ? trimmed || undefined : existingAlias || undefined,
          };
        }),
      );

    props.onChange({
      include: nextInclude,
      exclude: filter.exclude,
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "divider",
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
      }}
    >
      <CardHeader
        title="Entity selection"
        subheader="Pick exactly what appears in Matter/Google Home."
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              color="success"
              label={`Included ${includeEntities.size}`}
            />
            <Chip
              size="small"
              color="error"
              label={`Excluded ${excludeEntities.size}`}
            />
          </Stack>
        }
      />
      <CardContent>
        <Stack spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1">Entities</Typography>
              <Chip size="small" label="Type: entity" />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="entity-domain-filter">Domain</InputLabel>
                  <Select
                    labelId="entity-domain-filter"
                    value={domainFilter}
                    label="Domain"
                    onChange={(event: SelectChangeEvent) =>
                      setDomainFilter(event.target.value)
                    }
                  >
                    {domainOptions.map((domain) => (
                      <MenuItem key={domain} value={domain}>
                        {domain === "all" ? "All domains" : titleCase(domain)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Search entities"
                  helperText="Search by name, entity_id, device name"
                  value={search}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setSearch(event.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showSelectedOnly}
                      onChange={(event) =>
                        setShowSelectedOnly(event.target.checked)
                      }
                    />
                  }
                  label="Selected only"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutline fontSize="small" color="success" />
                  <Typography variant="body2">Include list</Typography>
                </Stack>
                <Box
                  sx={{
                    maxHeight: 360,
                    overflow: "auto",
                    mt: 1,
                    pr: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1} sx={{ p: 1 }}>
                    {filteredEntities.map((entity: HomeAssistantEntityListItem) => {
                      const checked = includeEntities.has(entity.entity_id);
                      return (
                        <Box
                          key={`include-entity-${entity.entity_id}`}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            columnGap: 1,
                            alignItems: "start",
                          }}
                        >
                          <Checkbox
                            checked={checked}
                            onChange={() =>
                              toggleEntity(entity.entity_id, "include")
                            }
                          />
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {`${entity.name} (${entity.entity_id})${
                                entity.device_name
                                  ? ` • ${entity.device_name}`
                                  : ""
                              }`}
                            </Typography>
                            {checked && (
                              <TextField
                                size="small"
                                label="Custom name"
                                placeholder="Optional"
                                value={getEntityAlias(
                                  filter.include,
                                  entity.entity_id,
                                )}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                  setEntityAlias(
                                    entity.entity_id,
                                    event.target.value,
                                  )
                                }
                              />
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                    {filteredEntities.length === 0 && (
                      <Typography variant="body2" sx={{ px: 2, py: 1 }}>
                        No entities match your filters.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DoNotDisturbOnOutlined fontSize="small" color="error" />
                  <Typography variant="body2">Exclude list</Typography>
                </Stack>
                <Box
                  sx={{
                    maxHeight: 360,
                    overflow: "auto",
                    mt: 1,
                    pr: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <FormGroup>
                    {filteredEntities.map((entity: HomeAssistantEntityListItem) => (
                      <FormControlLabel
                        key={`exclude-entity-${entity.entity_id}`}
                        control={
                          <Checkbox
                            checked={excludeEntities.has(entity.entity_id)}
                            onChange={() =>
                              toggleEntity(entity.entity_id, "exclude")
                            }
                          />
                        }
                        label={
                          `${entity.name} (${entity.entity_id})${
                            entity.device_name
                              ? ` • ${entity.device_name}`
                              : ""
                          }`
                        }
                      />
                    ))}
                    {filteredEntities.length === 0 && (
                      <Typography variant="body2" sx={{ px: 2, py: 1 }}>
                        No entities match your filters.
                      </Typography>
                    )}
                  </FormGroup>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Accordion variant="outlined" sx={{ borderRadius: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Advanced rules</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">Domains</Typography>
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
                    <Typography variant="subtitle2">Entity Categories</Typography>
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
                                onChange={() =>
                                  toggleCategory(category, "include")
                                }
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
                                onChange={() =>
                                  toggleCategory(category, "exclude")
                                }
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
            </AccordionDetails>
          </Accordion>
        </Stack>
      </CardContent>
    </Card>
  );
};