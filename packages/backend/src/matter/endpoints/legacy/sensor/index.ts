import {
  type SensorDeviceAttributes,
  SensorDeviceClass,
} from "@home-assistant-matter-hub/common";
import type { EndpointType } from "@matter/main";
import type { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { HumiditySensorType } from "./devices/humidity-sensor.js";
import { IlluminanceSensorType } from "./devices/illuminance-sensor.js";
import { TemperatureSensorType } from "./devices/temperature-sensor.js";

export function SensorDevice(
  homeAssistantEntity: HomeAssistantEntityBehavior.State,
): EndpointType | undefined {
  const attributes = homeAssistantEntity.entity.state
    .attributes as SensorDeviceAttributes;
  const deviceClass = attributes.device_class;
  const unit =
    typeof attributes.unit_of_measurement === "string"
      ? attributes.unit_of_measurement.toLowerCase()
      : undefined;

  if (deviceClass === SensorDeviceClass.temperature) {
    return TemperatureSensorType.set({ homeAssistantEntity });
  }
  if (deviceClass === SensorDeviceClass.humidity) {
    return HumiditySensorType.set({ homeAssistantEntity });
  }
  if (deviceClass === SensorDeviceClass.illuminance) {
    return IlluminanceSensorType.set({ homeAssistantEntity });
  }
  if (unit === "°c" || unit === "°f" || unit === "c" || unit === "f") {
    return TemperatureSensorType.set({ homeAssistantEntity });
  }
  if (unit === "%") {
    return HumiditySensorType.set({ homeAssistantEntity });
  }
  if (unit === "lx" || unit === "lux") {
    return IlluminanceSensorType.set({ homeAssistantEntity });
  }
  return undefined;
}
