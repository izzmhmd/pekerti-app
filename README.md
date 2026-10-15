# 🌾 PEKERTI App (SI-PEKERTI)
### Integrated Agricultural Drought Monitoring Application Using Google Earth Engine

<p align="left">
  <!-- Status Badges -->
  <a href="https://izzmhmd53.users.earthengine.app/view/aplikasi-pemantauan-kekeringan-terintegrasi">
    <img src="https://img.shields.io/badge/Access_Here-0F9D58?style=for-the-badge&logo=google&logoColor=white" height="38" alt="Access Here">
  </a>
  <a href="https://github.com/izzmhmd/pekerti-app">
    <img src="https://img.shields.io/badge/Platform-Google_Earth_Engine-4285F4?style=for-the-badge&logo=googleearthengine&logoColor=white" height="38" alt="GEE">
  </a>
  <a href="https://github.com/izzmhmd/pekerti-app/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" height="38" alt="License">
  </a>
  <a href="https://youtu.be/1EK8fwICvbU?si=-2TE1xsw0HYbLvbv">
    <img src="https://img.shields.io/badge/Watch_Tutorial-FF0000?style=for-the-badge&logo=youtube&logoColor=white" height="38" alt="Watch Tutorial Video">
  </a>
</p>

**PEKERTI App (SI-PEKERTI)** is an interactive, cloud computing-based WebGIS application developed on **Google Earth Engine (GEE)**. Designed for smart agricultural disaster mitigation, it provides automated monitoring, analysis, and spatial mapping of agricultural drought conditions across Indonesian administrative regions without requiring complex offline remote sensing workflows.

---

## 📌 Key Features

- **📍 Location & Administrative Boundary Selector**: Search and filter drought conditions dynamically by Regency/City (*Kabupaten/Kota*) down to District/Sub-district (*Kecamatan*) levels.
- **📅 Date Range Filter**: Select custom observation dates to evaluate drought progression over time.
- **🌾 Crop Phase Filtering**: Filters drought indices specifically over active agricultural crop phases (Vegetative to Generative stages) to isolate crop-stress impact.
- **📊 Interactive Charts & Analytics**:
  - *Drought Area Statistics Chart*: Calculates total drought-affected area per regency and sub-district.
  - *Time Series Drought Chart*: Analyzes historical drought trend curves for specific pixel points.
- **🎨 Custom Layer & Legend Visualization**: Toggle between Drought Intensity Classes (NDDI), Crop Growth Stages, False Color Composite (RGB), and Administrative Boundaries.

---

## 📡 Datasets & Methodology

1. **Landsat 8 OLI/TIRS Surface Reflectance (30m)**
   - Used for computing **NDVI** (*Normalized Difference Vegetation Index*) and **NDWI** (*Normalized Difference Water Index*).
2. **Normalized Difference Drought Index (NDDI)**
   - Calculated using the combination of vegetation vigor and canopy water content:
     $$\text{NDDI} = \frac{\text{NDVI} - \text{NDWI}}{\text{NDVI} + \text{NDWI}}$$
3. **ESA WorldCover 10m**
   - Masking layer to constrain analysis exclusively to active agricultural land cover.

---

## 🚦 Drought Classification Standards

| Drought Class | NDDI Range | Description |
| :--- | :--- | :--- |
| **Normal** | $< 0.01$ | Optimal soil moisture and healthy vegetation |
| **Slight / Mild** | $0.01 - 0.15$ | Early water deficit stress |
| **Moderate** | $0.15 - 0.25$ | Moderate moisture stress affecting crop development |
| **Severe** | $0.25 - 1.00$ | High drought impact requiring agricultural intervention |
| **Extreme** | $> 1.00$ | Critical drought level causing crop failure risks |

---

## 🚀 How to Access the Application

Explore the live WebGIS dashboard directly from your web browser without installing any software:

👉 **[Access PEKERTI Web App](https://izzmhmd53.users.earthengine.app/view/aplikasi-pemantauan-kekeringan-terintegrasi)**

> 💡 **Usage Tip**: Access via PC/Desktop browser with a stable internet connection for the best layout rendering and responsive chart experience.

---

## 👤 Author & Developer

* **Izzuddin Muhammad** - *Geospatial Data Processor & Researcher*
  * GitHub: [@izzmhmd](https://github.com/izzmhmd)
  * LinkedIn: [Izzuddin Muhammad](https://www.linkedin.com/in/izzuddin-muhammad/)

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.
