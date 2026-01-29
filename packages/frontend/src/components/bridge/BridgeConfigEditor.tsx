import {
  type BridgeConfig,
  bridgeConfigSchema,
  type HomeAssistantFilter,
} from "@home-assistant-matter-hub/common";
import { LibraryBooks, TextFields } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import type { JSONSchema7 } from "json-schema";
import { useCallback, useState } from "react";
import { navigation } from "../../routes.tsx";
import { BridgeFilterEditor } from "./BridgeFilterEditor.tsx";
import { FormEditor } from "../misc/editors/FormEditor";
import { JsonEditor } from "../misc/editors/JsonEditor";
import type { ValidationError } from "../misc/editors/validation-error.ts";

enum BridgeEditorMode {
  JSON_EDITOR = "JSON_EDITOR",
  FIELDS_EDITOR = "FIELDS_EDITOR",
}

export interface BridgeConfigEditorProps {
  bridgeId?: string;
  bridge: BridgeConfig;
  usedPorts: Record<number, string>;
  onSave: (config: BridgeConfig) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export const BridgeConfigEditor = (props: BridgeConfigEditorProps) => {
  const [editorMode, setEditorMode] = useState<BridgeEditorMode>(
    BridgeEditorMode.FIELDS_EDITOR,
  );
  const toggleEditor = () => {
    setEditorMode(
      editorMode === BridgeEditorMode.FIELDS_EDITOR
        ? BridgeEditorMode.JSON_EDITOR
        : BridgeEditorMode.FIELDS_EDITOR,
    );
  };

  const [config, setConfig] = useState<BridgeConfig | undefined>(() => ({
    ...props.bridge,
    filter: props.bridge.filter ?? { include: [], exclude: [] },
  }));
  const [isValid, setIsValid] = useState<boolean>(true);

  const validatePort = useCallback(
    (value: object | undefined): ValidationError[] => {
      const config = value as Partial<BridgeConfig> | undefined;
      if (!config?.port) {
        return [];
      }
      const usedBy = props.usedPorts[config.port];
      if (usedBy !== undefined && usedBy !== props.bridgeId) {
        return [
          {
            instancePath: "/port",
            message: `Port is already used by bridge with id ${usedBy}`,
          },
        ];
      }
      return [];
    },
    [props.bridgeId, props.usedPorts],
  );

  const onBaseChange = (data: object | undefined, isValid: boolean) => {
    const patch = (data ?? {}) as Partial<BridgeConfig>;
    setConfig((current: BridgeConfig | undefined) => ({
      ...(current ?? {}),
      ...patch,
    } as BridgeConfig));
    setIsValid(isValid);
  };

  const onFeatureFlagsChange = (data: object | undefined) => {
    const patch = (data ?? {}) as Partial<BridgeConfig>;
    setConfig((current: BridgeConfig | undefined) => ({
      ...(current ?? {}),
      ...patch,
    } as BridgeConfig));
  };

  const onFilterChange = (filter: HomeAssistantFilter) => {
    setConfig((current: BridgeConfig | undefined) => ({
      ...(current ?? {}),
      filter,
    } as BridgeConfig));
  };

  const baseSchema: JSONSchema7 = {
    type: "object",
    properties: {
      name: bridgeConfigSchema.properties?.name ?? {},
      port: bridgeConfigSchema.properties?.port ?? {},
      countryCode: bridgeConfigSchema.properties?.countryCode ?? {},
    },
    required: ["name", "port"],
    additionalProperties: false,
  };

  const featureFlagsSchema: JSONSchema7 = {
    type: "object",
    properties: {
      featureFlags: bridgeConfigSchema.properties?.featureFlags ?? {},
    },
    additionalProperties: false,
  };

  const baseUiSchema = {
    "ui:submitButtonOptions": { norender: true },
  };

  const featureFlagsUiSchema = {
    "ui:submitButtonOptions": { norender: true },
    featureFlags: {
      "ui:title": "",
      "ui:options": { label: false },
    },
  };

  const baseValue = {
    name: config?.name ?? "",
    port: config?.port ?? props.bridge.port,
    countryCode: config?.countryCode ?? "",
  };

  const featureFlagsValue = {
    featureFlags: config?.featureFlags ?? {},
  };

  const saveAction = async () => {
    if (!isValid) {
      return;
    }
    const normalized: BridgeConfig = {
      ...(config ?? props.bridge),
      filter: config?.filter ?? { include: [], exclude: [] },
    } as BridgeConfig;
    await props.onSave(normalized);
  };

  return (
    <>
      <Alert severity="info" variant="outlined">
        Need help? Check{" "}
        <Link href={navigation.faq.bridgeConfig} target="_blank">
          the bridge configuration guide
        </Link>{" "}
        for labels, areas, and other advanced tips.
      </Alert>

      <Stack spacing={2}>
        <Box display="flex" justifyContent={"flex-end"}>
          <Button
            onClick={() => toggleEditor()}
            title={
              editorMode === BridgeEditorMode.FIELDS_EDITOR
                ? "JSON editor"
                : "Form editor"
            }
          >
            {editorMode === BridgeEditorMode.FIELDS_EDITOR ? (
              <TextFields />
            ) : (
              <LibraryBooks />
            )}
          </Button>
        </Box>

        {editorMode === BridgeEditorMode.FIELDS_EDITOR && (
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Bridge settings"
                subheader="Basics for your Matter bridge"
              />
              <CardContent>
                <FormEditor
                  value={baseValue}
                  onChange={onBaseChange}
                  schema={baseSchema}
                  uiSchema={baseUiSchema}
                  customValidate={validatePort}
                />
              </CardContent>
            </Card>

            <BridgeFilterEditor
              value={config?.filter}
              onChange={onFilterChange}
            />

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Feature flags"
                subheader="Optional behavior tweaks"
              />
              <CardContent>
                <FormEditor
                  value={featureFlagsValue}
                  onChange={(data) => onFeatureFlagsChange(data)}
                  schema={featureFlagsSchema}
                  uiSchema={featureFlagsUiSchema}
                />
              </CardContent>
            </Card>
          </Stack>
        )}

        {editorMode === BridgeEditorMode.JSON_EDITOR && (
          <JsonEditor
            value={config ?? {}}
            onChange={onBaseChange}
            schema={bridgeConfigSchema}
            customValidate={validatePort}
          />
        )}

        <Divider sx={{ mt: 1 }} />
        <Grid container sx={{ mt: 2 }}>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={props.onCancel}
            >
              Cancel
            </Button>
          </Grid>
          <Grid
            size={{ xs: 0, sm: 4, md: 6 }}
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={!isValid}
              onClick={saveAction}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};
