# Home-Assistant-Matter-Hub

!["Home-Assistant-Matter-Hub"](./docs/assets/hamh-logo-small.png)

**Expose your Home Assistant devices to any Matter-compatible controller — Google Home, Apple Home, Amazon Alexa, Samsung SmartThings and more — using local communication only.**

[![GitHub Release](https://img.shields.io/github/v/release/Lux-Corp-Sp-z-o-o/home-assistant-matter-hub?style=flat-square)](https://github.com/Lux-Corp-Sp-z-o-o/home-assistant-matter-hub/releases)
[![License](https://img.shields.io/github/license/Lux-Corp-Sp-z-o-o/home-assistant-matter-hub?style=flat-square)](LICENSE)

---

> [!NOTE]
> **Project continuation**
>
> This project is actively maintained again.
> We're continuing development with a focus on polish, stability, and a great user experience.
>
> **Credits**
> Huge thanks to **t0bst4r** for creating Home-Assistant-Matter-Hub and building the foundation we're extending.
> We're honored to carry it forward and **we'll make it great**.

---

## What is this?

Home-Assistant-Matter-Hub creates Matter bridges that publish your Home Assistant entities to any Matter-compatible controller. Because Matter works over your local network, there is **no cloud dependency, no port forwarding, and no latency penalty**.

### Key features

- **One bridge, many controllers** — connect a single bridge to Google Home, Apple Home *and* Alexa simultaneously
- **20+ entity domains** — lights, switches, climate, covers, fans, locks, sensors, vacuums, and more
- **Custom names (aliases)** — override entity names per-bridge so each controller sees the name you want
- **Simple Web UI** — create bridges, pick entities, scan QR codes, all from the browser
- **Runs anywhere** — Home Assistant Add-on, Docker, or bare-metal Node.js

---

## Supported controllers

| Controller | Status |
|---|---|
| Google Home | ✅ Fully supported |
| Apple Home | ✅ Fully supported |
| Amazon Alexa | ✅ Supported (port 5540 required) |
| Samsung SmartThings | ✅ Supported |
| Other Matter controllers | ✅ Should work |

---

## Supported device types

| HA Domain | Matter Device | Notes |
|---|---|---|
| `light` | Light (on/off, dimmable, color temp, extended color) | Auto-detected from features |
| `switch` | On/Off Plug-in Unit | |
| `climate` | Thermostat | heat, cool, heat_cool modes |
| `cover` | Window Covering | |
| `fan` | Fan | |
| `lock` | Door Lock | |
| `sensor` | Temperature / Humidity / Light Sensor | Based on `device_class` and unit |
| `binary_sensor` | Contact / Occupancy / Water Leak Sensor | Based on `device_class` |
| `vacuum` | Robotic Vacuum Cleaner | Apple Home only (iOS 18.4+) |
| `media_player` | Speaker | Limited controller support |
| `automation` / `scene` / `script` / `input_boolean` / `button` / `input_button` / `humidifier` | On/Off Plug-in Unit | |

See [Supported Device Types](./docs/Supported%20Device%20Types.md) for full details.

---

## Installation

### Option 1 — Home Assistant Add-on (recommended)

This is the easiest way. **Requires Home Assistant OS or Supervised.**

#### Step 1: Add the repository

1. In Home Assistant, go to **Settings → Add-ons → Add-on Store**.
2. Click the **⋮** (three dots) in the top-right → **Repositories**.
3. Paste the URL below and click **Add**:

```
https://github.com/Lux-Corp-Sp-z-o-o/home-assistant-matter-hub
```

4. Close the dialog and **refresh** the page (pull down or press F5).

#### Step 2: Install and start

1. Find **Matter Bridge Pro** in the Add-on Store and click it.
2. Click **Install** (this may take a minute).
3. After installation, click **Start**.
4. Click **Open Web UI** to access the dashboard.

#### Step 3: Create a bridge

1. Go to **Bridges → Create New**.
2. Set a **Name**, keep the default **Port** (5540), and choose a **Country Code** if needed.
3. In **Entity selection**, tick the entities you want to expose.
4. Optionally set a **Custom name** for any included entity.
5. Click **Save**.

#### Step 4: Pair with your controller

1. Open the bridge details page.
2. Scan the **QR code** (or copy the **Manual pairing code**) with your controller app (Google Home / Apple Home / Alexa).
3. Done — your devices appear in the controller.

> [!TIP]
> You can connect the same bridge to **multiple controllers** at the same time.
> See the [Multi-Fabric guide](./docs/Guides/Connect%20Multiple%20Fabrics.md).

---

### Option 2 — Docker

> [!WARNING]
> Make sure IPv6 and `host` networking are enabled. Matter relies on mDNS over IPv6.

```yaml
# docker-compose.yml
services:
  matter-hub:
    image: ghcr.io/lux-corp-sp-z-o-o/home-assistant-matter-hub:latest
    restart: unless-stopped
    network_mode: host
    environment:
      - HAMH_HOME_ASSISTANT_URL=http://YOUR_HA_IP:8123/
      - HAMH_HOME_ASSISTANT_ACCESS_TOKEN=YOUR_LONG_LIVED_TOKEN
      - HAMH_LOG_LEVEL=info
      - HAMH_HTTP_PORT=8482
    volumes:
      - ./hamh-data:/data
```

```bash
docker compose up -d
```

Then open `http://YOUR_HOST_IP:8482` and follow the bridge creation steps above.

<details>
<summary><strong>How to create a Long-Lived Access Token</strong></summary>

1. In Home Assistant, click your profile picture (bottom-left).
2. Scroll to **Long-Lived Access Tokens**.
3. Click **Create Token**, give it a name, and copy the token.

</details>

---

### Option 3 — npm (manual)

```bash
npm install -g home-assistant-matter-hub

home-assistant-matter-hub start \
  --home-assistant-url="http://YOUR_HA_IP:8123/" \
  --home-assistant-access-token="YOUR_TOKEN" \
  --log-level=info \
  --http-port=8482
```

Data is stored in `$HOME/.home-assistant-matter-hub` by default.

---

## Configuration reference

All options work as CLI flags **or** environment variables (prefix with `HAMH_`, uppercase, underscores):

| Flag | Env Variable | Default | Description |
|---|---|---|---|
| `--log-level` | `HAMH_LOG_LEVEL` | `info` | `silly` / `debug` / `info` / `warn` / `error` |
| `--http-port` | `HAMH_HTTP_PORT` | `8482` | Web UI port |
| `--storage-location` | `HAMH_STORAGE_LOCATION` | `$HOME/.home-assistant-matter-hub` | Data directory |
| `--mdns-network-interface` | `HAMH_MDNS_NETWORK_INTERFACE` | *(all)* | Limit mDNS to one NIC |
| `--home-assistant-url` | `HAMH_HOME_ASSISTANT_URL` | — | HA URL *(required for Docker/npm)* |
| `--home-assistant-access-token` | `HAMH_HOME_ASSISTANT_ACCESS_TOKEN` | — | HA token *(required for Docker/npm)* |
| `--http-auth-username` | `HAMH_HTTP_AUTH_USERNAME` | — | Basic-auth username |
| `--http-auth-password` | `HAMH_HTTP_AUTH_PASSWORD` | — | Basic-auth password |

> Add-on users: these are configured automatically. Only `log_level` and `mdns_network_interface` are exposed in the Add-on settings.

---

## Tips and troubleshooting

- **Alexa** requires port `5540`. You can only connect one bridge at a time on that port.
- **Sensors not appearing?** Check the entity's `device_class` and unit — only temperature (°C/°F), humidity (%), and illuminance (lx) are supported.
- **Names look wrong?** Set a **Custom name** in the entity filter, or rename the entity in Home Assistant.
- **Labels/areas don't match?** HA uses slugs internally. Run `{{ labels() }}` in Developer Tools → Template to see actual slugs.
- **Multi-VLAN?** Ensure mDNS/UDP packets are routed between VLANs.
- **Vacuum not showing in Apple Home?** All Home Hubs must be on iOS/tvOS/AudioOS 18.4+.

See the [Connectivity Issues guide](./docs/Guides/Connectivity%20Issues.md) and [FAQ](./docs/Frequently%20Asked%20Questions.md) for more.

---

## Documentation

Full docs: [t0bst4r.github.io/home-assistant-matter-hub](https://t0bst4r.github.io/home-assistant-matter-hub)

- [Bridge Configuration](./docs/Getting%20Started/Bridge%20Configuration.md)
- [Supported Device Types](./docs/Supported%20Device%20Types.md)
- [Connect Multiple Fabrics](./docs/Guides/Connect%20Multiple%20Fabrics.md)
- [Reverse Proxy setup](./docs/Guides/Reverse%20Proxy.md)

---

## Contributing

Contributions are welcome! This is a [pnpm](https://pnpm.io/) monorepo using TypeScript, React (frontend), and [Matter.js](https://github.com/project-chip/matter.js) (backend).

```bash
git clone https://github.com/Lux-Corp-Sp-z-o-o/home-assistant-matter-hub.git
cd home-assistant-matter-hub
pnpm install
pnpm run build
pnpm run serve   # starts dev servers
```

See the [Developer Documentation](./docs/Developer%20Documentation/README.md) for architecture details.

---

## License

[Apache-2.0](./LICENSE)

