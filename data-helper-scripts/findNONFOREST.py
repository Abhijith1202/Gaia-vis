import json
import csv

with open("dataset2.json", 'r') as f:
    data = json.load(f)

with open("forest-area-as-share-of-land-area.csv",'r') as f2:
	csvreader=csv.reader(f2)
	header=next(csvreader)
	rows=[]
	for row in csvreader:
		rows.append(row)


# for each country
numfound = 0
numnot = 0
for country in data['features']:	
	if country['properties']['FOREST2020']<100:
		print(country['properties']['SOVEREIGNT'])