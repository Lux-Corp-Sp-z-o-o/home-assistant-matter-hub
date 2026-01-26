import {
  HomeAssistantDomain,
  type HomeAssistantEntityListItem,
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

export const BridgeFilterEditor = (props: BridgeFilterEditorProps) => {
  const filter = normalizeFilter(props.value);
  const [entities, setEntities] = useState<HomeAssistantEntityListItem[]>([]);
  const [search, setSearch] = useState<string>("");

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
    if (!query) return entities;
    return entities.filter((entity: HomeAssistantEntityListItem) => {
      const haystack = `${entity.name} ${entity.entity_id} ${entity.device_name ?? ""} ${entity.domain}`
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [entities, search]);

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
      include: updateMatcherList(
        filter.include,
        HomeAssistantMatcherType.Entity,
        [...includeValues],
      ),
      exclude: updateMatcherList(
        filter.exclude,
        HomeAssistantMatcherType.Entity,
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

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1">Entities</Typography>
              <Chip size="small" label="Type: entity" />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <TextField
              size="small"
              fullWidth
              label="Search entities"
              value={search}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutline fontSize="small" color="success" />
                  <Typography variant="body2">Include</Typography>
                </Stack>
                <Box sx={{ maxHeight: 320, overflow: "auto", mt: 1 }}>
                  <FormGroup>
                    {filteredEntities.map((entity: HomeAssistantEntityListItem) => (
                      <FormControlLabel
                        key={`include-entity-${entity.entity_id}`}
                        control={
                          <Checkbox
                            checked={includeEntities.has(entity.entity_id)}
                            onChange={() =>
                              toggleEntity(entity.entity_id, "include")
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
                  </FormGroup>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DoNotDisturbOnOutlined fontSize="small" color="error" />
                  <Typography variant="body2">Exclude</Typography>
                </Stack>
                <Box sx={{ maxHeight: 320, overflow: "auto", mt: 1 }}>
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
                  </FormGroup>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};