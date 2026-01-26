import {
  type CreateBridgeRequest,
  createBridgeRequestSchema,
  type HomeAssistantEntityListItem,
  type UpdateBridgeRequest,
  updateBridgeRequestSchema,
} from "@home-assistant-matter-hub/common";
import { Ajv } from "ajv";
import express from "express";
import type { BridgeService } from "../services/bridges/bridge-service.js";
import type { HomeAssistantRegistry } from "../services/home-assistant/home-assistant-registry.js";
import { endpointToJson } from "../utils/json/endpoint-to-json.js";

const ajv = new Ajv();

export function matterApi(
  bridgeService: BridgeService,
  homeAssistantRegistry: HomeAssistantRegistry,
): express.Router {
  const router = express.Router();
  router.get("/", (_, res) => {
    res.status(200).json({});
  });

  router.get("/bridges", async (_, res) => {
    res.status(200).json(bridgeService.bridges.map((b) => b.data));
  });

  router.get("/registry/entities", async (_, res) => {
    const entities = homeAssistantRegistry.entities;
    const devices = homeAssistantRegistry.devices;
    const states = homeAssistantRegistry.states;

    const list: HomeAssistantEntityListItem[] = Object.values(entities).map(
      (entity) => {
        const domain = entity.entity_id.split(".")[0] ?? "";
        const state = states[entity.entity_id];
        const friendlyName =
          (state?.attributes as { friendly_name?: string } | undefined)
            ?.friendly_name ??
          entity.name ??
          entity.original_name ??
          entity.entity_id;
        const device = entity.device_id ? devices[entity.device_id] : undefined;
        return {
          entity_id: entity.entity_id,
          name: friendlyName,
          domain,
          platform: entity.platform,
          area_id: entity.area_id,
          device_id: entity.device_id,
          device_name: device?.name ?? device?.name_by_user ?? undefined,
          entity_category:
            typeof entity.entity_category === "string"
              ? entity.entity_category
              : undefined,
          disabled_by:
            typeof entity.disabled_by === "string" ? entity.disabled_by : undefined,
          hidden_by:
            typeof entity.hidden_by === "string" ? entity.hidden_by : undefined,
        };
      },
    );

    list.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    res.status(200).json(list);
  });

  router.post("/bridges", async (req, res) => {
    const body = req.body as CreateBridgeRequest;
    const isValid = ajv.validate(createBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else {
      const bridge = await bridgeService.create(body);
      res.status(200).json(bridge.data);
    }
  });

  router.get("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.get(bridgeId);
    if (bridge) {
      res.status(200).json(bridge.data);
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.put("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const body = req.body as UpdateBridgeRequest;
    const isValid = ajv.validate(updateBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else if (bridgeId !== body.id) {
      res.status(400).send("Path variable `bridgeId` does not match `body.id`");
    } else {
      const bridge = await bridgeService.update(body);
      if (!bridge) {
        res.status(404).send("Not Found");
      } else {
        res.status(200).json(bridge.data);
      }
    }
  });

  router.delete("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    await bridgeService.delete(bridgeId);
    res.status(204).send();
  });

  router.get("/bridges/:bridgeId/actions/factory-reset", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      await bridge.factoryReset();
      await bridge.start();
      res.status(200).json(bridge.data);
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.get("/bridges/:bridgeId/devices", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      res.status(200).json(endpointToJson(bridge.server));
    } else {
      res.status(404).send("Not Found");
    }
  });

  return router;
}
