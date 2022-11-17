import json
import csv

with open("dataset2.json", 'r') as f:
    data = json.load(f)

with open("forest-area-as-share-of-land-area.csv", 'r') as f2:
	csvreader = csv.reader(f2)
	header = next(csvreader)
	rows = []
	for row in csvreader:
		rows.append(row)


# for each country
for country in data['features']:
	for year in range(1990, 2021):
		key="FOREST"+str(year)
		if key not in country['properties'].keys():
			country['properties'][key] = 0
				


with open("dataset2.json", 'w+') as f:
    json.dump(data, f, indent=2)


				
