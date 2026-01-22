import geopandas as gpd
import json
import shapely.geometry

def main():
    print("Loading GDB...")
    try:
        # Read columns NAME_0 (Country), NAME_1 (State)
        gdf = gpd.read_file("gadm_410.gdb", layer='gadm', engine='pyogrio', columns=['NAME_0', 'NAME_1', 'geometry'])
    except Exception as e:
        print(f"Failed to read GDB: {e}")
        return

    regions = []

    print("Simplifying dataset for Country generation (Factor 0.5)...")
    # Simplify strictly for country generation to speed up dissolve
    # 0.5 deg is approx 55km.
    simple_gdf = gdf.copy()
    simple_gdf['geometry'] = simple_gdf.simplify(0.5, preserve_topology=True)

    print("Dissolving Countries...")
    countries_gdf = simple_gdf.dissolve(by='NAME_0')
    
    print("Exporting Countries...")
    for country_name, row in countries_gdf.iterrows():
        if not isinstance(country_name, str): continue
        if row.geometry is None: continue

        bounds = row.geometry.bounds
        json_geom = []
        if row.geometry.geom_type == 'Polygon':
            coords = list(row.geometry.exterior.coords)
            json_geom = [[[round(y, 2), round(x, 2)] for x, y in coords]]
        elif row.geometry.geom_type == 'MultiPolygon':
            for poly in row.geometry.geoms:
                coords = list(poly.exterior.coords)
                json_geom.append([[round(y, 2), round(x, 2)] for x, y in coords])
        
        regions.append({
            "name": country_name,
            "type": "Country",
            "bbox": [round(b, 2) for b in [bounds[1], bounds[0], bounds[3], bounds[2]]],
            "polygon": json_geom
        })

    print("Processing detailed States (US, CA, AU, UK, BR, IN, CN)...")
    target_countries = ['United States', 'Canada', 'Australia', 'United Kingdom', 'Brazil', 'India', 'China']
    
    # Use higher detail for states (0.2 deg ~ 22km)
    states_gdf = gdf[gdf['NAME_0'].isin(target_countries)].copy()
    states_gdf['geometry'] = states_gdf.simplify(0.2, preserve_topology=True)
    
    for idx, row in states_gdf.iterrows():
        name_1 = row['NAME_1']
        if not name_1: continue
        
        bounds = row.geometry.bounds
        json_geom = []
        if row.geometry.geom_type == 'Polygon':
            coords = list(row.geometry.exterior.coords)
            json_geom = [[[round(y, 2), round(x, 2)] for x, y in coords]]
        elif row.geometry.geom_type == 'MultiPolygon':
            for poly in row.geometry.geoms:
                coords = list(poly.exterior.coords)
                json_geom.append([[round(y, 2), round(x, 2)] for x, y in coords])

        regions.append({
            "name": name_1,
            "type": "State/Province",
            "country": row['NAME_0'],
            "bbox": [round(b, 2) for b in [bounds[1], bounds[0], bounds[3], bounds[2]]],
            "polygon": json_geom
        })

    # Add North America (Approximate union of US, CA, MX)
    # Simplify: Just a bounding box or manual polygon?
    # User requested "North America".
    regions.insert(0, {
        "name": "North America",
        "type": "Continent",
        "bbox": [5, -170, 85, -50],
        "polygon": [[[5, -170], [85, -170], [85, -50], [5, -50]]] # Box approximation for now
    })

    regions.insert(0, {
        "name": "World",
        "type": "Global",
        "bbox": [-90, -180, 90, 180],
        "polygon": [[[-90, -180], [90, -180], [90, 180], [-90, 180]]]
    })
    
    print(f"Total Regions: {len(regions)}")
    
    with open("regions_db.js", "w", encoding="utf-8") as f:
        f.write("const REGIONS = ")
        # Minimize JSON output?
        json.dump(regions, f)
        f.write(";\n")
        f.write("""
function isPointInPolygon(point, loops) {
    const lat = point[0], lon = point[1];
    let inside = false;
    for (const loop of loops) {
        let loopInside = false;
        for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
            const xi = loop[i][0], yi = loop[i][1];
            const xj = loop[j][0], yj = loop[j][1];
            const intersect = ((yi > lon) !== (yj > lon)) &&
                (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
            if (intersect) loopInside = !loopInside;
        }
        if (loopInside) { inside = true; break; }
    }
    return inside;
}
function filterRecordingsByRegion(recordings, regionName) {
    const region = REGIONS.find(r => r.name === regionName);
    if (!region || !region.polygon) return recordings;
    return recordings.filter(rec => {
        if (!rec.lat || !rec.lon) return false;
        const lat = parseFloat(rec.lat), lon = parseFloat(rec.lon);
        if (region.bbox && (lat < region.bbox[0] || lat > region.bbox[2] || lon < region.bbox[1] || lon > region.bbox[3])) return false;
        return isPointInPolygon([lat, lon], region.polygon);
    });
}
function getRegionParams(regionName) {
    const region = REGIONS.find(r => r.name === regionName);
    if (!region || !region.bbox) return "";
    return `box:${region.bbox[0]},${region.bbox[1]},${region.bbox[2]},${region.bbox[3]}`;
}
""")
    print("Done!")

if __name__ == "__main__":
    main()
