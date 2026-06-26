import csv
import json
import numpy as np
from scipy.spatial import cKDTree
from geopy.distance import geodesic

'''
Memory-efficient: KD-tree doesn’t compute all pairwise distances.

Fast: scipy.spatial.cKDTree is highly optimized for nearest neighbor searches.

Scalable: Can handle tens of thousands of plants worldwide.

Keeps your original structure: Each plant has its 51 nearest neighbors with name, distance, lat, lon.
'''

# Number of neighbors
K_NEIGHBORS = 11

# CSV column indices based on your description
LAT_INDEX = 5
LON_INDEX = 6
NAME_INDEX = 2  # 'name' of the power plant

def read_csv(file_path):
    """Read CSV and return headers and data"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        for row in reader:
            data.append(row)
    return headers, data

def build_kdtree(data):
    """Build KD-tree from latitude and longitude"""
    coords = []
    for row in data:
        lat = float(row[LAT_INDEX])
        lon = float(row[LON_INDEX])
        coords.append([lat, lon])
    tree = cKDTree(coords)
    return tree, np.array(coords)

def find_nearest_neighbors_km(tree, coords, data, k=K_NEIGHBORS):
    """Find k nearest neighbors and calculate geodesic distances"""
    _, indices = tree.query(coords, k=k)
    neighbors_list = []

    for i, idx_list in enumerate(indices):
        point_neighbors = []
        lat1, lon1 = coords[i]
        for idx in idx_list:
            lat2, lon2 = coords[idx]
            distance_km = geodesic((lat1, lon1), (lat2, lon2)).kilometers
            neighbor = {
                'neighbor': data[idx][NAME_INDEX],
                'distance_km': distance_km,
                'latitude': lat2,
                'longitude': lon2
            }
            point_neighbors.append(neighbor)
        neighbors_list.append(point_neighbors)

    return neighbors_list

def save_to_json(headers, data, neighbors, output_file):
    """Save dataset with neighbors to JSON"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({'headers': headers, 'data': data, 'distances': neighbors},
                  f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    input_file = 'global_power_plant_database.csv'
    output_file = 'global_neighbors_11.json'

    headers, data = read_csv(input_file)
    print("CSV read successfully.")

    tree, coords = build_kdtree(data)
    print("KD-tree built.")

    neighbors = find_nearest_neighbors_km(tree, coords, data, k=K_NEIGHBORS)
    print("Nearest neighbors with distances calculated.")

    save_to_json(headers, data, neighbors, output_file)
    print(f"Saved to {output_file}.")