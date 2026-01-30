# Home-Assistant-Matter-Hub

!["Home-Assistant-Matter-Hub"](./docs/assets/hamh-logo-small.png)

---

> [!NOTE]
> **Project continuation**
>
> This project is actively maintained again.
> We’re continuing development with a focus on polish, stability, and a great user experience.
>
> **Credits**
> Huge thanks to **t0bst4r** for creating Home-Assistant-Matter-Hub and building the foundation we’re extending.
> We’re honored to carry it forward and **we’ll make it great**.


---

## About

This project simulates bridges to publish your entities from Home Assistant to any Matter-compatible controller like
Alexa, Apple Home or Google Home. Using Matter, those can be connected easily using local communication without the need
of port forwarding etc.

---

## Documentation

Please see the [documentation](https://t0bst4r.github.io/home-assistant-matter-hub) for installation instructions,
known issues, limitations and guides.

---

## Quick tutorial (Home Assistant Add-on)

### Prerequisites
- Home Assistant OS or Supervised (Add-ons required)
- A Matter controller (Google Home / Apple Home / Alexa)
- Home Assistant updated to a recent version

### Install the add-on
1. Open **Settings → Add-ons → Add-on Store → Repositories**.
2. Add this repository URL.
3. Find **Matter Bridge Pro**, install it, and start the add-on.

### Create your first bridge
1. Open the add-on UI and go to **Bridges → Create New**.
2. Set:
	- **Name**: Friendly name for your bridge
	- **Port**: Unique port (default 5540 is fine)
	- **Country Code**: Optional; only needed if commissioning fails
3. **Entity selection**:
	- Use **Domain** filter (e.g., lights only).
	- Use **Search** to find specific devices.
	- Tick entities under **Include**.
	- (Optional) Set **Custom name** for any included entity.
4. Click **Save**.

### Commission in your Matter controller
1. Open the bridge details page.
2. Use the **QR code** or **Manual pairing code**.
3. Add the bridge to Google Home / Apple Home / Alexa.

### Updating selections
- Changes take effect after saving the bridge.
- If names or labels don’t update immediately, restart the add-on.

### Tips & troubleshooting
- Use **Selected only** to review your inclusion list quickly.
- If a sensor doesn’t appear, check its **device_class** or unit (°C/°F, %, lux).
- If Google Home shows a generic name, set a **Custom name** in the entity list.
- For labels/areas, see the documentation link below.

